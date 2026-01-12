#!/usr/bin/env node

/**
 * Quick Backend Health Check
 * Run this to verify Laravel backend is running and accessible
 */

const http = require('http');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

console.log('🔍 Checking backend health...\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('─'.repeat(50));

// Extract hostname and port from URL
const url = new URL(BACKEND_URL);

const options = {
  hostname: url.hostname,
  port: url.port || 80,
  path: '/api',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is reachable`);
  console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
  
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('\n✨ Backend server is running!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure CORS is configured (see CORS_CONFIGURATION.md)');
    console.log('   2. Test login endpoint: POST /api/auth/login');
    console.log('   3. Check Laravel logs if issues persist');
  } else {
    console.log('\n⚠️  Backend responded but with unexpected status');
  }
  
  process.exit(0);
});

req.on('error', (error) => {
  console.log(`❌ Cannot reach backend`);
  console.log(`   Error: ${error.message}`);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Is Laravel server running?');
  console.log('      Run: cd backend-api && php artisan serve');
  console.log('   2. Check if port 8000 is available');
  console.log('   3. Verify .env NEXT_PUBLIC_API_BASE_URL setting');
  console.log(`   4. Current URL: ${BACKEND_URL}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log(`⏱️  Connection timeout`);
  console.log('   Backend did not respond within 5 seconds');
  req.destroy();
  process.exit(1);
});

req.end();
