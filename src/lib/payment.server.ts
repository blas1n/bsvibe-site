/**
 * Payment server utilities.
 *
 * TODO: Actual SDK integration requires environment variables:
 *   - TOSS_SECRET_KEY: 토스페이먼츠 시크릿 키 (한국 결제)
 *   - STRIPE_SECRET_KEY: Stripe 시크릿 키 (글로벌 결제)
 *   - TOSS_WEBHOOK_SECRET: 토스 웹훅 검증용 시크릿
 *   - STRIPE_WEBHOOK_SECRET: Stripe 웹훅 검증용 시크릿
 *
 * Setup checklist (see /docs/payment-setup-guide for details):
 *   1. 토스페이먼츠 개발자센터에서 테스트 키 발급
 *   2. Stripe Dashboard에서 테스트 키 발급
 *   3. .env에 키 설정
 *   4. 웹훅 엔드포인트 등록 (토스: /api/payment/webhook, Stripe: /api/payment/webhook)
 *   5. 상품/가격 등록 (Stripe Products, 토스 결제위젯 설정)
 */

export type PaymentProvider = 'toss' | 'stripe';

export interface CheckoutSession {
  id: string;
  provider: PaymentProvider;
  url: string;
}

export interface Subscription {
  id: string;
  provider: PaymentProvider;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: string;
  currentPeriodEnd: Date;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: Date;
  description: string;
}

/**
 * Determine payment provider based on locale/preference.
 * Korean users → Toss, international → Stripe.
 */
export function getProvider(locale: string): PaymentProvider {
  return locale === 'ko' ? 'toss' : 'stripe';
}

/**
 * Create a checkout session for subscription.
 * TODO: Implement with actual SDK
 */
export async function createCheckout(params: {
  provider: PaymentProvider;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  // TODO: Replace with actual implementation
  // Toss: POST https://api.tosspayments.com/v1/billing/authorizations/card
  // Stripe: stripe.checkout.sessions.create({...})
  throw new Error('Payment not configured. Set TOSS_SECRET_KEY or STRIPE_SECRET_KEY in .env');
}

/**
 * Get user's active subscription.
 * TODO: Implement with actual SDK
 */
export async function getSubscription(_userId: string): Promise<Subscription | null> {
  // TODO: Query from database or payment provider
  return null;
}

/**
 * Cancel a subscription.
 * TODO: Implement with actual SDK
 */
export async function cancelSubscription(_subscriptionId: string): Promise<void> {
  throw new Error('Payment not configured.');
}

/**
 * Get payment history for a user.
 * TODO: Implement with actual SDK
 */
export async function getPaymentHistory(_userId: string): Promise<PaymentHistory[]> {
  return [];
}

/**
 * Verify webhook signature.
 * TODO: Implement with actual SDK
 */
export async function verifyWebhook(
  _provider: PaymentProvider,
  _body: string,
  _signature: string,
): Promise<boolean> {
  throw new Error('Webhook verification not configured.');
}
