import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Defaults are deliberate: this site's dynamic pages read from Supabase at
 * request time, so there is no ISR cache to configure. Add an incremental
 * cache here later if pages move to `revalidate`.
 */
export default {
  ...defineCloudflareConfig(),

  /**
   * OpenNext shells out to `npm run build` by default. `npm run build` is
   * itself `opennextjs-cloudflare build` here — so Cloudflare's stock build
   * command produces the Worker bundle rather than a bare `.next` — which
   * would recurse forever. Naming the Next.js build explicitly breaks that.
   */
  buildCommand: 'next build',
};
