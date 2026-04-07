export type Locale = 'ko' | 'en';

export interface Translations {
  nav: {
    products: string;
    docs: string;
    blog: string;
    getStarted: string;
    login: string;
    logout: string;
    account: string;
  };
  menu: string;
  hero: {
    badge: string;
    h1: string;
    h1Gradient: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
  };
  productsHeading: string;
  vision: string;
  footer: {
    docs: string;
    privacy: string;
    terms: string;
  };
  products: {
    BSGateway: { desc: string; detail: string };
    BSNexus: { desc: string; detail: string };
    BSupervisor: { desc: string; detail: string };
    BSage: { desc: string; detail: string };
  };
}

import { ko } from './ko';
import { en } from './en';

const translations: Record<Locale, Translations> = { ko, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getLocalePrefix(locale: Locale): string {
  return locale === 'en' ? '/en' : '';
}
