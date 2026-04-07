export interface ProductMeta {
  name: 'BSGateway' | 'BSNexus' | 'BSupervisor' | 'BSage';
  accent: string;
  accentGlow: string;
  href: string;
  iconPath: string;
}

export const productsMeta: ProductMeta[] = [
  {
    name: 'BSGateway',
    accent: '#f59e0b',
    accentGlow: 'rgba(245,158,11,0.15)',
    href: 'https://gateway.bsvibe.dev',
    iconPath: 'M4 12h4l3-9 3 18 3-9h4',
  },
  {
    name: 'BSNexus',
    accent: '#3b82f6',
    accentGlow: 'rgba(59,130,246,0.15)',
    href: 'https://nexus.bsvibe.dev',
    iconPath: '',
  },
  {
    name: 'BSupervisor',
    accent: '#f43f5e',
    accentGlow: 'rgba(244,63,94,0.15)',
    href: 'https://supervisor.bsvibe.dev',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    name: 'BSage',
    accent: '#10b981',
    accentGlow: 'rgba(16,185,129,0.15)',
    href: 'https://sage.bsvibe.dev',
    iconPath: '',
  },
];
