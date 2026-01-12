// Run this script to update existing products with descriptions
// Execute in browser console on your site

const SUPABASE_URL = 'https://qxvwqhcyxfdlpldsifvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dndxaGN5eGZkbHBsZHNpZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY1MzYsImV4cCI6MjA4MzY2MjUzNn0.dtBInJmVT-RIn8qz8FofAO1XErzrTmh-E6y3vDHHrR8';

const brandDescriptions = {
  'Chrome Hearts': {
    description: 'Authentic Chrome Hearts piece featuring the brand\'s signature gothic aesthetic and sterling silver hardware. Each item is handcrafted in Los Angeles with meticulous attention to detail.',
    care_info: 'Sterling silver components should be polished regularly with a soft cloth. Store in the original dust bag to prevent tarnishing. Leather parts should be conditioned periodically.',
    brand_story: 'Founded in 1988 by Richard Stark, Chrome Hearts began as a leather motorcycle gear brand before evolving into a luxury fashion house. Known for its gothic-inspired designs, sterling silver jewelry, and celebrity following, Chrome Hearts represents the intersection of rock \'n\' roll attitude and exceptional craftsmanship.'
  },
  'Loro Piana': {
    description: 'Exquisite Loro Piana piece crafted from the finest materials. Known for sourcing the world\'s most precious fibers, this item exemplifies understated Italian luxury.',
    care_info: 'Dry clean only. Store flat or on padded hangers. Keep away from direct sunlight and moisture. For cashmere items, use a cashmere comb to remove pilling.',
    brand_story: 'Loro Piana, established in 1924, is the epitome of quiet luxury. The Italian house is renowned for its mastery of the world\'s finest raw materials, including baby cashmere and vicuña. Each piece represents generations of textile expertise and an unwavering commitment to quality over trends.'
  },
  'Hermès': {
    description: 'Iconic Hermès piece representing the pinnacle of French luxury craftsmanship. Each item is meticulously handcrafted by skilled artisans using time-honored techniques.',
    care_info: 'Store in the original dust bag and box. Avoid exposure to water, perfume, and direct sunlight. Leather items should be conditioned with Hermès-approved products only.',
    brand_story: 'Since 1837, Hermès has been synonymous with exceptional craftsmanship and timeless elegance. From its origins as a harness workshop in Paris, the house has evolved into the world\'s most prestigious luxury brand, known for its iconic Birkin and Kelly bags, silk scarves, and unwavering dedication to artisanal excellence.'
  },
  'Balenciaga': {
    description: 'Contemporary Balenciaga piece showcasing the brand\'s avant-garde approach to fashion. This item represents the cutting edge of luxury streetwear and innovative design.',
    care_info: 'Follow care label instructions. Sneakers should be cleaned with appropriate sneaker cleaning products. Store in a cool, dry place away from direct sunlight.',
    brand_story: 'Founded by Cristóbal Balenciaga in 1919, the house has been at the forefront of fashion innovation for over a century. Under creative director Demna, Balenciaga has redefined luxury fashion, merging high fashion with streetwear aesthetics and challenging conventional notions of beauty and style.'
  },
  'Rick Owens': {
    description: 'Distinctive Rick Owens piece embodying the designer\'s signature dark, architectural aesthetic. This item represents the intersection of fashion, art, and subculture.',
    care_info: 'Leather items require professional cleaning. Store in a cool, dry place. Avoid prolonged exposure to sunlight which may affect the color. Handle with care to maintain the garment\'s structure.',
    brand_story: 'Rick Owens launched his eponymous label in 1994, quickly becoming a cult figure in fashion. His designs are characterized by draped silhouettes, monochromatic palettes, and a gothic sensibility that has influenced countless designers. Based in Paris, Owens continues to push boundaries while maintaining his distinctive vision.'
  }
};

async function updateProducts() {
  // First, get all products
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  const products = await response.json();
  console.log(`Found ${products.length} products to update`);
  
  for (const product of products) {
    const brandInfo = brandDescriptions[product.brand];
    if (!brandInfo) {
      console.log(`Skipping ${product.name} - unknown brand`);
      continue;
    }
    
    // Only update if fields are empty
    const updates = {};
    if (!product.description) updates.description = brandInfo.description;
    if (!product.care_info) updates.care_info = brandInfo.care_info;
    if (!product.brand_story) updates.brand_story = brandInfo.brand_story;
    
    if (Object.keys(updates).length === 0) {
      console.log(`Skipping ${product.name} - already has data`);
      continue;
    }
    
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(updates),
    });
    
    if (updateResponse.ok) {
      console.log(`✓ Updated: ${product.name}`);
    } else {
      const error = await updateResponse.text();
      console.error(`✗ Failed: ${product.name}`, error);
    }
  }
  
  console.log('Done!');
}

updateProducts();
