import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Get or create client by email
 */
export async function getOrCreateClient(clientData) {
  if (!isSupabaseConfigured()) {
    return { 
      data: { id: 'demo-client', ...clientData }, 
      error: null 
    };
  }

  try {
    // Check if client exists
    const { data: existing } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientData.email)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Create new client
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        tier: 'new',
        ltv: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error getting/creating client:', error);
    return { data: null, error };
  }
}

/**
 * Add product to client's wishlist
 */
export async function addToWishlist(clientId, productId) {
  if (!isSupabaseConfigured()) {
    return { data: { client_id: clientId, product_id: productId }, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .upsert({
        client_id: clientId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { data: null, error };
  }
}

/**
 * Remove product from client's wishlist
 */
export async function removeFromWishlist(clientId, productId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('client_id', clientId)
      .eq('product_id', productId);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { data: null, error };
  }
}

/**
 * Get client's wishlist
 */
export async function getWishlist(clientId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (*)
      `)
      .eq('client_id', clientId);

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { data: [], error };
  }
}

/**
 * Add to waitlist for sold/reserved product
 */
export async function addToWaitlist(clientId, productId) {
  if (!isSupabaseConfigured()) {
    return { data: { client_id: clientId, product_id: productId }, error: null };
  }

  try {
    // Get client LTV for priority
    const { data: client } = await supabase
      .from('clients')
      .select('ltv')
      .eq('id', clientId)
      .single();

    const { data, error } = await supabase
      .from('waitlists')
      .upsert({
        client_id: clientId,
        product_id: productId,
        priority: client?.ltv || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { data: null, error };
  }
}

/**
 * Track product view
 */
export async function trackProductView(clientId, productId) {
  if (!isSupabaseConfigured() || !clientId) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('client_views')
      .insert({
        client_id: clientId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error tracking view:', error);
    return { data: null, error };
  }
}

/**
 * Update client tier based on LTV
 */
export async function updateClientTier(clientId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    const { data: client } = await supabase
      .from('clients')
      .select('ltv')
      .eq('id', clientId)
      .single();

    if (!client) return { data: null, error: 'Client not found' };

    let tier = 'new';
    if (client.ltv >= 50000) tier = 'vvip';
    else if (client.ltv >= 20000) tier = 'vip';
    else if (client.ltv >= 5000) tier = 'regular';

    const { data, error } = await supabase
      .from('clients')
      .update({ tier })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating client tier:', error);
    return { data: null, error };
  }
}
