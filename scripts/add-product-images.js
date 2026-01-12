/**
 * Add additional images to products
 * Run: node scripts/add-product-images.js
 */

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

// Additional product images from StockX CDN
const additionalImages = {
  'Chrome Hearts': [
    'https://images.stockx.com/images/Chrome-Hearts-Cross-Patch-Hoodie-Black.jpg',
    'https://images.stockx.com/images/Chrome-Hearts-Horseshoe-Hoodie-Black.jpg',
    'https://images.stockx.com/images/Chrome-Hearts-Floral-Cross-T-Shirt-Black.jpg',
  ],
  'Balenciaga': [
    'https://images.stockx.com/images/Balenciaga-Track-2-Sneaker-Black.jpg',
    'https://images.stockx.com/images/Balenciaga-Speed-2-Trainer-Black.jpg',
    'https://images.stockx.com/images/Balenciaga-Defender-Sneaker-Black.jpg',
  ],
  'Rick Owens': [
    'https://images.stockx.com/images/Rick-Owens-DRKSHDW-Abstract-Sneaker-Black.jpg',
    'https://images.stockx.com/images/Rick-Owens-Beatle-Boot-Black.jpg',
    'https://images.stockx.com/images/Rick-Owens-Geth-Runner-Black.jpg',
  ],
  'Gucci': [
    'https://images.stockx.com/images/Gucci-Screener-Sneaker-White.jpg',
    'https://images.stockx.com/images/Gucci-Tennis-1977-Sneaker-White.jpg',
    'https://images.stockx.com/images/Gucci-Horsebit-Loafer-Black.jpg',
  ],
  'Prada': [
    'https://images.stockx.com/images/Prada-America-Cup-Sneaker-Black.jpg',
    'https://images.stockx.com/images/Prada-Monolith-Boot-Black.jpg',
    'https://images.stockx.com/images/Prada-Downtown-Sneaker-White.jpg',
  ],
};

async function main() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('=== Adding Product Images ===\n');
  
  // Get all products
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,brand,name`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  
  const products = await response.json();
  console.log(`Found ${products.length} products\n`);
  
  let added = 0;
  
  for (const product of products) {
    const brandImages = additionalImages[product.brand];
    if (!brandImages) continue;
    
    // Add 2-3 additional images per product
    const imagesToAdd = brandImages.slice(0, Math.floor(Math.random() * 2) + 2);
    
    for (let i = 0; i < imagesToAdd.length; i++) {
      try {
        const imgResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            product_id: product.id,
            image_url: imagesToAdd[i],
            is_main: false,
            sort_order: i + 1,
            media_type: 'image',
          }),
        });
        
        if (imgResponse.ok) {
          added++;
        }
      } catch (e) {}
    }
    
    console.log(`✓ ${product.brand} - ${product.name}: added ${imagesToAdd.length} images`);
  }
  
  console.log(`\n✅ Done! Added ${added} images total`);
}

main().catch(console.error);
