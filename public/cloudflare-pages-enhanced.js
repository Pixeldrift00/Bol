// Enhanced Cloudflare Pages Handler Script
(function() {
  console.log('[Cloudflare Enhanced] Script initialized');
  
  // Track initialization state
  const state = {
    initialized: false,
    isCloudflarePages: false,
    webContainerMocked: false,
    reactMountAttempted: false,
    reactMounted: false,
    fallbackActivated: false
  };
  
  // Configuration
  const config = {
    initialCheckDelay: 1000,      // Initial delay before checking environment
    reactMountTimeout: 8000,      // Time to wait for React to mount before intervention
    forceContinueDelay: 2000,     // Delay after force continue before checking again
    maxMountAttempts: 5,          // Maximum number of mount attempts
    fallbackRedirectDelay: 5000   // Delay before redirecting to fallback page
  };
  
  // Detect Cloudflare Pages environment
  function detectCloudflarePages() {
    state.isCloudflarePages = 
      window.location.hostname.includes('pages.dev') || 
      document.referrer.includes('pages.dev') ||
      window.CLOUDFLARE_PAGES_ENVIRONMENT === true;
    
    if (state.isCloudflarePages) {
      console.log('[Cloudflare Enhanced] Cloudflare Pages environment detected');
      window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
      document.documentElement.setAttribute('data-cloudflare-pages', 'true');
      
      // Add a small visual indicator
      addCloudflareIndicator();
    } else {
      console.log('[Cloudflare Enhanced] Not running in Cloudflare Pages environment');
    }
    
    return state.isCloudflarePages;
  }
  
  // Create WebContainer mock
  function mockWebContainer() {
    if (typeof window.WebContainer === 'undefined') {
      console.log('[Cloudflare Enhanced] Creating comprehensive WebContainer mock');
      
      // Create a more comprehensive mock WebContainer API
      window.WebContainer = {
        boot: function() {
          console.log('[Cloudflare Enhanced] Mock WebContainer.boot called');
          // Return a rejected promise after a short delay to simulate attempt
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('WebContainer not supported in Cloudflare Pages'));
              // Dispatch events after rejection
              document.dispatchEvent(new CustomEvent('webcontainer-failed'));
            }, 100);
          });
        },
        mount: function() {
          console.log('[Cloudflare Enhanced] Mock WebContainer.mount called');
          return Promise.resolve();
        },
        fs: {
          readFile: function() {
            return Promise.resolve(new Uint8Array([]));
          },
          writeFile: function() {
            return Promise.resolve();
          },
          readdir: function() {
            return Promise.resolve([]);
          }
        },
        spawn: function() {
          return {
            output: { pipeTo: function() {} },
            exit: Promise.resolve({ code: 0, signal: null })
          };
        }
      };
      
      state.webContainerMocked = true;
    }
  }
  
  // Check if React has mounted
  function checkReactMount() {
    const rootElement = document.getElementById('root');
    state.reactMounted = rootElement && rootElement.children.length > 0 && 
                        !document.body.classList.contains('loading');
    
    if (state.reactMounted) {
      console.log('[Cloudflare Enhanced] React successfully mounted');
    }
    
    return state.reactMounted;
  }
  
  // Force the application to continue without WebContainer
  function forceContinue() {
    if (state.reactMounted) return;
    
    console.log('[Cloudflare Enhanced] Forcing application to continue without WebContainer');
    state.reactMountAttempted = true;
    
    // Dispatch all possible events that might help the app continue
    document.dispatchEvent(new CustomEvent('webcontainer-failed'));
    document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
    document.dispatchEvent(new CustomEvent('force-continue'));
    
    // Set flags that the application might check
    window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
    window.WEBCONTAINER_FAILED = true;
    
    // Call existing forceContinue if available
    if (typeof window.forceContinue === 'function' && window.forceContinue !== forceContinue) {
      try {
        window.forceContinue();
      } catch (e) {
        console.error('[Cloudflare Enhanced] Error calling existing forceContinue:', e);
      }
    }
    
    // Add a notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.background = 'rgba(59, 130, 246, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '99999';
    notification.style.fontSize = '14px';
    notification.style.transition = 'opacity 0.5s';
    notification.textContent = 'Cloudflare Pages mode activated. Loading without WebContainer...';
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }
  
  // Add Cloudflare indicator badge
  function addCloudflareIndicator() {
    window.addEventListener('load', function() {
      if (document.querySelector('.cloudflare-badge')) return;
      
      const indicator = document.createElement('div');
      indicator.className = 'cloudflare-badge';
      indicator.style.position = 'fixed';
      indicator.style.bottom = '10px';
      indicator.style.left = '10px';
      indicator.style.background = 'rgba(244, 127, 35, 0.8)';
      indicator.style.color = 'white';
      indicator.style.padding = '5px 10px';
      indicator.style.borderRadius = '3px';
      indicator.style.fontSize = '12px';
      indicator.style.fontFamily = 'system-ui, sans-serif';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'Cloudflare Pages Mode';
      document.body.appendChild(indicator);
    });
  }
  
  // Redirect to fallback page if all else fails
  function activateFallback() {
    if (state.fallbackActivated) return;
    
    console.log('[Cloudflare Enhanced] All attempts failed, activating fallback page');
    state.fallbackActivated = true;
    
    // Redirect to fallback page
    window.location.href = '/cloudflare-fallback.html';
  }
  
  // Initialize the enhanced handler
  function initialize() {
    if (state.initialized) return;
    state.initialized = true;
    
    console.log('[Cloudflare Enhanced] Initializing enhanced handler');
    
    // Step 1: Detect Cloudflare Pages environment
    if (!detectCloudflarePages()) {
      console.log('[Cloudflare Enhanced] Not in Cloudflare Pages environment, exiting');
      return;
    }
    
    // Step 2: Create WebContainer mock
    mockWebContainer();
    
    // Step 3: Set up React mount monitoring
    let mountAttempts = 0;
    
    function attemptReactMount() {
      if (checkReactMount()) return;
      
      mountAttempts++;
      console.log(`[Cloudflare Enhanced] React mount attempt ${mountAttempts}/${config.maxMountAttempts}`);
      
      // Force continue to try to get React to mount
      forceContinue();
      
      // Check if React mounted after our attempt
      setTimeout(() => {
        if (!checkReactMount()) {
          if (mountAttempts < config.maxMountAttempts) {
            console.log('[Cloudflare Enhanced] React still not mounted, trying again...');
            attemptReactMount();
          } else {
            console.error('[Cloudflare Enhanced] Failed to mount React after maximum attempts');
            activateFallback();
          }
        }
      }, config.forceContinueDelay);
    }
    
    // Step 4: Set up event listeners
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Cloudflare Enhanced] DOM loaded, waiting for React to mount');
      
      // Wait for React to mount naturally
      setTimeout(() => {
        if (!checkReactMount()) {
          console.log('[Cloudflare Enhanced] React not mounted after initial wait, attempting to fix...');
          attemptReactMount();
        }
      }, config.reactMountTimeout);
    });
    
    // Also check on window load
    window.addEventListener('load', () => {
      console.log('[Cloudflare Enhanced] Window loaded');
      
      setTimeout(() => {
        if (!checkReactMount()) {
          console.log('[Cloudflare Enhanced] React not mounted after window load, attempting to fix...');
          attemptReactMount();
        }
      }, 2000);
    });
    
    // Listen for WebContainer failure events
    document.addEventListener('webcontainer-failed', () => {
      console.log('[Cloudflare Enhanced] WebContainer failed event detected');
      
      setTimeout(() => {
        if (!checkReactMount()) {
          console.log('[Cloudflare Enhanced] React not mounted after WebContainer failure, attempting to fix...');
          attemptReactMount();
        }
      }, 1000);
    });
    
    // Expose API to window
    window.cloudflareEnhanced = {
      state,
      checkReactMount,
      forceContinue,
      activateFallback
    };
    
    // Override existing forceContinue function
    window.forceContinue = forceContinue;
    
    console.log('[Cloudflare Enhanced] Handler initialized, API available as window.cloudflareEnhanced');
  }
  
  // Start initialization after a short delay
  setTimeout(initialize, config.initialCheckDelay);
})();