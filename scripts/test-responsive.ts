import puppeteer from 'puppeteer';
import { config } from 'dotenv';

config();

const VIEWPORT_SIZES = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 414, height: 896, name: 'iPhone 11' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 1366, name: 'iPad Pro' },
  { width: 1280, height: 800, name: 'Desktop' },
  { width: 1920, height: 1080, name: 'Large Desktop' }
];

const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/campaigns', name: 'Campaigns' },
  { path: '/leads', name: 'Leads' },
  { path: '/team', name: 'Team' },
  { path: '/settings', name: 'Settings' }
];

async function testResponsiveness() {
  console.log('Starting responsiveness tests...\n');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Login first if required
  if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', process.env.TEST_EMAIL);
    await page.type('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  }

  for (const pageConfig of PAGES_TO_TEST) {
    console.log(`Testing page: ${pageConfig.name}`);
    
    for (const viewport of VIEWPORT_SIZES) {
      console.log(`\nTesting viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewport({
        width: viewport.width,
        height: viewport.height
      });

      try {
        await page.goto(`http://localhost:3000${pageConfig.path}`);
        await page.waitForTimeout(2000); // Wait for animations

        // Take screenshot
        await page.screenshot({
          path: `./test-results/responsive/${pageConfig.name}-${viewport.name}.png`,
          fullPage: true
        });

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        // Check for broken layouts
        const brokenLayouts = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const issues = [];
          
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
              issues.push(`Element overflows viewport: ${el.tagName} ${el.className}`);
            }
          });
          
          return issues;
        });

        if (hasHorizontalScroll) {
          console.log('❌ Horizontal scroll detected');
        } else {
          console.log('✅ No horizontal scroll');
        }

        if (brokenLayouts.length > 0) {
          console.log('❌ Layout issues detected:');
          brokenLayouts.forEach(issue => console.log(`   ${issue}`));
        } else {
          console.log('✅ No layout issues');
        }

      } catch (error) {
        console.error(`❌ Error testing ${pageConfig.name} at ${viewport.name}:`, error);
      }
    }
    console.log('\n-------------------\n');
  }

  await browser.close();
  console.log('Responsiveness tests completed');
}

// Create test results directory
import { mkdirSync } from 'fs';
try {
  mkdirSync('./test-results/responsive', { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Run tests
testResponsiveness()
  .catch(console.error)
  .finally(() => process.exit()); 