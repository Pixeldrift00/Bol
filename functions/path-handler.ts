import type { ServerBuild } from '@remix-run/node';
import { createRequestHandler } from '@remix-run/netlify';
import type { Context } from '@netlify/functions';

import * as serverBuild from '@remix-run/dev/server-build';

export const handler = createRequestHandler({
  build: serverBuild as unknown as ServerBuild,
  mode: process.env.NODE_ENV,
  getLoadContext(event: any) {
    // Normalize path to handle @ segments
    const url = new URL(event.rawUrl);
    const path = url.pathname;
    if (path.includes('@app')) {
      // Handle @app routes specially
      event.path = path.replace('@app', 'app');
    }
    
    return {
      env: process.env as Record<string, string>,
      netlify: (event.context || {}) as Context,
    };
  },
});
