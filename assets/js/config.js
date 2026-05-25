/* ============================================
   Bubbly Studio — Environment Config
   ============================================ */

const BUBBLY_CONFIG = (() => {
  // Detect environment from hostname
  const hostname = window.location.hostname;
  const isProduction = hostname === 'thebubblystudio.com' || hostname === 'www.thebubblystudio.com';
  const env = isProduction ? 'production' : 'sandbox';

  const config = {
    sandbox: {
      env: 'sandbox',
      squareAppId: 'sandbox-sq0idb-MrUaI7IfzDfwxZyyyhEgpg',
      squareLocationId: 'LVEDP0RHWTJFE',
      squareApiBase: 'https://connect.squareupsandbox.com/v2',
      squareWebSdkUrl: 'https://sandbox.web.squarecdn.com/v1/square.js',
      workerBase: 'https://bubbly-api.workers.dev', // Update after Cloudflare Worker deploy
      debug: true
    },
    production: {
      env: 'production',
      squareAppId: '', // Replace with production Application ID
      squareLocationId: '', // Replace with production Location ID
      squareApiBase: 'https://connect.squareup.com/v2',
      squareWebSdkUrl: 'https://web.squarecdn.com/v1/square.js',
      workerBase: 'https://bubbly-api.workers.dev', // Update with production worker URL
      debug: false
    }
  };

  const active = config[env];

  // Log environment in sandbox mode
  if (active.debug) {
    console.log(`🫧 Bubbly Config: ${env} mode`);
    console.log(`   Square App: ${active.squareAppId}`);
    console.log(`   Worker: ${active.workerBase}`);
  }

  return Object.freeze(active);
})();
