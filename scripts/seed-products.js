// Run this script to seed 25 products
// Execute in browser console on your site, or use Node.js with fetch

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

// Use the same images from your first product
const IMAGE_1 = 'https://qxvwqhcyxfdlpldsifvl.supabase.co/storage/v1/object/public/product-images/1736609741619-image0.jpeg';
const IMAGE_2 = 'https://qxvwqhcyxfdlpldsifvl.supabase.co/storage/v1/object/public/product-images/1736609741620-image1.jpeg';

const brands = ['Chrome Hearts', 'Loro Piana', 'Hermès', 'Balenciaga', 'Rick Owens'];
const categories = ['Clothing', 'Accessories', 'Jewelry', 'Bags', 'Shoes'];
const subcategories = {
  'Clothing': ['Hoodies', 'T-Shirts', 'Jackets', 'Pants', 'Coats'],
  'Accessories': ['Belts', 'Scarves', 'Hats', 'Sunglasses', 'Wallets'],
  'Jewelry': ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Pendants'],
  'Bags': ['Handbags', 'Backpacks', 'Clutches', 'Totes', 'Crossbody'],
  'Shoes': ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Heels'],
};
const conditions = ['excellent', 'like_new', 'good'];
const sizes = {
  'Clothing': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Shoes': ['38', '39', '40', '41', '42', '43', '44', '45'],
  'Jewelry': ['5', '6', '7', '8', '9', '10'],
  'Accessories': ['One Size'],
  'Bags': ['One Size'],
};

const productNames = {
  'Chrome Hearts': ['Cross Hoodie', 'Cemetery Tee', 'Fleur Jacket', 'Dagger Ring', 'CH Plus Necklace', 'Leather Belt', 'Trucker Hat'],
  'Loro Piana': ['Cashmere Sweater', 'Summer Walk Loafers', 'Cashmere Coat', 'Silk Scarf', 'Leather Tote'],
  'Hermès': ['Birkin 25', 'Kelly 28', 'Constance Belt', 'Silk Carré', 'Oran Sandals', 'Collier de Chien'],
  'Balenciaga': ['Track Sneakers', 'Triple S', 'Hourglass Bag', 'Logo Hoodie', 'Speed Trainer'],
  'Rick Owens': ['Geobasket', 'DRKSHDW Hoodie', 'Leather Jacket', 'Cargo Pants', 'Ramones'],
};

const products = [];

for (let i = 0; i < 25; i++) {
  const brand = brands[i % brands.length];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const subcategory = subcategories[category][Math.floor(Math.random() * subcategories[category].length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const productNameList = productNames[brand];
  const name = productNameList[Math.floor(Math.random() * productNameList.length)];
  const price = Math.floor(Math.random() * 5000) + 500;
  const productSizes = sizes[category].slice(0, Math.floor(Math.random() * 4) + 2);

  products.push({
    name: `${brand} ${name}`,
    brand,
    price,
    category,
    subcategory,
    sizes: productSizes,
    description: `Authentic ${brand} ${name.toLowerCase()} in ${condition.replace('_', ' ')} condition. A rare find for collectors and fashion enthusiasts.`,
    care_info: 'Professional dry clean only. Store in dust bag when not in use.',
    brand_story: `${brand} is a luxury brand known for exceptional craftsmanship and timeless design.`,
    condition,
    status: 'available',
    main_image_url: i % 2 === 0 ? IMAGE_1 : IMAGE_2,
  });
}

// Insert products
async function seedProducts() {
  console.log('Seeding 25 products...');
  
  for (const product of products) {
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
      console.log(`✓ Created: ${product.name}`);
    } else {
      const error = await response.text();
      console.error(`✗ Failed: ${product.name}`, error);
    }
  }
  
  console.log('Done!');
}

seedProducts();
