import type { ServerBuild } from '@remix-run/node';
import { createRequestHandler } from '@remix-run/netlify';
import type { Context } from '@netlify/functions';

import * as serverBuild from '@remix-run/dev/server-build';

export const handler = createRequestHandler({
  build: serverBuild as unknown as ServerBuild,
  mode: process.env.NODE_ENV,
  getLoadContext(event: any) {
    const url = new URL(event.rawUrl);
    const path = url.pathname;
    
    // Handle special route cases
    if (path.startsWith('/@app/')) {
      event.path = path.replace('/@app/', '/app/');
    } else if (path.startsWith('/api/')) {
      event.path = path;
    }
    
    // Include additional context for API routes
    return {
      env: process.env as Record<string, string>,
      netlify: (event.context || {}) as Context,
      headers: event.headers,
      rawUrl: event.rawUrl,
      path: event.path,
    };
  },
});
