/**
 * Luxury Fashion Scraper - Real products with real images
 * Run: node scripts/scrape-luxury.js
 */

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

async function fetchPage(url) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });
    
    if (response.ok) {
      return await response.text();
    }
    console.log(`Failed: ${response.status} ${response.statusText}`);
    return null;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return null;
  }
}

// Scrape Grailed - resale marketplace, easier to scrape
async function scrapeGrailed() {
  const cheerio = (await import('cheerio')).default;
  const products = [];
  
  const searches = [
    'chrome+hearts',
    'balenciaga',
    'rick+owens', 
    'maison+margiela',
    'bottega+veneta',
    'gucci',
    'prada',
    'saint+laurent',
    'acne+studios',
    'off+white'
  ];
  
  for (const search of searches) {
    if (products.length >= 50) break;
    
    console.log(`Searching Grailed for: ${search}`);
    
    // Grailed API endpoint
    const apiUrl = `https://www.grailed.com/api/merchandise/marquee?hitsPerPage=10&query=${search}`;
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data) {
          data.data.forEach(item => {
            if (products.length >= 50) return;
            
            products.push({
              name: item.title || item.name,
              brand: item.designer?.name || item.designers?.[0]?.name || search.replace('+', ' '),
              price: Math.round(item.price || item.sold_price || 500),
              category: mapCategory(item.category || item.department),
              main_image_url: item.cover_photo?.url || item.photos?.[0]?.url,
              description: item.description || `${item.designer?.name} ${item.title}`,
              condition: mapCondition(item.condition),
              status: 'available',
              sizes: [item.size || 'One Size'],
            });
          });
        }
      }
    } catch (e) {
      console.log(`Grailed API error: ${e.message}`);
    }
    
    await sleep(1000);
  }
  
  return products;
}

// Scrape Vestiaire Collective
async function scrapeVestiaire() {
  const products = [];
  const fetch = (await import('node-fetch')).default;
  
  const brands = [
    { id: 'chrome-hearts', name: 'Chrome Hearts' },
    { id: 'balenciaga', name: 'Balenciaga' },
    { id: 'rick-owens', name: 'Rick Owens' },
    { id: 'bottega-veneta', name: 'Bottega Veneta' },
    { id: 'gucci', name: 'Gucci' },
  ];
  
  for (const brand of brands) {
    if (products.length >= 50) break;
    
    console.log(`Scraping Vestiaire: ${brand.name}`);
    
    const url = `https://www.vestiairecollective.com/search/?q=${brand.id}`;
    const html = await fetchPage(url);
    
    if (html) {
      const cheerio = (await import('cheerio')).default;
      const $ = cheerio.load(html);
      
      // Try to find product data in script tags
      $('script').each((i, script) => {
        const content = $(script).html();
        if (content && content.includes('productListItems')) {
          try {
            const match = content.match(/productListItems['"]\s*:\s*(\[[\s\S]*?\])/);
            if (match) {
              const items = JSON.parse(match[1]);
              items.forEach(item => {
                if (products.length >= 50) return;
                products.push({
                  name: item.name,
                  brand: brand.name,
                  price: Math.round(item.price?.amount || 500),
                  category: mapCategory(item.category),
                  main_image_url: item.image,
                  condition: 'excellent',
                  status: 'available',
                  sizes: ['One Size'],
                });
              });
            }
          } catch (e) {}
        }
      });
    }
    
    await sleep(1500);
  }
  
  return products;
}

// Scrape TheRealReal
async function scrapeTheRealReal() {
  const products = [];
  const fetch = (await import('node-fetch')).default;
  
  const categories = [
    'chrome-hearts',
    'balenciaga', 
    'rick-owens',
    'bottega-veneta',
    'gucci',
    'prada',
    'saint-laurent',
  ];
  
  for (const cat of categories) {
    if (products.length >= 50) break;
    
    console.log(`Scraping TheRealReal: ${cat}`);
    
    const url = `https://www.therealreal.com/designers/${cat}`;
    const html = await fetchPage(url);
    
    if (html) {
      const cheerio = (await import('cheerio')).default;
      const $ = cheerio.load(html);
      
      // Find JSON-LD data
      $('script[type="application/ld+json"]').each((i, script) => {
        try {
          const data = JSON.parse($(script).html());
          if (data.itemListElement) {
            data.itemListElement.forEach(item => {
              if (products.length >= 50) return;
              const product = item.item || item;
              if (product.name && product.image) {
                products.push({
                  name: product.name,
                  brand: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  price: Math.round(parseFloat(product.offers?.price) || 500),
                  category: mapCategory(product.category),
                  main_image_url: Array.isArray(product.image) ? product.image[0] : product.image,
                  condition: 'excellent',
                  status: 'available',
                  sizes: ['One Size'],
                });
              }
            });
          }
        } catch (e) {}
      });
    }
    
    await sleep(1500);
  }
  
  return products;
}

// Use Depop API (more accessible)
async function scrapeDepop() {
  const products = [];
  const fetch = (await import('node-fetch')).default;
  
  const searches = [
    'chrome hearts',
    'balenciaga',
    'rick owens',
    'bottega veneta', 
    'gucci vintage',
    'prada',
    'maison margiela',
    'acne studios',
    'saint laurent',
    'off white'
  ];
  
  for (const search of searches) {
    if (products.length >= 50) break;
    
    console.log(`Searching Depop: ${search}`);
    
    try {
      // Depop search API
      const url = `https://webapi.depop.com/api/v2/search/products/?what=${encodeURIComponent(search)}&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.products) {
          data.products.forEach(item => {
            if (products.length >= 50) return;
            
            // Get highest quality image
            const imageUrl = item.preview?.formats?.P4 || 
                           item.preview?.formats?.P3 || 
                           item.preview?.formats?.P2 ||
                           item.pictures?.[0]?.formats?.P4 ||
                           item.pictures?.[0]?.url;
            
            if (imageUrl) {
              products.push({
                name: item.description?.substring(0, 100) || `${search} Item`,
                brand: extractBrand(search),
                price: Math.round(parseFloat(item.price?.amount) || 500),
                category: mapCategory(item.categoryId),
                main_image_url: imageUrl,
                description: item.description,
                condition: 'excellent',
                status: 'available',
                sizes: [item.sizes?.[0]?.name || 'One Size'],
              });
            }
          });
        }
      }
    } catch (e) {
      console.log(`Depop error: ${e.message}`);
    }
    
    await sleep(1000);
  }
  
  return products;
}

// Helper functions
function mapCategory(cat) {
  if (!cat) return 'Clothing';
  const c = cat.toLowerCase();
  if (c.includes('bag') || c.includes('handbag') || c.includes('tote')) return 'Bags';
  if (c.includes('shoe') || c.includes('sneaker') || c.includes('boot')) return 'Shoes';
  if (c.includes('jewel') || c.includes('ring') || c.includes('necklace') || c.includes('bracelet')) return 'Jewelry';
  if (c.includes('access') || c.includes('belt') || c.includes('scarf') || c.includes('hat')) return 'Accessories';
  return 'Clothing';
}

function mapCondition(cond) {
  if (!cond) return 'excellent';
  const c = cond.toLowerCase();
  if (c.includes('new') || c.includes('mint')) return 'like_new';
  if (c.includes('good') || c.includes('gently')) return 'good';
  return 'excellent';
}

function extractBrand(search) {
  const brands = {
    'chrome hearts': 'Chrome Hearts',
    'balenciaga': 'Balenciaga',
    'rick owens': 'Rick Owens',
    'bottega veneta': 'Bottega Veneta',
    'gucci': 'Gucci',
    'prada': 'Prada',
    'maison margiela': 'Maison Margiela',
    'acne studios': 'Acne Studios',
    'saint laurent': 'Saint Laurent',
    'off white': 'Off-White',
  };
  
  for (const [key, value] of Object.entries(brands)) {
    if (search.toLowerCase().includes(key)) return value;
  }
  return search.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearOldProducts() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('Clearing old mock products...');
  
  // Delete products with picsum.photos images (our old mock data)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?main_image_url=like.*picsum*`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  
  console.log('Cleared old products');
}

async function insertProducts(products) {
  const fetch = (await import('node-fetch')).default;
  
  console.log(`\nInserting ${products.length} products...`);
  
  let success = 0;
  
  for (const product of products) {
    // Skip if no image
    if (!product.main_image_url) continue;
    
    // Clean up the product data
    const cleanProduct = {
      name: (product.name || 'Unknown').substring(0, 255),
      brand: product.brand || 'Unknown',
      price: product.price || 500,
      category: product.category || 'Clothing',
      main_image_url: product.main_image_url,
      description: (product.description || '').substring(0, 1000),
      condition: product.condition || 'excellent',
      status: 'available',
      sizes: product.sizes || ['One Size'],
    };
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(cleanProduct),
      });
      
      if (response.ok) {
        console.log(`✓ ${cleanProduct.brand} - ${cleanProduct.name.substring(0, 40)}...`);
        success++;
      } else {
        const err = await response.text();
        console.log(`✗ Failed: ${err.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`✗ Error: ${e.message}`);
    }
  }
  
  console.log(`\nDone! Added ${success} products`);
}

async function main() {
  console.log('=== Luxury Fashion Scraper ===\n');
  
  let allProducts = [];
  
  // Try Depop first (usually works)
  console.log('\n--- Trying Depop ---');
  const depopProducts = await scrapeDepop();
  console.log(`Got ${depopProducts.length} from Depop`);
  allProducts = [...allProducts, ...depopProducts];
  
  // Try Grailed
  if (allProducts.length < 50) {
    console.log('\n--- Trying Grailed ---');
    const grailedProducts = await scrapeGrailed();
    console.log(`Got ${grailedProducts.length} from Grailed`);
    allProducts = [...allProducts, ...grailedProducts];
  }
  
  // Filter to unique products with images
  const uniqueProducts = [];
  const seen = new Set();
  
  for (const p of allProducts) {
    if (p.main_image_url && !seen.has(p.main_image_url)) {
      seen.add(p.main_image_url);
      uniqueProducts.push(p);
    }
    if (uniqueProducts.length >= 50) break;
  }
  
  console.log(`\nTotal unique products with images: ${uniqueProducts.length}`);
  
  if (uniqueProducts.length > 0) {
    await clearOldProducts();
    await insertProducts(uniqueProducts);
  } else {
    console.log('\nNo products found. APIs might be blocked.');
    console.log('Try running the script again or check your network.');
  }
}

main().catch(console.error);
