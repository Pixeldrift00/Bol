// Enhanced Debug Script for Cloudflare Pages
(function() {
  console.log('[Enhanced Debug] Script initialized');
  
  // Application state tracking
  const appState = {
    initialized: false,
    domLoaded: false,
    windowLoaded: false,
    reactMounted: false,
    webContainerFailed: false,
    cloudflareDetected: false
  };
  
  // Configuration
  const config = {
    debugPanelEnabled: true,
    autoFixEnabled: true,
    mountCheckInterval: 1000,
    mountCheckTimeout: 20000
  };
  
  // Debug panel element
  let debugPanel = null;
  
  // Initialize the debug system
  function initialize() {
    if (appState.initialized) return;
    appState.initialized = true;
    
    // Detect Cloudflare Pages environment
    appState.cloudflareDetected = 
      window.location.hostname.includes('pages.dev') || 
      document.referrer.includes('pages.dev') ||
      window.CLOUDFLARE_PAGES_ENVIRONMENT === true;
    
    if (appState.cloudflareDetected) {
      console.log('[Enhanced Debug] Cloudflare Pages environment detected');
      window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
    }
    
    // Set up event listeners
    document.addEventListener('DOMContentLoaded', () => {
      appState.domLoaded = true;
      console.log('[Enhanced Debug] DOM Content Loaded');
      updateDebugPanel();
      
      // Start monitoring React mounting
      if (config.autoFixEnabled) {
        startReactMountMonitoring();
      }
    });
    
    window.addEventListener('load', () => {
      appState.windowLoaded = true;
      console.log('[Enhanced Debug] Window Loaded');
      updateDebugPanel();
      
      // Create debug panel if enabled
      if (config.debugPanelEnabled) {
        createDebugPanel();
      }
    });
    
    // Listen for WebContainer failure
    document.addEventListener('webcontainer-failed', () => {
      appState.webContainerFailed = true;
      console.log('[Enhanced Debug] WebContainer failed event detected');
      updateDebugPanel();
    });
    
    // Listen for Cloudflare Pages detection
    document.addEventListener('cloudflare-pages-detected', () => {
      appState.cloudflareDetected = true;
      console.log('[Enhanced Debug] Cloudflare Pages detected event received');
      updateDebugPanel();
    });
    
    // Listen for force continue
    document.addEventListener('force-continue', () => {
      console.log('[Enhanced Debug] Force continue event received');
      updateDebugPanel();
    });
    
    console.log('[Enhanced Debug] Initialization complete');
  }
  
  // Create debug panel
  function createDebugPanel() {
    if (debugPanel) return;
    
    debugPanel = document.createElement('div');
    debugPanel.id = 'enhanced-debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.background = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '999999';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.maxWidth = '300px';
    debugPanel.style.maxHeight = '200px';
    debugPanel.style.overflow = 'auto';
    debugPanel.style.transition = 'opacity 0.3s';
    debugPanel.style.opacity = '0.7';
    
    // Add hover effect
    debugPanel.addEventListener('mouseenter', () => {
      debugPanel.style.opacity = '1';
    });
    
    debugPanel.addEventListener('mouseleave', () => {
      debugPanel.style.opacity = '0.7';
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '12px';