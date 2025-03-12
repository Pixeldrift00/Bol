import { createRequestHandler } from '@remix-run/netlify';
import * as build from '@remix-run/dev/server-build';

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(event) {
    // Normalize path to handle @ segments
    const url = new URL(event.rawUrl);
    const path = url.pathname;
    
    // Handle special route cases
    if (path.startsWith('/@app/')) {
      event.path = path.replace('/@app/', '/app/');
    }

    return {
      env: process.env,
      netlify: event.context,
      path: event.path,
    };
  },
});