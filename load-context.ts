import { type PlatformProxy } from 'wrangler';

type Netlify = Omit<PlatformProxy<Env>, 'dispose'>;

declare module '@remix-run/netlify' {
  interface AppLoadContext {
    netlify: Netlify;
  }
}
