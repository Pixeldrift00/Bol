// Cloudflare Pages specific fallback script
(function() {
  console.log('[Cloudflare Fallback] Script initialized');
  
  // Check if we're running on Cloudflare Pages
  const isCloudflarePages = window.location.hostname.includes('pages.dev') || 
                           document.referrer.includes('pages.dev') ||
                           window.location.hostname.includes('cloudflare') ||
                           window.CLOUDFLARE_PAGES_ENVIRONMENT === true;
  
  if (!isCloudflarePages) {
    console.log('[Cloudflare Fallback] Not running in Cloudflare Pages environment, script inactive');
    return;
  }
  
  console.log('[Cloudflare Fallback] Running in Cloudflare Pages environment');
  
  // Set global flag immediately
  window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
  window.WEBCONTAINER_FAILED = true;
  
  // Set a timeout to check if the app has loaded properly
  const fallbackTimeout = setTimeout(() => {
    const rootElement = document.getElementById('root');
    
    // If the root element is empty or we're still showing loading state
    if (!rootElement || rootElement.children.length === 0 || document.body.classList.contains('loading')) {
      console.log('[Cloudflare Fallback] Application failed to load, activating fallback');
      
      // Try to dispatch the webcontainer-failed event
      document.dispatchEvent(new CustomEvent('webcontainer-failed'));
      
      // Dispatch a custom event that the app can listen for
      document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
      document.dispatchEvent(new CustomEvent('force-continue'));
      
      // Force the app to continue without WebContainer if possible
      if (typeof window.forceContinue === 'function') {
        console.log('[Cloudflare Fallback] Attempting to force continue...');
        window.forceContinue();
        
        // Give it another chance to load
        setTimeout(() => {
          if (!rootElement || rootElement.children.length === 0) {
            console.log('[Cloudflare Fallback] Force continue failed, redirecting to fallback page');
            window.location.href = '/cloudflare-fallback.html';
          }
        }, 5000);
      } else {
        // If forceContinue is not available, go directly to fallback
        console.log('[Cloudflare Fallback] No forceContinue function available, redirecting to fallback page');
        window.location.href = '/cloudflare-fallback.html';
      }
    }
  }, 15000); // Check after 15 seconds - longer timeout to give more chance to load
  
  // Clear the timeout if the app loads successfully
  window.addEventListener('load', () => {
    setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.children.length > 0 && !document.body.classList.contains('loading')) {
        console.log('[Cloudflare Fallback] Application loaded successfully, disabling fallback');
        clearTimeout(fallbackTimeout);
      }
    }, 2000); // Give a little extra time for React to render
  });
  
  // Also listen for React mount success from the mount handler
  document.addEventListener('DOMContentLoaded', () => {
    if (window.reactMountHandler) {
      console.log('[Cloudflare Fallback] React mount handler detected, integrating with fallback');
      const originalCheck = window.reactMountHandler.checkReactMount;
      window.reactMountHandler.checkReactMount = function() {
        const result = originalCheck();
        if (result) {
          console.log('[Cloudflare Fallback] React mount detected by handler, disabling fallback');
          clearTimeout(fallbackTimeout);
        }
        return result;
      };
    }
    
    // Also integrate with the enhanced handler if available
    if (window.cloudflareEnhanced) {
      console.log('[Cloudflare Fallback] Enhanced handler detected, integrating with fallback');
      const originalCheck = window.cloudflareEnhanced.checkReactMount;
      window.cloudflareEnhanced.checkReactMount = function() {
        const result = originalCheck();
        if (result) {
          console.log('[Cloudflare Fallback] React mount detected by enhanced handler, disabling fallback');
          clearTimeout(fallbackTimeout);
        }
        return result;
      };
    }
  });
})();