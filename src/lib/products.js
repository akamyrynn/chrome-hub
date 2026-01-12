import { supabase, isSupabaseConfigured } from './supabase';

// Fallback demo products when Supabase is not configured
const demoProducts = [
  {
    id: '1',
    name: 'Chrome Hearts Hoodie',
    brand: 'Chrome Hearts',
    price: 1250,
    category: 'Clothing',
    subcategory: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Authentic Chrome Hearts hoodie with signature cross design.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_1.png',
    main_image_url: '/products/product_1.png',
  },
  {
    id: '2',
    name: 'Loro Piana Cashmere Coat',
    brand: 'Loro Piana',
    price: 3500,
    category: 'Clothing',
    subcategory: 'Coats',
    sizes: ['S', 'M', 'L'],
    description: 'Luxurious cashmere coat from Loro Piana.',
    condition: 'like_new',
    status: 'available',
    image: '/products/product_2.png',
    main_image_url: '/products/product_2.png',
  },
  {
    id: '3',
    name: 'Hermès Birkin 25',
    brand: 'Hermès',
    price: 12000,
    category: 'Bags',
    subcategory: 'Handbags',
    sizes: ['One Size'],
    description: 'Iconic Hermès Birkin bag in pristine condition.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_3.png',
    main_image_url: '/products/product_3.png',
  },
  {
    id: '4',
    name: 'Chrome Hearts Ring',
    brand: 'Chrome Hearts',
    price: 890,
    category: 'Jewelry',
    subcategory: 'Rings',
    sizes: ['7', '8', '9', '10'],
    description: 'Sterling silver Chrome Hearts ring with cross motif.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_4.png',
    main_image_url: '/products/product_4.png',
  },
  {
    id: '5',
    name: 'Loro Piana Sneakers',
    brand: 'Loro Piana',
    price: 950,
    category: 'Shoes',
    subcategory: 'Sneakers',
    sizes: ['40', '41', '42', '43', '44'],
    description: 'Premium leather sneakers from Loro Piana.',
    condition: 'like_new',
    status: 'available',
    image: '/products/product_5.png',
    main_image_url: '/products/product_5.png',
  },
  {
    id: '6',
    name: 'Hermès Scarf',
    brand: 'Hermès',
    price: 450,
    category: 'Accessories',
    subcategory: 'Scarves',
    sizes: ['One Size'],
    description: 'Classic Hermès silk scarf with equestrian print.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_6.png',
    main_image_url: '/products/product_6.png',
  },
  {
    id: '7',
    name: 'Chrome Hearts Jacket',
    brand: 'Chrome Hearts',
    price: 2800,
    category: 'Clothing',
    subcategory: 'Jackets',
    sizes: ['M', 'L', 'XL'],
    description: 'Leather jacket with Chrome Hearts hardware.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_7.png',
    main_image_url: '/products/product_7.png',
  },
  {
    id: '8',
    name: 'Balenciaga Track Sneakers',
    brand: 'Balenciaga',
    price: 750,
    category: 'Shoes',
    subcategory: 'Sneakers',
    sizes: ['39', '40', '41', '42', '43'],
    description: 'Balenciaga Track sneakers in excellent condition.',
    condition: 'excellent',
    status: 'available',
    image: '/products/product_8.png',
    main_image_url: '/products/product_8.png',
  },
];

/**
 * Fetch all available products
 */
export async function getProducts(filters = {}) {
  if (!isSupabaseConfigured()) {
    // Return filtered demo products
    let products = [...demoProducts];
    
    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.status) {
      products = products.filter(p => p.status === filters.status);
    }
    
    return { data: products, error: null };
  }

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map main_image_url to image for compatibility
    const products = data?.map(p => ({
      ...p,
      image: p.main_image_url || '/products/product_1.png',
    })) || [];

    return { data: products, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: demoProducts, error };
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id) {
  if (!isSupabaseConfigured()) {
    const product = demoProducts.find(p => p.id === id);
    return { data: product || null, error: product ? null : 'Not found' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      data: {
        ...data,
        image: data.main_image_url,
        images: data.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }
}

/**
 * Fetch single product by short ID (last 6 chars of UUID)
 */
export async function getProductByShortId(shortId) {
  if (!isSupabaseConfigured()) {
    const product = demoProducts.find(p => p.id.endsWith(shortId));
    return { data: product || null, error: product ? null : 'Not found' };
  }

  try {
    // Use LIKE to match the end of the UUID
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .like('id', `%${shortId}`)
      .single();

    if (error) throw error;

    return {
      data: {
        ...data,
        image: data.main_image_url,
        images: data.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching product by short ID:', error);
    return { data: null, error };
  }
}

// Alias for backwards compatibility
export const getProduct = getProductById;

/**
 * Get unique brands from products
 */
export async function getBrands() {
  if (!isSupabaseConfigured()) {
    const brands = [...new Set(demoProducts.map(p => p.brand))];
    return { data: brands, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .eq('status', 'available');

    if (error) throw error;

    const brands = [...new Set(data?.map(p => p.brand) || [])];
    return { data: brands, error: null };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { data: [], error };
  }
}

/**
 * Get unique categories from products
 */
export async function getCategories() {
  if (!isSupabaseConfigured()) {
    const categories = [...new Set(demoProducts.map(p => p.category))];
    return { data: categories, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'available');

    if (error) throw error;

    const categories = [...new Set(data?.map(p => p.category) || [])];
    return { data: categories, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: [], error };
  }
}

/**
 * Subscribe to product changes (realtime)
 */
export function subscribeToProducts(callback) {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    },
  };
}
