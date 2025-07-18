"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import debounce from "lodash/debounce";

export interface CartItem {
  productId: number;
  productName: string;
  categoryId: number;
  imageUrl: string;
  price: number;
  quantity: number;
  currency: string;
  hasVariations: boolean;
  productItemId: number | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: number, productItemId: number | null) => Promise<void>;
  updateQuantity: (productId: number, quantity: number, productItemId: number | null) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const fetchCartFromServer = async (token: string): Promise<CartItem[]> => {
  const response = await fetch("http://localhost:5130/api/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
  const serverCart: CartItem[] = await response.json();
  console.log("Server cart data:", serverCart);
  return serverCart;
};

const saveCartToServer = async (cart: CartItem[], token: string): Promise<void> => {
  const response = await fetch("http://localhost:5130/api/cart/finalize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cart),
  });
  if (!response.ok) throw new Error(`Failed to save cart: ${response.status}`);
};

const getLocalCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return [];
  }
};

const setLocalCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Error setting localStorage:", e);
  }
};

const getLastSyncedCart = (): CartItem[] => {
  try {
    const lastSynced = localStorage.getItem("lastSyncedCart");
    return lastSynced ? JSON.parse(lastSynced) : [];
  } catch (e) {
    console.error("Error accessing last synced cart:", e);
    return [];
  }
};

const setLastSyncedCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem("lastSyncedCart", JSON.stringify(cart));
  } catch (e) {
    console.error("Error setting last synced cart:", e);
  }
};

const getValidToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    return token && token.length > 0 ? token : null;
  } catch (e) {
    console.error("Error accessing localStorage for token:", e);
    return null;
  }
};

const isCartMerged = (): boolean => localStorage.getItem("isCartMerged") === "true";

const setCartMerged = (merged: boolean): void => localStorage.setItem("isCartMerged", merged ? "true" : "false");

const areCartsEqual = (cart1: CartItem[], cart2: CartItem[]): boolean => {
  if (cart1.length !== cart2.length) return false;
  return cart1.every((item1) =>
    cart2.some(
      (item2) =>
        item1.productId === item2.productId &&
        item1.quantity === item2.quantity &&
        item1.productItemId === item2.productItemId
    )
  );
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const localCart = getLocalCart();
    setCart(localCart);
  }, []);

  const mergeCarts = useCallback(
    (serverCart: CartItem[], localCart: CartItem[]): CartItem[] => {
      const mergedMap = new Map<string, CartItem>();

      serverCart.forEach((item) => {
        const key = `${item.productId}-${item.productItemId ?? 'no-variation'}`;
        mergedMap.set(key, { ...item });
      });

      localCart.forEach((localItem) => {
        const key = `${localItem.productId}-${localItem.productItemId ?? 'no-variation'}`;
        const existingItem = mergedMap.get(key);
        if (existingItem) {
          existingItem.quantity = Math.min(existingItem.quantity + localItem.quantity, 100);
          mergedMap.set(key, existingItem);
        } else {
          mergedMap.set(key, { ...localItem, quantity: Math.min(localItem.quantity, 100) });
        }
      });

      const uniqueMerged = Array.from(mergedMap.values());
      console.log("Merged cart (unique):", uniqueMerged);
      return uniqueMerged;
    },
    []
  );

  useEffect(() => {
    const loadCart = async () => {
      const token = getValidToken();
      if (isLoggedIn && token && !isCartMerged()) {
        setIsLoading(true);
        try {
          const serverCart = await fetchCartFromServer(token);
          const localCart = getLocalCart();
          const mergedCart = mergeCarts(serverCart, localCart);
          setCart(mergedCart);
          setLocalCart(mergedCart);
          await saveCartToServer(mergedCart, token);
          setLastSyncedCart(mergedCart);
          setCartMerged(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load cart");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCart();
  }, [isLoggedIn, mergeCarts]);

  const syncCartWithServerNow = useCallback(
    async (currentCart: CartItem[]) => {
      const token = getValidToken();
      if (!isLoggedIn || !token) return;

      const lastSyncedCart = getLastSyncedCart();
      if (!areCartsEqual(currentCart, lastSyncedCart)) {
        setIsLoading(true);
        try {
          await saveCartToServer(currentCart, token);
          setLastSyncedCart(currentCart);
          console.log("Cart synced immediately:", currentCart);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to sync cart");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("No changes detected, skipping immediate sync");
      }
    },
    [isLoggedIn]
  );

  const syncCartInner = useCallback(
    (currentCart: CartItem[]) => {
      const token = getValidToken();
      if (isLoggedIn && token) {
        const lastSyncedCart = getLastSyncedCart();
        if (!areCartsEqual(currentCart, lastSyncedCart)) {
          saveCartToServer(currentCart, token)
            .then(() => {
              setLastSyncedCart(currentCart);
              console.log("Cart synced to server (debounced):", currentCart);
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "Failed to sync cart");
            });
        } else {
          console.log("No changes detected, skipping debounced sync");
        }
      }
    },
    [isLoggedIn]
  );

  const syncCartWithServer = useMemo(() => debounce(syncCartInner, 60000), [syncCartInner]);

  useEffect(() => {
    syncCartWithServer(cart);
    return () => {
      syncCartWithServer.cancel();
    };
  }, [cart, syncCartWithServer]);

  const addToCart = useCallback(
    async (product: CartItem) => {
      const newCart = cart.find(
        (item) => item.productId === product.productId && item.productItemId === product.productItemId
      )
        ? cart.map((item) =>
            item.productId === product.productId && item.productItemId === product.productItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...cart, { ...product, quantity: product.quantity || 1 }];

      setCart(newCart);
      setLocalCart(newCart);
      await syncCartWithServerNow(newCart);
    },
    [cart, syncCartWithServerNow]
  );

  const removeFromCart = useCallback(
    async (productId: number, productItemId: number | null) => {
      const newCart = cart.filter(
        (item) => !(item.productId === productId && item.productItemId === productItemId)
      );
      setCart(newCart);
      setLocalCart(newCart);
      await syncCartWithServerNow(newCart);
    },
    [cart, syncCartWithServerNow]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number, productItemId: number | null) => {
      const newCart = cart.map((item) =>
        item.productId === productId && item.productItemId === productItemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      setCart(newCart);
      setLocalCart(newCart);
      await syncCartWithServerNow(newCart);
    },
    [cart, syncCartWithServerNow]
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    setLocalCart([]);
    setLastSyncedCart([]);
    setCartMerged(false);
    const token = getValidToken();
    if (isLoggedIn && token) {
      await saveCartToServer([], token);
    }
  }, [isLoggedIn]);

  const resetError = useCallback(() => setError(null), []);

  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading,
      error,
      resetError,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, isLoading, error, resetError]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};