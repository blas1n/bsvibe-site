/**
 * Server-side proxy for BSGateway API.
 * Forwards requests to BSGateway backend with the user's tenant context.
 *
 * BSGateway uses Supabase JWT for auth, but our auth middleware only has
 * tenant_id from JWT decoding. We use a service-to-service token (or
 * pass through user JWT if available) to call BSGateway.
 *
 * Configure: BSGATEWAY_API_URL and BSGATEWAY_API_KEY in env.
 */

const BSGATEWAY_API_URL = import.meta.env.BSGATEWAY_API_URL || 'https://api-gateway.bsvibe.dev';
const BSGATEWAY_API_KEY = import.meta.env.BSGATEWAY_API_KEY;

export function isBSGatewayConfigured(): boolean {
  return !!BSGATEWAY_API_KEY;
}

interface BSGatewayRequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  body?: unknown;
}

async function bsgatewayRequest<T>(path: string, opts: BSGatewayRequestOptions = {}): Promise<T> {
  if (!BSGATEWAY_API_KEY) {
    throw new Error('BSGATEWAY_API_KEY is not configured');
  }

  const res = await fetch(`${BSGATEWAY_API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${BSGATEWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`BSGateway ${path}: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

// ========== Usage ==========

export interface ModelUsage {
  requests: number;
  tokens: number;
  cost?: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
}

export interface UsageResponse {
  total_requests: number;
  total_tokens: number;
  by_model: Record<string, ModelUsage>;
  by_rule: Record<string, number>;
  daily_breakdown: DailyUsage[];
}

export async function getUsage(tenantId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<UsageResponse | null> {
  if (!isBSGatewayConfigured()) return null;
  try {
    return await bsgatewayRequest<UsageResponse>(`/tenants/${tenantId}/usage?period=${period}`);
  } catch (err) {
    console.error('getUsage failed', err);
    return null;
  }
}

// ========== API Keys ==========

export interface ApiKeyInfo {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKeyInfo {
  key: string;  // Full key, only returned on creation
}

export async function listApiKeys(tenantId: string): Promise<ApiKeyInfo[] | null> {
  if (!isBSGatewayConfigured()) return null;
  try {
    return await bsgatewayRequest<ApiKeyInfo[]>(`/tenants/${tenantId}/api-keys`);
  } catch (err) {
    console.error('listApiKeys failed', err);
    return null;
  }
}

export async function createApiKey(
  tenantId: string,
  data: { name: string; scopes?: string[]; expires_in_days?: number }
): Promise<ApiKeyCreated> {
  return bsgatewayRequest<ApiKeyCreated>(`/tenants/${tenantId}/api-keys`, {
    method: 'POST',
    body: data,
  });
}

export async function revokeApiKey(tenantId: string, keyId: string): Promise<void> {
  await bsgatewayRequest<void>(`/tenants/${tenantId}/api-keys/${keyId}`, { method: 'DELETE' });
}
