import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  if (!isSupabaseConfigured()) {
    return { 
      data: { id: 'demo-' + Date.now(), order_number: 1000 + Math.floor(Math.random() * 100) }, 
      error: null 
    };
  }

  try {
    const { items, client, ...orderInfo } = orderData;

    // Create or get client
    let clientId = null;
    if (client) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', client.email)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: client.name,
            email: client.email,
            phone: client.phone,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal - (orderInfo.discount || 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: clientId,
        status: 'new',
        subtotal,
        discount: orderInfo.discount || 0,
        total,
        delivery_address: orderInfo.delivery_address,
        notes: orderInfo.notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      size: item.size,
      original_price: item.price,
      final_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product status to reserved
    for (const item of items) {
      await supabase
        .from('products')
        .update({ status: 'reserved' })
        .eq('id', item.product_id);
    }

    // Add to status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'new',
      changed_by: 'System',
      notes: 'Order created',
    });

    return { data: order, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error };
  }
}

/**
 * Get order by ID
 */
export async function getOrder(id) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients (*),
        order_items (*, products (name, main_image_url)),
        order_status_history (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { data: null, error };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status, changedBy = 'Admin', notes = null) {
  if (!isSupabaseConfigured()) {
    return { data: { id: orderId, status }, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Add to status history
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status,
      changed_by: changedBy,
      notes,
    });

    // If delivered, update product status to sold and client LTV
    if (status === 'delivered') {
      const { data: orderData } = await supabase
        .from('orders')
        .select('client_id, total, order_items (product_id)')
        .eq('id', orderId)
        .single();

      if (orderData) {
        // Update products to sold
        for (const item of orderData.order_items || []) {
          await supabase
            .from('products')
            .update({ status: 'sold' })
            .eq('id', item.product_id);
        }

        // Update client LTV
        if (orderData.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('ltv')
            .eq('id', orderData.client_id)
            .single();

          await supabase
            .from('clients')
            .update({ ltv: (client?.ltv || 0) + orderData.total })
            .eq('id', orderData.client_id);
        }
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to order changes (realtime)
 */
export function subscribeToOrders(callback) {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
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
