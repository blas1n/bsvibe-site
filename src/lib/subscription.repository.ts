import { getSupabaseService } from './supabase.server';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: string;
  userId: string;
  priceId: string;
  provider: 'stripe' | 'toss';
  providerSubscriptionId: string | null;
  providerCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  subscriptionId: string | null;
  provider: string;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  price_id: string;
  provider: 'stripe' | 'toss';
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

interface PaymentRow {
  id: string;
  user_id: string;
  subscription_id: string | null;
  provider: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    priceId: row.price_id,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    providerCustomerId: row.provider_customer_id,
    status: row.status,
    currentPeriodStart: row.current_period_start ? new Date(row.current_period_start) : null,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canceledAt: row.canceled_at ? new Date(row.canceled_at) : null,
  };
}

function toPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    provider: row.provider,
    providerPaymentId: row.provider_payment_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    description: row.description,
    paidAt: row.paid_at ? new Date(row.paid_at) : null,
    createdAt: new Date(row.created_at),
  };
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const supabase = getSupabaseService();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch subscription', error);
    return null;
  }
  return data ? toSubscription(data as SubscriptionRow) : null;
}

export async function upsertSubscription(sub: Omit<Subscription, 'id'> & { id?: string }): Promise<void> {
  const supabase = getSupabaseService();
  const row = {
    id: sub.id,
    user_id: sub.userId,
    price_id: sub.priceId,
    provider: sub.provider,
    provider_subscription_id: sub.providerSubscriptionId,
    provider_customer_id: sub.providerCustomerId,
    status: sub.status,
    current_period_start: sub.currentPeriodStart?.toISOString() ?? null,
    current_period_end: sub.currentPeriodEnd?.toISOString() ?? null,
    cancel_at_period_end: sub.cancelAtPeriodEnd,
    canceled_at: sub.canceledAt?.toISOString() ?? null,
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(row, { onConflict: 'provider,provider_subscription_id' });

  if (error) throw error;
}

export async function getPaymentHistory(userId: string, limit = 50): Promise<PaymentRecord[]> {
  const supabase = getSupabaseService();
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch payment history', error);
    return [];
  }
  return (data as PaymentRow[]).map(toPayment);
}

export async function recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<void> {
  const supabase = getSupabaseService();
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: payment.userId,
      subscription_id: payment.subscriptionId,
      provider: payment.provider,
      provider_payment_id: payment.providerPaymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      paid_at: payment.paidAt?.toISOString() ?? null,
    });

  if (error) throw error;
}
