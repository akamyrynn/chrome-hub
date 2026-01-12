/**
 * Seed with real luxury product images from CDN sources
 * These are publicly accessible product images
 */

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

// Real product images from various CDNs (publicly accessible)
const products = [
  // Chrome Hearts
  { name: 'Chrome Hearts Cross Hoodie', brand: 'Chrome Hearts', price: 1850, category: 'Clothing', image: 'https://images.stockx.com/images/Chrome-Hearts-Matty-Boy-Suggest-Hoodie-Black.jpg' },
  { name: 'Chrome Hearts Cemetery Cross Tee', brand: 'Chrome Hearts', price: 650, category: 'Clothing', image: 'https://images.stockx.com/images/Chrome-Hearts-Cemetery-Cross-T-Shirt-Black.jpg' },
  { name: 'Chrome Hearts Dagger Ring', brand: 'Chrome Hearts', price: 890, category: 'Jewelry', image: 'https://images.stockx.com/images/Chrome-Hearts-Dagger-Ring-Silver.jpg' },
  { name: 'Chrome Hearts Plus Ring', brand: 'Chrome Hearts', price: 750, category: 'Jewelry', image: 'https://images.stockx.com/images/Chrome-Hearts-Plus-Ring-Silver.jpg' },
  { name: 'Chrome Hearts Trucker Hat', brand: 'Chrome Hearts', price: 450, category: 'Accessories', image: 'https://images.stockx.com/images/Chrome-Hearts-Trucker-Hat-Black.jpg' },
  
  // Balenciaga
  { name: 'Balenciaga Track Sneakers', brand: 'Balenciaga', price: 895, category: 'Shoes', image: 'https://images.stockx.com/images/Balenciaga-Track-Sneaker-Black.jpg' },
  { name: 'Balenciaga Triple S', brand: 'Balenciaga', price: 975, category: 'Shoes', image: 'https://images.stockx.com/images/Balenciaga-Triple-S-Sneaker-Black.jpg' },
  { name: 'Balenciaga Speed Trainer', brand: 'Balenciaga', price: 850, category: 'Shoes', image: 'https://images.stockx.com/images/Balenciaga-Speed-Trainer-Black.jpg' },
  { name: 'Balenciaga Logo Hoodie', brand: 'Balenciaga', price: 1150, category: 'Clothing', image: 'https://images.stockx.com/images/Balenciaga-Logo-Hoodie-Black.jpg' },
  { name: 'Balenciaga Campaign Tee', brand: 'Balenciaga', price: 550, category: 'Clothing', image: 'https://images.stockx.com/images/Balenciaga-Campaign-T-Shirt-Black.jpg' },
  
  // Rick Owens
  { name: 'Rick Owens Geobasket', brand: 'Rick Owens', price: 1350, category: 'Shoes', image: 'https://images.stockx.com/images/Rick-Owens-Geobasket-Black.jpg' },
  { name: 'Rick Owens Ramones', brand: 'Rick Owens', price: 1100, category: 'Shoes', image: 'https://images.stockx.com/images/Rick-Owens-Ramones-Black.jpg' },
  { name: 'Rick Owens DRKSHDW Hoodie', brand: 'Rick Owens', price: 750, category: 'Clothing', image: 'https://images.stockx.com/images/Rick-Owens-DRKSHDW-Hoodie-Black.jpg' },
  { name: 'Rick Owens Leather Jacket', brand: 'Rick Owens', price: 2800, category: 'Clothing', image: 'https://images.stockx.com/images/Rick-Owens-Leather-Jacket-Black.jpg' },
  { name: 'Rick Owens Cargo Pants', brand: 'Rick Owens', price: 890, category: 'Clothing', image: 'https://images.stockx.com/images/Rick-Owens-Cargo-Pants-Black.jpg' },
  
  // Gucci
  { name: 'Gucci Ace Sneakers', brand: 'Gucci', price: 650, category: 'Shoes', image: 'https://images.stockx.com/images/Gucci-Ace-Sneaker-White.jpg' },
  { name: 'Gucci Rhyton Sneakers', brand: 'Gucci', price: 890, category: 'Shoes', image: 'https://images.stockx.com/images/Gucci-Rhyton-Sneaker-Ivory.jpg' },
  { name: 'Gucci GG Belt', brand: 'Gucci', price: 450, category: 'Accessories', image: 'https://images.stockx.com/images/Gucci-GG-Belt-Black.jpg' },
  { name: 'Gucci Marmont Bag', brand: 'Gucci', price: 2100, category: 'Bags', image: 'https://images.stockx.com/images/Gucci-GG-Marmont-Bag-Black.jpg' },
  { name: 'Gucci Logo Hoodie', brand: 'Gucci', price: 1350, category: 'Clothing', image: 'https://images.stockx.com/images/Gucci-Logo-Hoodie-Black.jpg' },
  
  // Prada
  { name: 'Prada Re-Nylon Backpack', brand: 'Prada', price: 1450, category: 'Bags', image: 'https://images.stockx.com/images/Prada-Re-Nylon-Backpack-Black.jpg' },
  { name: 'Prada Cloudbust Thunder', brand: 'Prada', price: 990, category: 'Shoes', image: 'https://images.stockx.com/images/Prada-Cloudbust-Thunder-Black.jpg' },
  { name: 'Prada Triangle Logo Tee', brand: 'Prada', price: 650, category: 'Clothing', image: 'https://images.stockx.com/images/Prada-Triangle-Logo-T-Shirt-Black.jpg' },
  { name: 'Prada Saffiano Wallet', brand: 'Prada', price: 550, category: 'Accessories', image: 'https://images.stockx.com/images/Prada-Saffiano-Wallet-Black.jpg' },
  { name: 'Prada Nylon Jacket', brand: 'Prada', price: 1850, category: 'Clothing', image: 'https://images.stockx.com/images/Prada-Nylon-Jacket-Black.jpg' },
  
  // Off-White
  { name: 'Off-White Industrial Belt', brand: 'Off-White', price: 215, category: 'Accessories', image: 'https://images.stockx.com/images/Off-White-Industrial-Belt-Yellow.jpg' },
  { name: 'Off-White Diagonal Hoodie', brand: 'Off-White', price: 650, category: 'Clothing', image: 'https://images.stockx.com/images/Off-White-Diagonal-Hoodie-Black.jpg' },
  { name: 'Off-White Arrow Tee', brand: 'Off-White', price: 350, category: 'Clothing', image: 'https://images.stockx.com/images/Off-White-Arrow-T-Shirt-Black.jpg' },
  { name: 'Off-White Out Of Office', brand: 'Off-White', price: 515, category: 'Shoes', image: 'https://images.stockx.com/images/Off-White-Out-Of-Office-White.jpg' },
  { name: 'Off-White Binder Clip Bag', brand: 'Off-White', price: 1150, category: 'Bags', image: 'https://images.stockx.com/images/Off-White-Binder-Clip-Bag-Black.jpg' },
  
  // Fear of God
  { name: 'Fear of God Essentials Hoodie', brand: 'Fear of God', price: 180, category: 'Clothing', image: 'https://images.stockx.com/images/Fear-of-God-Essentials-Hoodie-Black.jpg' },
  { name: 'Fear of God Essentials Tee', brand: 'Fear of God', price: 65, category: 'Clothing', image: 'https://images.stockx.com/images/Fear-of-God-Essentials-T-Shirt-Black.jpg' },
  { name: 'Fear of God Essentials Sweatpants', brand: 'Fear of God', price: 120, category: 'Clothing', image: 'https://images.stockx.com/images/Fear-of-God-Essentials-Sweatpants-Black.jpg' },
  { name: 'Fear of God 101 Sneakers', brand: 'Fear of God', price: 595, category: 'Shoes', image: 'https://images.stockx.com/images/Fear-of-God-101-Sneaker-Black.jpg' },
  { name: 'Fear of God Jacket', brand: 'Fear of God', price: 1250, category: 'Clothing', image: 'https://images.stockx.com/images/Fear-of-God-Jacket-Black.jpg' },
  
  // Amiri
  { name: 'Amiri MX1 Jeans', brand: 'Amiri', price: 1090, category: 'Clothing', image: 'https://images.stockx.com/images/Amiri-MX1-Jeans-Black.jpg' },
  { name: 'Amiri Skel Top Low', brand: 'Amiri', price: 595, category: 'Shoes', image: 'https://images.stockx.com/images/Amiri-Skel-Top-Low-Black.jpg' },
  { name: 'Amiri Logo Hoodie', brand: 'Amiri', price: 750, category: 'Clothing', image: 'https://images.stockx.com/images/Amiri-Logo-Hoodie-Black.jpg' },
  { name: 'Amiri Trucker Hat', brand: 'Amiri', price: 295, category: 'Accessories', image: 'https://images.stockx.com/images/Amiri-Trucker-Hat-Black.jpg' },
  { name: 'Amiri Bandana Tee', brand: 'Amiri', price: 395, category: 'Clothing', image: 'https://images.stockx.com/images/Amiri-Bandana-T-Shirt-Black.jpg' },
  
  // Palm Angels
  { name: 'Palm Angels Track Jacket', brand: 'Palm Angels', price: 650, category: 'Clothing', image: 'https://images.stockx.com/images/Palm-Angels-Track-Jacket-Black.jpg' },
  { name: 'Palm Angels Bear Hoodie', brand: 'Palm Angels', price: 550, category: 'Clothing', image: 'https://images.stockx.com/images/Palm-Angels-Bear-Hoodie-Black.jpg' },
  { name: 'Palm Angels Logo Tee', brand: 'Palm Angels', price: 295, category: 'Clothing', image: 'https://images.stockx.com/images/Palm-Angels-Logo-T-Shirt-Black.jpg' },
  { name: 'Palm Angels Track Pants', brand: 'Palm Angels', price: 450, category: 'Clothing', image: 'https://images.stockx.com/images/Palm-Angels-Track-Pants-Black.jpg' },
  { name: 'Palm Angels Vulcanized Sneakers', brand: 'Palm Angels', price: 395, category: 'Shoes', image: 'https://images.stockx.com/images/Palm-Angels-Vulcanized-Sneaker-White.jpg' },
  
  // Bottega Veneta
  { name: 'Bottega Veneta Cassette Bag', brand: 'Bottega Veneta', price: 2950, category: 'Bags', image: 'https://images.stockx.com/images/Bottega-Veneta-Cassette-Bag-Black.jpg' },
  { name: 'Bottega Veneta Puddle Boots', brand: 'Bottega Veneta', price: 850, category: 'Shoes', image: 'https://images.stockx.com/images/Bottega-Veneta-Puddle-Boot-Black.jpg' },
  { name: 'Bottega Veneta Intrecciato Wallet', brand: 'Bottega Veneta', price: 650, category: 'Accessories', image: 'https://images.stockx.com/images/Bottega-Veneta-Intrecciato-Wallet-Black.jpg' },
  { name: 'Bottega Veneta Pouch', brand: 'Bottega Veneta', price: 2500, category: 'Bags', image: 'https://images.stockx.com/images/Bottega-Veneta-Pouch-Black.jpg' },
  { name: 'Bottega Veneta Lug Boots', brand: 'Bottega Veneta', price: 1350, category: 'Shoes', image: 'https://images.stockx.com/images/Bottega-Veneta-Lug-Boot-Black.jpg' },
];

async function main() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('=== Seeding Real Luxury Products ===\n');
  
  // Clear old picsum products
  console.log('Clearing old mock products...');
  await fetch(`${SUPABASE_URL}/rest/v1/products?main_image_url=like.*picsum*`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  
  console.log(`\nInserting ${products.length} products...\n`);
  
  let success = 0;
  const conditions = ['excellent', 'like_new', 'good'];
  const sizes = {
    Clothing: ['S', 'M', 'L', 'XL'],
    Shoes: ['40', '41', '42', '43', '44'],
    Bags: ['One Size'],
    Accessories: ['One Size'],
    Jewelry: ['6', '7', '8', '9', '10'],
  };
  
  for (const product of products) {
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
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
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          main_image_url: product.image,
          description: `Authentic ${product.brand} ${product.name.toLowerCase()}. ${condition === 'like_new' ? 'Worn once, like new condition.' : condition === 'good' ? 'Gently used, good condition.' : 'Excellent condition, minimal signs of wear.'}`,
          care_info: 'Professional dry clean recommended. Store in dust bag.',
          condition: condition,
          status: 'available',
          sizes: sizes[product.category] || ['One Size'],
        }),
      });
      
      if (response.ok) {
        console.log(`✓ ${product.brand} - ${product.name}`);
        success++;
      } else {
        const err = await response.text();
        console.log(`✗ ${product.name}: ${err.substring(0, 50)}`);
      }
    } catch (e) {
      console.log(`✗ ${product.name}: ${e.message}`);
    }
  }
  
  console.log(`\n✅ Done! Added ${success} products`);
}

main().catch(console.error);
