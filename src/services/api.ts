import { AppState, Product, ReaderStatus } from '../types';

const API_BASE = '/api';

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error('Failed to load application state');
  return res.json();
}

export async function scanRfid(rfid_tag_id: string, force: boolean = false) {
  const res = await fetch(`${API_BASE}/rfid/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rfid_tag_id, force }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Scan error');
  return data;
}

export async function updateQuantity(product_id: string, delta: number) {
  const res = await fetch(`${API_BASE}/cart/update-qty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, delta }),
  });
  return res.json();
}

export async function removeCartItem(product_id: string) {
  const res = await fetch(`${API_BASE}/cart/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id }),
  });
  return res.json();
}

export async function clearCart() {
  const res = await fetch(`${API_BASE}/cart/clear`, {
    method: 'POST',
  });
  return res.json();
}

export async function applyCoupon(coupon_code: string) {
  const res = await fetch(`${API_BASE}/cart/coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupon_code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid coupon');
  return data;
}

export async function toggleReaderStatus(connected: boolean): Promise<ReaderStatus> {
  const res = await fetch(`${API_BASE}/rfid/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connected }),
  });
  return res.json();
}

export async function updateSettings(debounce_seconds: number) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debounce_seconds }),
  });
  return res.json();
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function checkout(customer_name: string, payment_method: string) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name, payment_method }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Checkout failed');
  return data;
}

export function connectSSE(onEvent: (eventData: any) => void) {
  const eventSource = new EventSource(`${API_BASE}/events`);

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onEvent(parsed);
    } catch (e) {
      console.error("SSE parse error", e);
    }
  };

  eventSource.onerror = (err) => {
    console.warn("SSE connection interrupted, retrying...", err);
  };

  return () => {
    eventSource.close();
  };
}
