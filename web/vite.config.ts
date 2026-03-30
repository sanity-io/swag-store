import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import {sanity} from 'hydrogen-sanity/vite';

import {miniOxygenDevDiagnostics} from './vite-plugins/miniOxygenDevDiagnostics';

/**
 * Bisect MiniOxygen / `__vite_fetch_module` (HTML parsed as JSON):
 *
 * | Flag | Effect |
 * |------|--------|
 * | `minimal` | No Tailwind/Sanity Vite plugins (dev may warn on CSS; use to test Oxygen only). |
 * | `notailwind` | Drop `@tailwindcss/vite`. |
 * | `nosanity` | Drop `hydrogen-sanity/vite`. |
 * | `novirtual` | `hydrogen({ disableVirtualRoutes: true })` — no graphiql/subrequest-profiler virtual routes. |
 *
 * Combine: `H2_DIAG=nosanity,novirtual pnpm dev`
 *
 * `H2_DEV_HOST=1` — `server.host: true` (loopback/LAN bind; pairs with `pnpm dev:diag:host`).
 */
const H2_DIAG = (process.env.H2_DIAG ?? '')
  .split(/[,\s]+/)
  .filter(Boolean);

const diagMinimal = H2_DIAG.includes('minimal');
const noTailwind = diagMinimal || H2_DIAG.includes('notailwind');
const noSanity = diagMinimal || H2_DIAG.includes('nosanity');
const noVirtualRoutes =
  H2_DIAG.includes('novirtual') || H2_DIAG.includes('no-virtual-routes');

export default defineConfig({
  plugins: [
    // First: wrap dev-only /__vite_fetch_module responses with actionable errors when HTML comes back.
    miniOxygenDevDiagnostics(),
    // Match Shopify skeleton: hydrogen → oxygen → react-router before other Vite plugins.
    // Extra plugins (Tailwind, Sanity) run after so dev middleware order stays predictable.
    hydrogen(noVirtualRoutes ? {disableVirtualRoutes: true} : {}),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
    ...(noTailwind ? [] : [tailwindcss()]),
    ...(noSanity ? [] : [sanity()]),
  ],
  ...(process.env.H2_DEV_HOST === '1'
    ? {server: {host: true}}
    : {}),
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: ['rxjs', 'cookie', '@sanity/image-url'],
    },
  },
});
