/**
 * Fashion Scraper - Using public product APIs
 * Run: node scripts/scrape-final.js
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Scrape StockX - they have a public search
async function scrapeStockX() {
  const products = [];
  
  const searches = [
    { q: 'chrome hearts', brand: 'Chrome Hearts' },
    { q: 'balenciaga', brand: 'Balenciaga' },
    { q: 'rick owens', brand: 'Rick Owens' },
    { q: 'bottega veneta', brand: 'Bottega Veneta' },
    { q: 'gucci', brand: 'Gucci' },
    { q: 'prada', brand: 'Prada' },
    { q: 'off white', brand: 'Off-White' },
    { q: 'fear of god', brand: 'Fear of God' },
    { q: 'amiri', brand: 'Amiri' },
    { q: 'palm angels', brand: 'Palm Angels' },
  ];
  
  for (const { q, brand } of searches) {
    if (products.length >= 50) break;
    
    console.log(`Searching StockX: ${brand}`);
    
    try {
      const url = `https://stockx.com/api/browse?_search=${encodeURIComponent(q)}&page=1&resultsPerPage=10&dataType=product&country=US&currencyCode=USD`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'app-platform': 'web',
          'app-version': '2024.01.01',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.Products || data.products || [];
        
        items.forEach(item => {
          if (products.length >= 50) return;
          
          const imageUrl = item.media?.imageUrl || item.media?.thumbUrl || item.image;
          
          if (imageUrl) {
            products.push({
              name: item.title || item.name,
              brand: brand,
              price: Math.round(item.market?.lowestAsk || item.retailPrice || 500),
              category: mapCategory(item.productCategory || item.category),
              main_image_url: imageUrl,
              description: item.description || `${brand} ${item.title}`,
              condition: 'like_new',
              status: 'available',
              sizes: ['S', 'M', 'L', 'XL'],
            });
          }
        });
        
        console.log(`  Found ${items.length} items`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
    
    await sleep(1500);
  }
  
  return products;
}

// Scrape GOAT
async function scrapeGOAT() {
  const products = [];
  
  const searches = [
    { q: 'chrome hearts', brand: 'Chrome Hearts' },
    { q: 'balenciaga', brand: 'Balenciaga' },
    { q: 'rick owens', brand: 'Rick Owens' },
    { q: 'gucci', brand: 'Gucci' },
    { q: 'prada', brand: 'Prada' },
  ];
  
  for (const { q, brand } of searches) {
    if (products.length >= 50) break;
    
    console.log(`Searching GOAT: ${brand}`);
    
    try {
      const url = `https://www.goat.com/api/v1/product_templates?productCategory=apparel&query=${encodeURIComponent(q)}&page=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.productTemplates || [];
        
        items.forEach(item => {
          if (products.length >= 50) return;
          
          const imageUrl = item.pictureUrl || item.mainPictureUrl;
          
          if (imageUrl) {
            products.push({
              name: item.name,
              brand: brand,
              price: Math.round(item.lowestPriceCents?.amount / 100 || item.retailPriceCents / 100 || 500),
              category: mapCategory(item.productCategory),
              main_image_url: imageUrl,
              description: `${brand} ${item.name}`,
              condition: 'excellent',
              status: 'available',
              sizes: ['S', 'M', 'L'],
            });
          }
        });
        
        console.log(`  Found ${items.length} items`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
    
    await sleep(1500);
  }
  
  return products;
}

// Scrape Grailed HTML
async function scrapeGrailed() {
  const products = [];
  
  const designers = [
    { slug: 'chrome-hearts', brand: 'Chrome Hearts' },
    { slug: 'balenciaga', brand: 'Balenciaga' },
    { slug: 'rick-owens', brand: 'Rick Owens' },
    { slug: 'bottega-veneta', brand: 'Bottega Veneta' },
    { slug: 'gucci', brand: 'Gucci' },
    { slug: 'prada', brand: 'Prada' },
    { slug: 'maison-margiela', brand: 'Maison Margiela' },
    { slug: 'acne-studios', brand: 'Acne Studios' },
    { slug: 'saint-laurent-paris', brand: 'Saint Laurent' },
    { slug: 'off-white', brand: 'Off-White' },
  ];
  
  for (const { slug, brand } of designers) {
    if (products.length >= 50) break;
    
    console.log(`Scraping Grailed: ${brand}`);
    
    try {
      const url = `https://www.grailed.com/designers/${slug}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Find __NEXT_DATA__
      const nextData = $('#__NEXT_DATA__').html();
      
      if (nextData) {
        const data = JSON.parse(nextData);
        const listings = data?.props?.pageProps?.listings || 
                        data?.props?.pageProps?.data?.listings ||
                        data?.props?.pageProps?.ssrData?.listings ||
                        [];
        
        console.log(`  Found ${listings.length} in __NEXT_DATA__`);
        
        listings.forEach(item => {
          if (products.length >= 50) return;
          
          let imageUrl = item.cover_photo?.url || item.photos?.[0]?.url;
          if (imageUrl && imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          }
          
          if (imageUrl && item.title) {
            products.push({
              name: item.title,
              brand: item.designer?.name || brand,
              price: Math.round(item.price || 500),
              category: mapCategory(item.category_path),
              main_image_url: imageUrl,
              description: item.description || `${brand} ${item.title}`,
              condition: mapCondition(item.condition),
              status: 'available',
              sizes: [item.size || 'One Size'],
            });
          }
        });
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
    
    await sleep(2000);
  }
  
  return products;
}

function mapCategory(cat) {
  if (!cat) return 'Clothing';
  const c = (Array.isArray(cat) ? cat.join(' ') : String(cat)).toLowerCase();
  if (c.includes('bag') || c.includes('handbag')) return 'Bags';
  if (c.includes('shoe') || c.includes('sneaker') || c.includes('boot') || c.includes('footwear')) return 'Shoes';
  if (c.includes('jewel') || c.includes('ring') || c.includes('necklace')) return 'Jewelry';
  if (c.includes('access') || c.includes('belt') || c.includes('hat')) return 'Accessories';
  return 'Clothing';
}

function mapCondition(cond) {
  if (!cond) return 'excellent';
  const c = String(cond).toLowerCase();
  if (c.includes('new') || c === '10' || c === '9.5') return 'like_new';
  if (c.includes('gently') || c === '9' || c === '8') return 'good';
  return 'excellent';
}

async function clearAndInsert(products) {
  console.log(`\nClearing old mock products...`);
  
  // Delete picsum products
  await fetch(`${SUPABASE_URL}/rest/v1/products?main_image_url=like.*picsum*`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  
  console.log(`Inserting ${products.length} products...`);
  
  let success = 0;
  
  for (const product of products) {
    if (!product.main_image_url) continue;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: product.name.substring(0, 255),
          brand: product.brand,
          price: product.price,
          category: product.category,
          main_image_url: product.main_image_url,
          description: (product.description || '').substring(0, 1000),
          condition: product.condition,
          status: 'available',
          sizes: product.sizes,
        }),
      });
      
      if (response.ok) {
        console.log(`✓ ${product.brand} - ${product.name.substring(0, 45)}`);
        success++;
      }
    } catch (e) {}
  }
  
  console.log(`\n✅ Done! Added ${success} products`);
}

async function main() {
  console.log('=== Fashion Product Scraper ===\n');
  
  let allProducts = [];
  
  // Try Grailed first
  console.log('--- Scraping Grailed ---\n');
  const grailedProducts = await scrapeGrailed();
  allProducts = [...allProducts, ...grailedProducts];
  
  // Try StockX if needed
  if (allProducts.length < 30) {
    console.log('\n--- Scraping StockX ---\n');
    const stockxProducts = await scrapeStockX();
    allProducts = [...allProducts, ...stockxProducts];
  }
  
  // Dedupe by image URL
  const unique = [];
  const seen = new Set();
  for (const p of allProducts) {
    if (p.main_image_url && !seen.has(p.main_image_url)) {
      seen.add(p.main_image_url);
      unique.push(p);
    }
    if (unique.length >= 50) break;
  }
  
  console.log(`\nTotal unique products: ${unique.length}`);
  
  if (unique.length > 0) {
    await clearAndInsert(unique);
  } else {
    console.log('\n❌ No products found. Sites are blocking requests.');
  }
}

main().catch(console.error);
