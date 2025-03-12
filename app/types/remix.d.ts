import type { Context } from '@netlify/functions';

declare module '@remix-run/node' {
  interface AppLoadContext {
    env: Record<string, string>;
    netlify: Context;
  }
}

export {};
