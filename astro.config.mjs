import { defineConfig } from 'astro/config';

// Set SITE_URL in the environment (or Vercel project settings) to the production domain.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sandhyamelasheemi.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
