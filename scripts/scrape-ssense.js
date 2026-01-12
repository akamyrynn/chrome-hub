/**
 * SSENSE Product Scraper for local development/testing only
 * Run: node scripts/scrape-ssense.js
 * 
 * Requirements: npm install node-fetch cheerio
 */

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

// Categories to scrape
const CATEGORIES = [
  { url: 'https://www.ssense.com/en-us/men/clothing', category: 'Clothing' },
  { url: 'https://www.ssense.com/en-us/men/bags', category: 'Bags' },
  { url: 'https://www.ssense.com/en-us/men/shoes', category: 'Shoes' },
  { url: 'https://www.ssense.com/en-us/men/accessories', category: 'Accessories' },
  { url: 'https://www.ssense.com/en-us/women/clothing', category: 'Clothing' },
  { url: 'https://www.ssense.com/en-us/women/bags', category: 'Bags' },
  { url: 'https://www.ssense.com/en-us/women/jewelry', category: 'Jewelry' },
];

// Brands we want
const TARGET_BRANDS = [
  'Chrome Hearts', 'Balenciaga', 'Rick Owens', 'Maison Margiela', 
  'Acne Studios', 'Bottega Veneta', 'Gucci', 'Prada', 'Miu Miu',
  'Saint Laurent', 'Givenchy', 'Valentino', 'Alexander McQueen',
  'Off-White', 'Palm Angels', 'Amiri', 'Fear of God', 'Vetements'
];

async function fetchWithRetry(url, retries = 3) {
  const fetch = (await import('node-fetch')).default;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      
      if (response.ok) {
        return await response.text();
      }
      
      console.log(`Attempt ${i + 1} failed: ${response.status}`);
    } catch (error) {
      console.log(`Attempt ${i + 1} error:`, error.message);
    }
    
    // Wait before retry
    await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  
  return null;
}

async function scrapeSSENSE() {
  const cheerio = (await import('cheerio')).default;
  const products = [];
  
  console.log('Starting SSENSE scrape...\n');
  
  for (const cat of CATEGORIES) {
    if (products.length >= 50) break;
    
    console.log(`Scraping: ${cat.url}`);
    const html = await fetchWithRetry(cat.url);
    
    if (!html) {
      console.log('Failed to fetch, skipping...');
      continue;
    }
    
    const $ = cheerio.load(html);
    
    // SSENSE uses JSON-LD for product data
    const scripts = $('script[type="application/ld+json"]');
    
    scripts.each((i, script) => {
      try {
        const data = JSON.parse($(script).html());
        
        if (data['@type'] === 'ItemList' && data.itemListElement) {
          data.itemListElement.forEach(item => {
            if (products.length >= 50) return;
            
            const product = item.item || item;
            if (!product.name || !product.brand) return;
            
            const brandName = product.brand?.name || product.brand;
            
            // Filter by target brands (optional)
            // if (!TARGET_BRANDS.some(b => brandName.toLowerCase().includes(b.toLowerCase()))) return;
            
            products.push({
              name: product.name,
              brand: brandName,
              price: parseFloat(product.offers?.price || product.price || Math.floor(Math.random() * 2000) + 300),
              category: cat.category,
              main_image_url: product.image?.[0] || product.image || null,
              description: product.description || `${brandName} ${product.name}`,
              condition: 'excellent',
              status: 'available',
              sizes: ['S', 'M', 'L'],
            });
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    // Also try parsing product cards directly
    $('.product-tile, .plp-products__product, [data-testid="product-tile"]').each((i, el) => {
      if (products.length >= 50) return;
      
      const $el = $(el);
      const name = $el.find('.product-tile__name, .product-name, [data-testid="product-name"]').text().trim();
      const brand = $el.find('.product-tile__brand, .product-brand, [data-testid="product-brand"]').text().trim();
      const priceText = $el.find('.product-tile__price, .product-price, [data-testid="product-price"]').text().trim();
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      
      if (name && brand) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || Math.floor(Math.random() * 2000) + 300;
        
        products.push({
          name: name,
          brand: brand,
          price: price,
          category: cat.category,
          main_image_url: image,
          description: `${brand} ${name}`,
          condition: 'excellent',
          status: 'available',
          sizes: ['S', 'M', 'L'],
        });
      }
    });
    
    console.log(`Found ${products.length} products so far`);
    
    // Be nice to the server
    await new Promise(r => setTimeout(r, 1500));
  }
  
  return products;
}

async function insertProducts(products) {
  const fetch = (await import('node-fetch')).default;
  
  console.log(`\nInserting ${products.length} products into Supabase...`);
  
  let success = 0;
  let failed = 0;
  
  for (const product of products) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(product),
      });
      
      if (response.ok) {
        console.log(`✓ ${product.brand} - ${product.name}`);
        success++;
      } else {
        const error = await response.text();
        console.log(`✗ ${product.name}: ${error}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${product.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

// Alternative: Generate realistic mock data with real image URLs
async function generateMockProducts() {
  const products = [];
  
  const brands = [
    { name: 'Chrome Hearts', prefix: 'ch' },
    { name: 'Balenciaga', prefix: 'bc' },
    { name: 'Rick Owens', prefix: 'ro' },
    { name: 'Maison Margiela', prefix: 'mm' },
    { name: 'Bottega Veneta', prefix: 'bv' },
    { name: 'Acne Studios', prefix: 'ac' },
    { name: 'Gucci', prefix: 'gc' },
    { name: 'Prada', prefix: 'pr' },
    { name: 'Saint Laurent', prefix: 'sl' },
    { name: 'Givenchy', prefix: 'gv' },
  ];
  
  const items = {
    Clothing: ['Hoodie', 'T-Shirt', 'Jacket', 'Pants', 'Sweater', 'Coat', 'Shirt', 'Vest'],
    Bags: ['Tote Bag', 'Crossbody Bag', 'Backpack', 'Clutch', 'Shoulder Bag'],
    Shoes: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Derby Shoes'],
    Accessories: ['Belt', 'Scarf', 'Hat', 'Sunglasses', 'Wallet', 'Keychain'],
    Jewelry: ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant'],
  };
  
  const conditions = ['excellent', 'like_new', 'good'];
  
  // Use placeholder images from picsum.photos (free, no auth needed)
  const getImageUrl = (index) => `https://picsum.photos/seed/product${index}/800/800`;
  
  let index = 0;
  
  for (const brand of brands) {
    for (const [category, categoryItems] of Object.entries(items)) {
      for (const item of categoryItems.slice(0, 1)) { // 1 item per category per brand = 50 products
        if (products.length >= 50) break;
        
        const price = Math.floor(Math.random() * 3000) + 200;
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        products.push({
          name: `${brand.name} ${item}`,
          brand: brand.name,
          price: price,
          category: category,
          subcategory: item.includes(' ') ? item.split(' ')[0] : item,
          main_image_url: getImageUrl(index),
          description: `Authentic ${brand.name} ${item.toLowerCase()} in ${condition.replace('_', ' ')} condition. A rare find for collectors.`,
          care_info: 'Professional dry clean only. Store in dust bag.',
          brand_story: `${brand.name} is renowned for exceptional craftsmanship and timeless design.`,
          condition: condition,
          status: 'available',
          sizes: category === 'Clothing' ? ['S', 'M', 'L', 'XL'] : 
                 category === 'Shoes' ? ['40', '41', '42', '43', '44'] :
                 category === 'Jewelry' ? ['6', '7', '8', '9'] : ['One Size'],
        });
        
        index++;
      }
    }
  }
  
  return products;
}

// Main
async function main() {
  console.log('=== Product Scraper/Generator ===\n');
  console.log('Choose mode:');
  console.log('1. Try scraping SSENSE (may fail due to anti-bot)');
  console.log('2. Generate mock products with placeholder images (recommended)\n');
  
  // For now, use mock data since scraping often gets blocked
  console.log('Using mock data generator...\n');
  
  const products = await generateMockProducts();
  console.log(`Generated ${products.length} products\n`);
  
  // Show sample
  console.log('Sample products:');
  products.slice(0, 3).forEach(p => {
    console.log(`- ${p.brand} ${p.name}: €${p.price}`);
  });
  console.log('...\n');
  
  await insertProducts(products);
}

main().catch(console.error);
