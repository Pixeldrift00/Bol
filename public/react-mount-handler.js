// React Mount Handler for Cloudflare Pages
(function() {
  console.log('[React Mount Handler] Script initialized');
  
  // Check if we're in a Cloudflare Pages environment
  const isCloudflarePages = window.location.hostname.includes('pages.dev') || 
                           document.referrer.includes('pages.dev') ||
                           window.CLOUDFLARE_PAGES_ENVIRONMENT === true;
  
  // Track mounting attempts
  let mountAttempts = 0;
  const maxAttempts = 5;
  
  // Function to check if React has mounted
  function checkReactMount() {
    const rootElement = document.getElementById('root');
    
    if (rootElement && rootElement.children.length > 0) {
      console.log('[React Mount Handler] React successfully mounted');
      return true;
    }
    
    return false;
  }
  
  // Function to attempt remounting React
  function attemptReactMount() {
    console.log(`[React Mount Handler] Attempt ${mountAttempts + 1} to ensure React mounts`);
    mountAttempts++;
    
    // Dispatch events that might trigger React mounting
    document.dispatchEvent(new CustomEvent('webcontainer-failed'));
    document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
    
    // If we have access to the forceContinue function, call it
    if (typeof window.forceContinue === 'function') {
      console.log('[React Mount Handler] Calling forceContinue()');
      window.forceContinue();
    }
    
    // Check if React mounted after our attempt
    setTimeout(() => {
      if (!checkReactMount() && mountAttempts < maxAttempts) {
        console.log('[React Mount Handler] React still not mounted, trying again...');
        attemptReactMount();
      } else if (!checkReactMount()) {
        console.error('[React Mount Handler] Failed to mount React after maximum attempts');
        showFallbackUI();
      }
    }, 2000);
  }
  
  // Function to show fallback UI if React fails to mount
  function showFallbackUI() {
    console.log('[React Mount Handler] Showing fallback UI');
    
    // Create fallback UI container
    const fallbackContainer = document.createElement('div');
    fallbackContainer.style.position = 'fixed';
    fallbackContainer.style.top = '0';
    fallbackContainer.style.left = '0';
    fallbackContainer.style.width = '100%';
    fallbackContainer.style.height = '100%';
    fallbackContainer.style.backgroundColor = '#1a1a1a';
    fallbackContainer.style.color = '#ffffff';
    fallbackContainer.style.display = 'flex';
    fallbackContainer.style.flexDirection = 'column';
    fallbackContainer.style.alignItems = 'center';
    fallbackContainer.style.justifyContent = 'center';
    fallbackContainer.style.padding = '20px';
    fallbackContainer.style.textAlign = 'center';
    fallbackContainer.style.zIndex = '999999';
    fallbackContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Add content to fallback UI
    fallbackContainer.innerHTML = `
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Bolt.DIY</h1>
      <p style="font-size: 1.2rem; max-width: 600px; margin-bottom: 2rem;">
        The application is having trouble loading in this environment. This might be due to WebContainer API restrictions.
      </p>
      <button id="fallback-refresh-btn" style="background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 1rem; cursor: pointer;">
        Try Again
      </button>
    `;
    
    document.body.appendChild(fallbackContainer);
    
    // Add event listener to refresh button
    document.getElementById('fallback-refresh-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
  
  // Start monitoring after DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[React Mount Handler] DOM loaded, starting React mount monitoring');
    
    // Wait a bit for React to mount normally
    setTimeout(() => {
      if (!checkReactMount()) {
        console.log('[React Mount Handler] React not mounted after initial wait, attempting to fix...');
        attemptReactMount();
      }
    }, 3000);
  });
  
  // Also check on window load
  window.addEventListener('load', () => {
    console.log('[React Mount Handler] Window loaded');
    
    // Wait a bit for React to mount normally
    setTimeout(() => {
      if (!checkReactMount()) {
        console.log('[React Mount Handler] React not mounted after window load, attempting to fix...');
        attemptReactMount();
      }
    }, 2000);
  });
  
  // Listen for WebContainer failure events
  document.addEventListener('webcontainer-failed', () => {
    console.log('[React Mount Handler] WebContainer failed event detected');
    
    // Wait a bit to see if React mounts on its own
    setTimeout(() => {
      if (!checkReactMount()) {
        console.log('[React Mount Handler] React not mounted after WebContainer failure, attempting to fix...');
        attemptReactMount();
      }
    }, 1000);
  });
  
  // Expose API to window
  window.reactMountHandler = {
    checkReactMount,
    attemptReactMount,
    showFallbackUI
  };
  
  console.log('[React Mount Handler] Handler registered, API available as window.reactMountHandler');
})();