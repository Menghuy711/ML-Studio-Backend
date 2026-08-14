import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CartContext } from './CartContextValues';

function getItemKey(item) {
  return item.color ? `${item.id}-${item.color}` : item.id;
}

function mergeCarts(local, remote) {
  const map = new Map();
  for (const item of local) {
    map.set(getItemKey(item), { ...item });
  }
  for (const item of remote) {
    const key = getItemKey(item);
    if (map.has(key)) {
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        quantity: Math.max(existing.quantity, item.quantity),
      });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Listen for auth state changes to know current user and handle signout cleanup
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_OUT') {
        setCartItems([]);
        localStorage.removeItem('cartItems');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Load cart on initial render: localStorage first, then merge with Supabase if logged in
  useEffect(() => {
    let cancelled = false;

    async function loadRemoteCart() {
      const savedCart = localStorage.getItem('cartItems');
      let localCart = [];
      try {
        localCart = savedCart ? JSON.parse(savedCart) : [];
      } catch {
        localCart = [];
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        if (!cancelled) setCartItems(localCart);
        return;
      }

      const { data, error } = await supabase
        .from('user_carts')
        .select('items')
        .eq('user_id', currentUser.id)
        .single();

      if (error || !data) {
        // No remote cart yet — use localStorage
        if (!cancelled) setCartItems(localCart);
        return;
      }

      const remoteCart = data.items || [];
      const merged = mergeCarts(localCart, remoteCart);
      if (!cancelled) setCartItems(merged);
    }

    loadRemoteCart();
    return () => { cancelled = true; };
  }, []);

  // Re-merge cart when user logs in after initial load
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    async function mergeRemoteCart() {
      const savedCart = localStorage.getItem('cartItems');
      let localCart = [];
      try {
        localCart = savedCart ? JSON.parse(savedCart) : [];
      } catch {
        localCart = [];
      }

      const { data, error } = await supabase
        .from('user_carts')
        .select('items')
        .eq('user_id', user.id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setCartItems(localCart);
        return;
      }

      const remoteCart = data.items || [];
      const merged = mergeCarts(localCart, remoteCart);
      setCartItems(merged);
    }

    mergeRemoteCart();
    return () => { cancelled = true; };
  }, [user]);

  // Save to localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save to Supabase whenever cartItems change (if user is logged in)
  useEffect(() => {
    if (!user) return;

    if (cartItems.length === 0) {
      const timeout = setTimeout(async () => {
        const { error } = await supabase
          .from('user_carts')
          .delete()
          .eq('user_id', user.id);
        if (error) console.error('Failed to clear remote cart:', error);
      }, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(async () => {
      const { error } = await supabase.from('user_carts').upsert(
        {
          user_id: user.id,
          items: cartItems,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) console.error('Failed to save cart:', error);
    }, 500); // debounce 500ms

    return () => clearTimeout(timeout);
  }, [cartItems, user]);

  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const targetKey = getItemKey(product);
      const existingItem = prevItems.find((item) => getItemKey(item) === targetKey);
      if (existingItem) {
        return prevItems.map((item) =>
          getItemKey(item) === targetKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemOrId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const targetKey = typeof itemOrId === 'object' ? getItemKey(itemOrId) : itemOrId;
        return getItemKey(item) !== targetKey && item.id !== targetKey;
      })
    );
  }, []);

  const updateQuantity = useCallback((itemOrId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const targetKey = typeof itemOrId === 'object' ? getItemKey(itemOrId) : itemOrId;
        if (getItemKey(item) === targetKey || item.id === targetKey) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    if (user) {
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id);
      if (error) console.error('Failed to clear remote cart:', error);
    }
  }, [user]);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
