import { getSupabaseAnon, isSupabaseConfigured } from './supabase.server';
import type { Locale } from '@/i18n';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  accentColor: string;
  appUrl: string;
  tagline: string;
  detail: string;
  iconSvg: string;
  displayOrder: number;
}

export interface Price {
  id: string;
  productId: string;
  tier: string;
  displayName: string;
  description: string | null;
  amountKrw: number | null;
  amountUsdCents: number | null;
  currency: string;
  billingPeriod: string;
  features: string[];
  isHighlighted: boolean;
  isContactOnly: boolean;
  stripePriceId: string | null;
  displayOrder: number;
}

export interface ProductWithPrices extends Product {
  prices: Price[];
}

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  accent_color: string;
  app_url: string;
  tagline_ko: string | null;
  tagline_en: string | null;
  detail_ko: string | null;
  detail_en: string | null;
  icon_svg: string | null;
  display_order: number;
}

interface PriceRow {
  id: string;
  product_id: string;
  tier: string;
  display_name: string;
  description: string | null;
  amount_krw: number | null;
  amount_usd_cents: number | null;
  currency: string;
  billing_period: string;
  features: string[];
  features_en: string[];
  is_highlighted: boolean;
  is_contact_only: boolean;
  stripe_price_id: string | null;
  display_order: number;
}

function toProduct(row: ProductRow, locale: Locale): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    accentColor: row.accent_color,
    appUrl: row.app_url,
    tagline: (locale === 'en' ? row.tagline_en : row.tagline_ko) ?? '',
    detail: (locale === 'en' ? row.detail_en : row.detail_ko) ?? '',
    iconSvg: row.icon_svg ?? '',
    displayOrder: row.display_order,
  };
}

function toPrice(row: PriceRow, locale: Locale): Price {
  return {
    id: row.id,
    productId: row.product_id,
    tier: row.tier,
    displayName: row.display_name,
    description: row.description,
    amountKrw: row.amount_krw,
    amountUsdCents: row.amount_usd_cents,
    currency: row.currency,
    billingPeriod: row.billing_period,
    features: locale === 'en' ? row.features_en : row.features,
    isHighlighted: row.is_highlighted,
    isContactOnly: row.is_contact_only,
    stripePriceId: row.stripe_price_id,
    displayOrder: row.display_order,
  };
}

/**
 * Fetch all active products with their prices, ordered for display.
 * Falls back to empty array if Supabase not configured (build time).
 */
export async function getProductsWithPrices(locale: Locale): Promise<ProductWithPrices[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAnon();

  const [productsRes, pricesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('prices')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
  ]);

  if (productsRes.error || pricesRes.error) {
    console.error('Failed to fetch pricing data', productsRes.error || pricesRes.error);
    return [];
  }

  const products = (productsRes.data as ProductRow[]).map(row => toProduct(row, locale));
  const prices = (pricesRes.data as PriceRow[]).map(row => toPrice(row, locale));

  return products.map(product => ({
    ...product,
    prices: prices.filter(p => p.productId === product.id),
  }));
}

/**
 * Fetch active products without prices (for landing page product cards).
 * Returns empty array if Supabase not configured.
 */
export async function getProducts(locale: Locale): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Failed to fetch products', error);
    return [];
  }

  return (data as ProductRow[]).map(row => toProduct(row, locale));
}

/**
 * Format price for display (e.g., "₩9,900" or "$9.90" or "TBD").
 */
export function formatPrice(price: Price, locale: Locale): string {
  if (price.isContactOnly) {
    return locale === 'en' ? 'Contact' : '문의';
  }

  if (locale === 'en') {
    if (price.amountUsdCents === null) return 'TBD';
    if (price.amountUsdCents === 0) return '$0';
    const dollars = (price.amountUsdCents / 100).toFixed(2);
    return `$${dollars}`;
  }

  if (price.amountKrw === null) return '미정';
  if (price.amountKrw === 0) return '₩0';
  return `₩${price.amountKrw.toLocaleString('ko-KR')}`;
}

export function formatPeriod(price: Price, locale: Locale): string {
  if (price.isContactOnly) return '';
  if (price.billingPeriod === 'one_time') return '';
  return locale === 'en' ? '/mo' : '/월';
}
