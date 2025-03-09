// Enhanced debug script to help diagnose loading issues
(function() {
  console.log('[Enhanced Debug] Script initialized');
  
  // Track application state
  const appState = {
    scriptLoaded: true,
    domLoaded: false,
    rootFound: false,
    reactMounted: false,
    webContainerInitialized: false,
    webContainerFailed: false,
    cloudflarePagesDetected: window.location.hostname.includes('pages.dev') || document.referrer.includes('pages.dev')
  };
  
  // Create debug panel
  function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'enhanced-debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '50px';
    panel.style.right = '10px';
    panel.style.background = 'rgba(0,0,0,0.85)';
    panel.style.color = 'white';
    panel.style.padding = '15px';
    panel.style.borderRadius = '5px';
    panel.style.zIndex = '999999';
    panel.style.fontSize = '14px';
    panel.style.fontFamily = 'monospace';
    panel.style.maxWidth = '400px';
    panel.style.maxHeight = '80vh';
    panel.style.overflow = 'auto';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    
    document.body.appendChild(panel);
    return panel;
  }
  
  // Update debug panel
  function updateDebugPanel() {
    if (!document.body) return;
    
    let panel = document.getElementById('enhanced-debug-panel');
    if (!panel) {
      panel = createDebugPanel();
    }
    
    let content = '<h3 style="margin-top:0;color:#4ade80">Enhanced Debug Panel</h3>';
    
    // Application state
    content += '<div style="margin-bottom:10px"><strong>Application State:</strong></div>';
    for (const [key, value] of Object.entries(appState)) {
      const icon = value ? '✅' : '❌';
      content += `<div>${icon} ${key}</div>`;
    }
    
    // Add actions
    content += '<div style="margin-top:15px;margin-bottom:10px"><strong>Actions:</strong></div>';
    content += '<button id="force-continue-btn" style="background:#3b82f6;color:white;border:none;padding:8px 12px;margin-right:8px;margin-bottom:8px;border-radius:4px;cursor:pointer">Force Continue</button>';
    content += '<button id="reload-btn" style="background:#ef4444;color:white;border:none;padding:8px 12px;margin-right:8px;margin-bottom:8px;border-radius:4px;cursor:pointer">Reload Page</button>';
    content += '<button id="fallback-btn" style="background:#f59e0b;color:white;border:none;padding:8px 12px;margin-bottom:8px;border-radius:4px;cursor:pointer">Load Fallback</button>';
    
    // Add environment info
    content += '<div style="margin-top:15px;margin-bottom:10px"><strong>Environment:</strong></div>';
    content += `<div>URL: ${window.location.href}</div>`;
    content += `<div>User Agent: ${navigator.userAgent}</div>`;
    
    // Add console output
    content += '<div style="margin-top:15px;margin-bottom:10px"><strong>Console Output:</strong></div>';
    content += '<div id="console-output" style="background:rgba(0,0,0,0.3);padding:8px;border-radius:4px;max-height:150px;overflow:auto;font-size:12px"></div>';
    
    panel.innerHTML = content;
    
    // Add event listeners to buttons
    document.getElementById('force-continue-btn').addEventListener('click', forceContinue);
    document.getElementById('reload-btn').addEventListener('click', () => window.location.reload());
    document.getElementById('fallback-btn').addEventListener('click', loadFallback);
    
    // Capture console output
    setupConsoleCapture();
  }
  
  // Capture console output
  let consoleMessages = [];
  function setupConsoleCapture() {
    if (window.consoleCaptureSetup) return;
    
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.log = function() {
      originalConsoleLog.apply(console, arguments);
      captureConsole('log', arguments);
    };
    
    console.error = function() {
      originalConsoleError.apply(console, arguments);
      captureConsole('error', arguments);
    };
    
    console.warn = function() {
      originalConsoleWarn.apply(console, arguments);
      captureConsole('warn', arguments);
    };
    
    window.consoleCaptureSetup = true;
  }
  
  function captureConsole(type, args) {
    const message = Array.from(args).map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    consoleMessages.push({ type, message, timestamp: new Date().toISOString() });
    if (consoleMessages.length > 50) consoleMessages.shift();
    
    updateConsoleOutput();
  }
  
  function updateConsoleOutput() {
    const outputElement = document.getElementById('console-output');
    if (!outputElement) return;
    
    let output = '';
    consoleMessages.forEach(msg => {
      let color = 'white';
      if (msg.type === 'error') color = '#f87171';
      if (msg.type === 'warn') color = '#fbbf24';
      
      output += `<div style="color:${color};margin-bottom:3px">${msg.message}</div>`;
    });
    
    outputElement.innerHTML = output;
    outputElement.scrollTop = outputElement.scrollHeight;
  }
  
  // Force continue function
  function forceContinue() {
    console.log('[Enhanced Debug] Force continue triggered');
    
    // Dispatch events
    document.dispatchEvent(new CustomEvent('webcontainer-failed'));
    document.dispatchEvent(new CustomEvent('force-continue'));
    document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
    
    // Set flags
    appState.webContainerFailed = true;
    window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
    
    // Try to call existing force continue
    if (window.forceContinue) {
      window.forceContinue();
    }
    
    // Update UI
    updateDebugPanel();
    
    // Add notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'rgba(59, 130, 246, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '999998';
    notification.style.textAlign = 'center';
    notification.textContent = 'Force continue triggered. App should load shortly...';
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 1s';
      setTimeout(() => notification.remove(), 1000);
    }, 5000);
  }
  
  // Load fallback function
  function loadFallback() {
    console.log('[Enhanced Debug] Loading fallback page');
    window.location.href = '/fallback.html';
  }
  
  // Monitor DOM loading
  document.addEventListener('DOMContentLoaded', () => {
    appState.domLoaded = true;
    
    // Check if root element exists
    const rootElement = document.getElementById('root');
    if (rootElement) {
      appState.rootFound = true;
      console.log('[Enhanced Debug] Root element found');
    } else {
      console.error('[Enhanced Debug] Root element not found');
    }
    
    updateDebugPanel();
  });
  
  // Monitor window load
  window.addEventListener('load', () => {
    // Check React mounting after a delay
    setTimeout(() => {
      const rootContent = document.getElementById('root');
      if (rootContent && rootContent.children.length > 0) {
        appState.reactMounted = true;
        console.log('[Enhanced Debug] React mounted successfully');
      } else {
        console.error('[Enhanced Debug] React not mounted after timeout');
      }
      
      updateDebugPanel();
    }, 3000);
  });
  
  // Listen for WebContainer events
  document.addEventListener('webcontainer-ready', () => {
    appState.webContainerInitialized = true;
    updateDebugPanel();
  });
  
  document.addEventListener('webcontainer-failed', () => {
    appState.webContainerFailed = true;
    updateDebugPanel();
  });
  
  // Initialize debug panel after a short delay
  setTimeout(() => {
    updateDebugPanel();
  }, 500);
  
  // Expose debug API to window
  window.enhancedDebug = {
    appState,
    forceContinue,
    loadFallback,
    updateDebugPanel
  };
  
  console.log('[Enhanced Debug] Debug helpers available in console as window.enhancedDebug');
})();