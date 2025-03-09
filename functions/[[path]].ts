// Simple handler for Cloudflare Pages
export function onRequest(_context: unknown): Response {
  // Return a simple redirect to the client-side app
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}