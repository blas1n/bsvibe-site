import Stripe from 'stripe';
import { upsertSubscription, recordPayment } from './subscription.repository';

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET;
const TOSS_SECRET_KEY = import.meta.env.TOSS_SECRET_KEY;
const TOSS_WEBHOOK_SECRET = import.meta.env.TOSS_WEBHOOK_SECRET;

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

export type PaymentProvider = 'toss' | 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!_stripe) {
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
  }
  return _stripe;
}

export function getProvider(locale: string): PaymentProvider {
  return locale === 'ko' ? 'toss' : 'stripe';
}

// ========== Checkout ==========

export interface CheckoutParams {
  provider: PaymentProvider;
  stripePriceId?: string | null;
  priceId: string;            // our internal price UUID
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export async function createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  if (params.provider === 'stripe') {
    return createStripeCheckout(params);
  }
  return createTossCheckout(params);
}

async function createStripeCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  if (!params.stripePriceId) {
    throw new Error('Missing stripe_price_id on price record. Configure it in the database after creating the Price in Stripe Dashboard.');
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: params.stripePriceId, quantity: 1 }],
    customer_email: params.userEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    metadata: {
      bsvibe_user_id: params.userId,
      bsvibe_price_id: params.priceId,
    },
    subscription_data: {
      metadata: {
        bsvibe_user_id: params.userId,
        bsvibe_price_id: params.priceId,
      },
    },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return { url: session.url, sessionId: session.id };
}

async function createTossCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  if (!TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }

  // Toss uses a billing-key flow rather than hosted checkout sessions like Stripe.
  // For subscriptions, you typically:
  //   1. Issue a billing key via the client SDK (PaymentWidget)
  //   2. Charge the billing key from the server
  //
  // For the initial integration we redirect users to a server-rendered page
  // that loads Toss PaymentWidget. The page handles the billing key issuance
  // and then POSTs back to /api/payment/toss-confirm to charge.
  const params_ = new URLSearchParams({
    priceId: params.priceId,
    success: params.successUrl,
    cancel: params.cancelUrl,
  });
  return {
    url: `/account/billing/checkout?${params_.toString()}`,
    sessionId: `toss_${Date.now()}_${params.userId}`,
  };
}

// ========== Subscription management ==========

export async function cancelStripeSubscription(stripeSubscriptionId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function cancelTossSubscription(billingKey: string): Promise<void> {
  if (!TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }

  const auth = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  const res = await fetch(`${TOSS_API_BASE}/billing/${billingKey}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error(`Toss cancel failed: ${res.status}`);
  }
}

// ========== Stripe webhook ==========

export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.bsvibe_user_id || session.client_reference_id;
      const priceId = session.metadata?.bsvibe_price_id;
      const subscriptionId = session.subscription as string | null;

      if (userId && priceId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscription({
          userId,
          priceId,
          provider: 'stripe',
          providerSubscriptionId: subscription.id,
          providerCustomerId: subscription.customer as string,
          status: subscription.status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: null,
        });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;
      const userId = invoice.metadata?.bsvibe_user_id;

      if (userId) {
        await recordPayment({
          userId,
          subscriptionId: null,  // matched separately if needed
          provider: 'stripe',
          providerPaymentId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency.toUpperCase(),
          status: 'succeeded',
          description: invoice.description || `Stripe invoice ${invoice.number}`,
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = invoice.metadata?.bsvibe_user_id;
      if (userId) {
        await recordPayment({
          userId,
          subscriptionId: null,
          provider: 'stripe',
          providerPaymentId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency.toUpperCase(),
          status: 'failed',
          description: `Stripe invoice ${invoice.number} failed`,
          paidAt: null,
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.bsvibe_user_id;
      const priceId = subscription.metadata?.bsvibe_price_id;

      if (userId && priceId) {
        await upsertSubscription({
          userId,
          priceId,
          provider: 'stripe',
          providerSubscriptionId: subscription.id,
          providerCustomerId: subscription.customer as string,
          status: subscription.status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        });
      }
      break;
    }
  }
}

// ========== Toss webhook ==========

export async function handleTossWebhook(body: string, _signature: string): Promise<void> {
  if (!TOSS_WEBHOOK_SECRET) {
    throw new Error('TOSS_WEBHOOK_SECRET is not configured');
  }

  // TODO: Toss does not provide a built-in HMAC verification helper.
  // Use the shared secret from Toss Dashboard to verify the signature header.
  // For now, parse the event and let the application handle it.

  const event = JSON.parse(body) as TossWebhookEvent;

  if (event.eventType === 'PAYMENT.DONE' || event.eventType === 'PAYMENT_STATUS_CHANGED') {
    const data = event.data;
    if (data.metadata?.bsvibe_user_id) {
      await recordPayment({
        userId: data.metadata.bsvibe_user_id,
        subscriptionId: data.metadata.bsvibe_subscription_id || null,
        provider: 'toss',
        providerPaymentId: data.paymentKey,
        amount: data.totalAmount,
        currency: data.currency || 'KRW',
        status: data.status === 'DONE' ? 'succeeded' : 'failed',
        description: data.orderName || `Toss payment ${data.orderId}`,
        paidAt: data.approvedAt ? new Date(data.approvedAt) : null,
      });
    }
  }
}

interface TossWebhookEvent {
  eventType: string;
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    orderName?: string;
    status: string;
    totalAmount: number;
    currency?: string;
    approvedAt?: string;
    metadata?: {
      bsvibe_user_id?: string;
      bsvibe_subscription_id?: string;
    };
  };
}

// ========== Toss payment confirmation (called from /api/payment/toss-confirm) ==========

export interface TossConfirmParams {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export async function confirmTossPayment(params: TossConfirmParams): Promise<unknown> {
  if (!TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }

  const auth = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Toss confirm failed: ${res.status} ${err}`);
  }

  return res.json();
}
