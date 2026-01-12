/**
 * Grailed Scraper - Direct HTML parsing
 * Run: node scripts/scrape-grailed.js
 */

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

async function scrapeGrailedHTML() {
  const fetch = (await import('node-fetch')).default;
  const cheerio = (await import('cheerio')).default;
  
  const products = [];
  
  const searches = [
    'chrome%20hearts',
    'balenciaga',
    'rick%20owens',
    'bottega%20veneta',
    'gucci',
    'prada',
    'maison%20margiela',
    'off%20white',
    'saint%20laurent',
    'acne%20studios'
  ];
  
  for (const search of searches) {
    if (products.length >= 50) break;
    
    const brandName = decodeURIComponent(search).split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    
    console.log(`Scraping Grailed: ${brandName}`);
    
    try {
      const url = `https://www.grailed.com/shop/${search}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        }
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Look for __NEXT_DATA__ which contains all product info
      const nextDataScript = $('#__NEXT_DATA__').html();
      
      if (nextDataScript) {
        try {
          const nextData = JSON.parse(nextDataScript);
          const listings = nextData?.props?.pageProps?.listings || 
                          nextData?.props?.pageProps?.data?.listings ||
                          [];
          
          console.log(`Found ${listings.length} listings in __NEXT_DATA__`);
          
          listings.forEach(item => {
            if (products.length >= 50) return;
            
            const imageUrl = item.cover_photo?.url || 
                           item.photos?.[0]?.url ||
                           item.image_url;
            
            if (imageUrl && item.title) {
              products.push({
                name: item.title,
                brand: item.designer?.name || item.designers?.[0]?.name || brandName,
                price: Math.round(item.price || item.sold_price || 500),
                category: mapCategory(item.category_path || item.department),
                main_image_url: imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl,
                description: item.description || `${brandName} ${item.title}`,
                condition: mapCondition(item.condition),
                status: 'available',
                sizes: [item.size || 'One Size'],
              });
            }
          });
        } catch (e) {
          console.log(`JSON parse error: ${e.message}`);
        }
      }
      
      // Also try parsing visible product cards
      $('[class*="ListingCard"], [class*="feed-item"], .listing-item').each((i, el) => {
        if (products.length >= 50) return;
        
        const $el = $(el);
        const title = $el.find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
        const price = $el.find('[class*="price"]').first().text().trim();
        const image = $el.find('img').attr('src') || $el.find('img').attr('data-src');
        
        if (title && image && !products.some(p => p.name === title)) {
          products.push({
            name: title,
            brand: brandName,
            price: parseInt(price.replace(/[^0-9]/g, '')) || 500,
            category: 'Clothing',
            main_image_url: image.startsWith('//') ? 'https:' + image : image,
            condition: 'excellent',
            status: 'available',
            sizes: ['One Size'],
          });
        }
      });
      
      console.log(`Total products so far: ${products.length}`);
      
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    
    // Wait between requests
    await new Promise(r => setTimeout(r, 2000));
  }
  
  return products;
}

function mapCategory(cat) {
  if (!cat) return 'Clothing';
  const c = (Array.isArray(cat) ? cat.join(' ') : cat).toLowerCase();
  if (c.includes('bag') || c.includes('handbag')) return 'Bags';
  if (c.includes('shoe') || c.includes('sneaker') || c.includes('boot') || c.includes('footwear')) return 'Shoes';
  if (c.includes('jewel') || c.includes('ring') || c.includes('necklace')) return 'Jewelry';
  if (c.includes('access') || c.includes('belt') || c.includes('hat') || c.includes('scarf')) return 'Accessories';
  return 'Clothing';
}

function mapCondition(cond) {
  if (!cond) return 'excellent';
  const c = cond.toLowerCase();
  if (c.includes('new') || c.includes('10')) return 'like_new';
  if (c.includes('used') || c.includes('7') || c.includes('8')) return 'good';
  return 'excellent';
}

async function insertProducts(products) {
  const fetch = (await import('node-fetch')).default;
  
  console.log(`\nInserting ${products.length} products...`);
  
  // First clear old picsum products
  await fetch(`${SUPABASE_URL}/rest/v1/products?main_image_url=like.*picsum*`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  
  let success = 0;
  
  for (const product of products) {
    if (!product.main_image_url) continue;
    
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
        console.log(`✓ ${cleanProduct.brand} - ${cleanProduct.name.substring(0, 50)}`);
        success++;
      }
    } catch (e) {}
  }
  
  console.log(`\nDone! Added ${success} products`);
}

async function main() {
  console.log('=== Grailed Scraper ===\n');
  
  const products = await scrapeGrailedHTML();
  
  console.log(`\nFound ${products.length} products total`);
  
  if (products.length > 0) {
    // Show samples
    console.log('\nSample products:');
    products.slice(0, 5).forEach(p => {
      console.log(`- ${p.brand}: ${p.name.substring(0, 40)}... (€${p.price})`);
      console.log(`  Image: ${p.main_image_url.substring(0, 60)}...`);
    });
    
    await insertProducts(products);
  } else {
    console.log('\nNo products scraped. Site might be blocking requests.');
  }
}

main().catch(console.error);
