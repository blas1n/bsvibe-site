export type Locale = 'ko' | 'en';

export interface Translations {
  nav: {
    products: string;
    docs: string;
    blog: string;
    pricing: string;
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
