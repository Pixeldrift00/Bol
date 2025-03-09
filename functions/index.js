// Main function handler for Cloudflare Pages
export function onRequest(context) {
  return new Response("Bolt.DIY API", {
    headers: { "Content-Type": "text/plain" }
  });
}