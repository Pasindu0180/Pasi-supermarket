export interface Product {
  product_id: string;
  product_name: string;
  rfid_tag_id: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface CartItem {
  product_id: string;
  rfid_tag_id: string;
  product_name: string;
  category: string;
  price: number;
  quantity: number;
  total_price: number;
  added_time: string;
}

export interface CartMeta {
  cart_id: string;
  subtotal: number;
  discount: number;
  total: number;
  discount_amount: number;
  applied_coupon: string;
}

export interface TransactionItem {
  product_name: string;
  rfid_tag_id: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Transaction {
  transaction_id: string;
  bill_number: string;
  cart_id: string;
  date: string;
  customer_name: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  total: number;
  items: TransactionItem[];
}

export interface RfidScanLog {
  scan_id: string;
  rfid_tag_id: string;
  product_id: string;
  product_name: string;
  scan_time: string;
  cart_id: string;
  action: string;
  status: string;
}

export interface ReaderStatus {
  connected: boolean;
  last_scanned_id: string;
  last_detected_product: string;
  last_scan_time: string;
}

export interface Settings {
  debounce_seconds: number;
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  cart_meta: CartMeta;
  transactions: Transaction[];
  rfid_logs: RfidScanLog[];
  reader_status: ReaderStatus;
  settings: Settings;
}
