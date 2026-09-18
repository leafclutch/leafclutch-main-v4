import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Defaults are deliberate: this site's dynamic pages read from Supabase at
 * request time, so there is no ISR cache to configure. Add an incremental
 * cache here later if pages move to `revalidate`.
 */
export default defineCloudflareConfig();
