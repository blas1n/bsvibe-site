// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bsvibe.dev',

  integrations: [
    starlight({
      title: 'BSVibe',
      defaultLocale: 'root',
      locales: {
        root: { label: '한국어', lang: 'ko' },
        en: { label: 'English' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/blas1n' },
      ],
      sidebar: [
        {
          label: 'BSGateway',
          translations: { en: 'BSGateway' },
          items: [
            { label: '시작하기', slug: 'bsgateway/getting-started', translations: { en: 'Getting Started' } },
            { label: '핵심 개념', slug: 'bsgateway/concepts', translations: { en: 'Core Concepts' } },
            {
              label: '기능 가이드',
              translations: { en: 'Features' },
              autogenerate: { directory: 'bsgateway/features' },
            },
            { label: '설정', slug: 'bsgateway/configuration', translations: { en: 'Configuration' } },
          ],
        },
        {
          label: 'BSNexus',
          translations: { en: 'BSNexus' },
          items: [
            { label: '시작하기', slug: 'bsnexus/getting-started', translations: { en: 'Getting Started' } },
            { label: '핵심 개념', slug: 'bsnexus/concepts', translations: { en: 'Core Concepts' } },
            {
              label: '기능 가이드',
              translations: { en: 'Features' },
              autogenerate: { directory: 'bsnexus/features' },
            },
          ],
        },
        {
          label: 'BSupervisor',
          translations: { en: 'BSupervisor' },
          items: [
            { label: '시작하기', slug: 'bsupervisor/getting-started', translations: { en: 'Getting Started' } },
            { label: '핵심 개념', slug: 'bsupervisor/concepts', translations: { en: 'Core Concepts' } },
            {
              label: '기능 가이드',
              translations: { en: 'Features' },
              autogenerate: { directory: 'bsupervisor/features' },
            },
          ],
        },
        {
          label: 'BSage',
          translations: { en: 'BSage' },
          items: [
            { label: '시작하기', slug: 'bsage/getting-started', translations: { en: 'Getting Started' } },
            { label: '핵심 개념', slug: 'bsage/concepts', translations: { en: 'Core Concepts' } },
            {
              label: '기능 가이드',
              translations: { en: 'Features' },
              autogenerate: { directory: 'bsage/features' },
            },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    react(),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
