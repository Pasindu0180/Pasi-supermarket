import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database Persistence File
const DB_FILE = path.join(__dirname, 'db.json');

// Initial Seed Data
const initialData = {
  products: [
    {
      product_id: "PRD-101",
      product_name: "Keeri Samba Rice 5kg",
      rfid_tag_id: "RFID001",
      category: "Grains & Staples",
      price: 1250,
      stock: 45,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-102",
      product_name: "Anchor Full Cream Milk Powder 400g",
      rfid_tag_id: "RFID002",
      category: "Dairy & Beverage",
      price: 950,
      stock: 30,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-103",
      product_name: "Maliban Gold Marie Biscuit 300g",
      rfid_tag_id: "RFID003",
      category: "Snacks & Biscuits",
      price: 250,
      stock: 60,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-104",
      product_name: "White Sugar 1kg",
      rfid_tag_id: "RFID004",
      category: "Grains & Staples",
      price: 300,
      stock: 50,
      image: "https://images.unsplash.com/photo-1622484210800-885160867086?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-105",
      product_name: "Watawala Ceylon Black Tea 500g",
      rfid_tag_id: "RFID005",
      category: "Dairy & Beverage",
      price: 780,
      stock: 25,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-106",
      product_name: "Fortune Sunflower Oil 1L",
      rfid_tag_id: "RFID006",
      category: "Cooking Essentials",
      price: 1450,
      stock: 18,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-107",
      product_name: "Munchee Chocolate Biscuits 200g",
      rfid_tag_id: "RFID007",
      category: "Snacks & Biscuits",
      price: 320,
      stock: 40,
      image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    },
    {
      product_id: "PRD-108",
      product_name: "Mysuru Red Dhal 1kg",
      rfid_tag_id: "RFID008",
      category: "Grains & Staples",
      price: 420,
      stock: 35,
      image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
      status: "In Stock"
    }
  ],
  cart: [
    {
      product_id: "PRD-101",
      rfid_tag_id: "RFID001",
      product_name: "Keeri Samba Rice 5kg",
      category: "Grains & Staples",
      price: 1250,
      quantity: 1,
      total_price: 1250,
      added_time: new Date().toISOString()
    },
    {
      product_id: "PRD-102",
      rfid_tag_id: "RFID002",
      product_name: "Anchor Full Cream Milk Powder 400g",
      category: "Dairy & Beverage",
      price: 950,
      quantity: 2,
      total_price: 1900,
      added_time: new Date().toISOString()
    },
    {
      product_id: "PRD-103",
      rfid_tag_id: "RFID003",
      product_name: "Maliban Gold Marie Biscuit 300g",
      category: "Snacks & Biscuits",
      price: 250,
      quantity: 1,
      total_price: 250,
      added_time: new Date().toISOString()
    }
  ],
  transactions: [
    {
      transaction_id: "TXN-9001",
      bill_number: "PS-000120",
      cart_id: "CART-7892",
      date: "2026-08-11 14:30:12",
      customer_name: "Sampath Perera",
      payment_method: "Cash",
      subtotal: 2450,
      discount: 50,
      total: 2400,
      items: [
        { product_name: "Keeri Samba Rice 5kg", rfid_tag_id: "RFID001", unit_price: 1250, quantity: 1, total_price: 1250 },
        { product_name: "Anchor Full Cream Milk Powder 400g", rfid_tag_id: "RFID002", unit_price: 950, quantity: 1, total_price: 950 },
        { product_name: "Maliban Gold Marie Biscuit 300g", rfid_tag_id: "RFID003", unit_price: 250, quantity: 1, total_price: 250 }
      ]
    }
  ],
  rfid_logs: [],
  reader_status: {
    connected: true,
    last_scanned_id: "RFID003",
    last_detected_product: "Maliban Gold Marie Biscuit 300g",
    last_scan_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  },
  cart_meta: {
    cart_id: "CART-7892",
    discount_amount: 100,
    applied_coupon: "PASI100"
  },
  settings: {
    debounce_seconds: 3
  }
};

// Database helper functions
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, writing seed data", err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error saving db.json", err);
  }
}

let db = loadDB();
let sseClients = [];
let lastScanTracker = {}; // { RFID001: timestamp }

function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Calculations helper
function calculateCartTotals(cartItems, discountAmount = 0) {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}

// SSE Live Stream Endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// GET /api/state - Complete app initial state
app.get('/api/state', (req, res) => {
  db = loadDB();
  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  res.json({
    products: db.products,
    cart: db.cart,
    cart_meta: { ...db.cart_meta, ...totals },
    transactions: db.transactions,
    rfid_logs: db.rfid_logs,
    reader_status: db.reader_status,
    settings: db.settings
  });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  db = loadDB();
  res.json(db.products);
});

// POST /api/products - Create Product
app.post('/api/products', (req, res) => {
  db = loadDB();
  const { product_name, rfid_tag_id, category, price, stock, image } = req.body;

  if (!product_name || !rfid_tag_id || !price) {
    return res.status(400).json({ error: "Product name, RFID Tag ID, and price are required." });
  }

  // Check duplicate RFID
  const existingRfid = db.products.find(p => p.rfid_tag_id.toUpperCase() === rfid_tag_id.trim().toUpperCase());
  if (existingRfid) {
    return res.status(400).json({ error: `RFID Tag ID '${rfid_tag_id}' is already assigned to '${existingRfid.product_name}'. Duplicate tags are not allowed.` });
  }

  const newId = `PRD-${Date.now().toString().slice(-4)}`;
  const newProduct = {
    product_id: newId,
    product_name: product_name.trim(),
    rfid_tag_id: rfid_tag_id.trim().toUpperCase(),
    category: category || "General",
    price: Number(price),
    stock: Number(stock || 0),
    image: image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    status: Number(stock) > 0 ? "In Stock" : "Out of Stock"
  };

  db.products.push(newProduct);
  saveDB(db);
  broadcastEvent('PRODUCTS_UPDATED', db.products);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Edit Product
app.put('/api/products/:id', (req, res) => {
  db = loadDB();
  const { id } = req.params;
  const { product_name, rfid_tag_id, category, price, stock, image, status } = req.body;

  const productIndex = db.products.findIndex(p => p.product_id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  // Check unique RFID if changed
  if (rfid_tag_id) {
    const existingRfid = db.products.find(p => p.product_id !== id && p.rfid_tag_id.toUpperCase() === rfid_tag_id.trim().toUpperCase());
    if (existingRfid) {
      return res.status(400).json({ error: `RFID Tag ID '${rfid_tag_id}' is already assigned to '${existingRfid.product_name}'.` });
    }
  }

  const current = db.products[productIndex];
  const updatedProduct = {
    ...current,
    product_name: product_name !== undefined ? product_name.trim() : current.product_name,
    rfid_tag_id: rfid_tag_id !== undefined ? rfid_tag_id.trim().toUpperCase() : current.rfid_tag_id,
    category: category !== undefined ? category : current.category,
    price: price !== undefined ? Number(price) : current.price,
    stock: stock !== undefined ? Number(stock) : current.stock,
    image: image !== undefined ? image : current.image,
    status: status !== undefined ? status : (Number(stock) > 0 ? "In Stock" : "Out of Stock")
  };

  db.products[productIndex] = updatedProduct;

  // Also update product details in cart if present
  db.cart = db.cart.map(item => {
    if (item.product_id === id) {
      return {
        ...item,
        product_name: updatedProduct.product_name,
        price: updatedProduct.price,
        rfid_tag_id: updatedProduct.rfid_tag_id,
        category: updatedProduct.category,
        total_price: updatedProduct.price * item.quantity
      };
    }
    return item;
  });

  saveDB(db);
  broadcastEvent('PRODUCTS_UPDATED', db.products);
  broadcastEvent('CART_UPDATED', { cart: db.cart, totals: calculateCartTotals(db.cart, db.cart_meta.discount_amount) });
  res.json(updatedProduct);
});

// DELETE /api/products/:id - Delete Product
app.delete('/api/products/:id', (req, res) => {
  db = loadDB();
  const { id } = req.params;
  const product = db.products.find(p => p.product_id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  db.products = db.products.filter(p => p.product_id !== id);
  saveDB(db);
  broadcastEvent('PRODUCTS_UPDATED', db.products);
  res.json({ message: "Product deleted successfully." });
});

// POST /api/rfid/scan - CORE RFID SCANNING API FOR ESP32 / HARDWARE & SIMULATOR
app.post('/api/rfid/scan', (req, res) => {
  db = loadDB();
  const { rfid_tag_id, force } = req.body;

  if (!rfid_tag_id) {
    return res.status(400).json({ error: "rfid_tag_id is required." });
  }

  const tagId = rfid_tag_id.trim().toUpperCase();
  const now = Date.now();
  const debounceWindow = (db.settings.debounce_seconds || 3) * 1000;

  // Check Reader Connection Status
  if (!db.reader_status.connected && !force) {
    const logEntry = {
      scan_id: `SCN-${now}`,
      rfid_tag_id: tagId,
      product_id: "N/A",
      product_name: "Reader Disconnected",
      scan_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cart_id: db.cart_meta.cart_id,
      action: "REJECTED",
      status: "Reader Offline"
    };
    db.rfid_logs.unshift(logEntry);
    saveDB(db);
    broadcastEvent('RFID_SCAN_EVENT', { status: 'OFFLINE', log: logEntry });
    return res.status(503).json({ status: 'OFFLINE', error: "RFID Reader is currently toggled OFF / Offline." });
  }

  // Check Debounce Cooldown (if same tag detected continuously within cooldown window)
  if (!force && lastScanTracker[tagId] && (now - lastScanTracker[tagId]) < debounceWindow) {
    const timeRemaining = Math.ceil((debounceWindow - (now - lastScanTracker[tagId])) / 1000);
    const logEntry = {
      scan_id: `SCN-${now}`,
      rfid_tag_id: tagId,
      product_id: "N/A",
      product_name: "Cooldown Ignored",
      scan_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cart_id: db.cart_meta.cart_id,
      action: "IGNORED",
      status: `Duplicate scan ignored (${timeRemaining}s cooldown buffer)`
    };
    db.rfid_logs.unshift(logEntry);
    if (db.rfid_logs.length > 50) db.rfid_logs.pop();
    saveDB(db);

    broadcastEvent('RFID_SCAN_EVENT', { status: 'COOLDOWN', tagId, log: logEntry, message: `Duplicate tag scan ignored (${timeRemaining}s buffer)` });
    return res.json({
      status: 'COOLDOWN',
      message: `Duplicate RFID tag scan ignored. Cooldown active for ${timeRemaining} more seconds.`,
      tag_id: tagId,
      log: logEntry
    });
  }

  // Update scan timestamp
  lastScanTracker[tagId] = now;

  // Search product in database
  const product = db.products.find(p => p.rfid_tag_id.toUpperCase() === tagId);

  if (!product) {
    const logEntry = {
      scan_id: `SCN-${now}`,
      rfid_tag_id: tagId,
      product_id: "UNKNOWN",
      product_name: "Unregistered Product",
      scan_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cart_id: db.cart_meta.cart_id,
      action: "UNREGISTERED",
      status: "Tag Not Found in Database"
    };
    db.rfid_logs.unshift(logEntry);
    if (db.rfid_logs.length > 50) db.rfid_logs.pop();

    db.reader_status.last_scanned_id = tagId;
    db.reader_status.last_detected_product = "Unregistered Tag (" + tagId + ")";
    db.reader_status.last_scan_time = logEntry.scan_time;

    saveDB(db);
    broadcastEvent('RFID_SCAN_EVENT', { status: 'NOT_FOUND', tagId, log: logEntry, reader_status: db.reader_status });
    return res.status(404).json({
      status: 'NOT_FOUND',
      error: `No product registered for RFID Tag ID '${tagId}'. Please add this tag in Product Management.`,
      tag_id: tagId,
      log: logEntry
    });
  }

  // Product found - add to cart or increment quantity
  const existingCartIndex = db.cart.findIndex(item => item.product_id === product.product_id);
  let actionTaken = "";
  let newQuantity = 1;

  if (existingCartIndex !== -1) {
    db.cart[existingCartIndex].quantity += 1;
    db.cart[existingCartIndex].total_price = db.cart[existingCartIndex].quantity * db.cart[existingCartIndex].price;
    newQuantity = db.cart[existingCartIndex].quantity;
    actionTaken = `Qty Increased to ${newQuantity}`;
  } else {
    db.cart.push({
      product_id: product.product_id,
      rfid_tag_id: product.rfid_tag_id,
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      quantity: 1,
      total_price: product.price,
      added_time: new Date().toISOString()
    });
    actionTaken = "Item Added to Cart";
  }

  const logEntry = {
    scan_id: `SCN-${now}`,
    rfid_tag_id: tagId,
    product_id: product.product_id,
    product_name: product.product_name,
    scan_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cart_id: db.cart_meta.cart_id,
    action: actionTaken,
    status: "Success"
  };

  db.rfid_logs.unshift(logEntry);
  if (db.rfid_logs.length > 50) db.rfid_logs.pop();

  db.reader_status.last_scanned_id = tagId;
  db.reader_status.last_detected_product = product.product_name;
  db.reader_status.last_scan_time = logEntry.scan_time;

  saveDB(db);

  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  broadcastEvent('RFID_SCAN_EVENT', {
    status: 'SUCCESS',
    product,
    cart: db.cart,
    totals,
    reader_status: db.reader_status,
    log: logEntry
  });

  return res.json({
    status: 'SUCCESS',
    message: `${product.product_name} scanned successfully (${actionTaken}).`,
    product,
    quantity: newQuantity,
    cart: db.cart,
    totals,
    log: logEntry
  });
});

// POST /api/cart/update-qty - Adjust quantity directly
app.post('/api/cart/update-qty', (req, res) => {
  db = loadDB();
  const { product_id, delta } = req.body; // delta: +1 or -1

  const itemIndex = db.cart.findIndex(i => i.product_id === product_id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not in cart." });
  }

  const item = db.cart[itemIndex];
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    db.cart.splice(itemIndex, 1);
  } else {
    item.quantity = newQty;
    item.total_price = item.quantity * item.price;
  }

  saveDB(db);
  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  broadcastEvent('CART_UPDATED', { cart: db.cart, totals });
  res.json({ cart: db.cart, totals });
});

// POST /api/cart/remove - Remove entire product from cart
app.post('/api/cart/remove', (req, res) => {
  db = loadDB();
  const { product_id } = req.body;

  db.cart = db.cart.filter(item => item.product_id !== product_id);
  saveDB(db);

  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  broadcastEvent('CART_UPDATED', { cart: db.cart, totals });
  res.json({ cart: db.cart, totals });
});

// POST /api/cart/clear - Remove all items from cart
app.post('/api/cart/clear', (req, res) => {
  db = loadDB();
  db.cart = [];
  saveDB(db);

  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  broadcastEvent('CART_UPDATED', { cart: db.cart, totals });
  res.json({ cart: db.cart, totals });
});

// POST /api/cart/coupon - Apply discount coupon
app.post('/api/cart/coupon', (req, res) => {
  db = loadDB();
  const { coupon_code } = req.body;
  const code = (coupon_code || '').trim().toUpperCase();

  let discount = 0;
  if (code === 'PASI100') discount = 100;
  else if (code === 'SAVE200') discount = 200;
  else if (code === 'PASI500') discount = 500;
  else if (code === 'SUPER10') {
    const sub = db.cart.reduce((acc, i) => acc + i.total_price, 0);
    discount = Math.round(sub * 0.10);
  } else if (code !== '') {
    return res.status(400).json({ error: "Invalid coupon code. Try 'PASI100', 'SAVE200', or 'SUPER10'." });
  }

  db.cart_meta.discount_amount = discount;
  db.cart_meta.applied_coupon = code;
  saveDB(db);

  const totals = calculateCartTotals(db.cart, discount);
  broadcastEvent('CART_UPDATED', { cart: db.cart, totals });
  res.json({ applied_coupon: code, discount_amount: discount, totals });
});

// POST /api/rfid/status - Toggle reader connection status
app.post('/api/rfid/status', (req, res) => {
  db = loadDB();
  const { connected } = req.body;
  db.reader_status.connected = Boolean(connected);
  saveDB(db);

  broadcastEvent('READER_STATUS_CHANGED', db.reader_status);
  res.json(db.reader_status);
});

// POST /api/settings - Update settings (debounce, etc.)
app.post('/api/settings', (req, res) => {
  db = loadDB();
  const { debounce_seconds } = req.body;
  if (debounce_seconds !== undefined) {
    db.settings.debounce_seconds = Math.max(0, Number(debounce_seconds));
  }
  saveDB(db);
  res.json(db.settings);
});

// POST /api/checkout - Complete Checkout and generate Bill
app.post('/api/checkout', (req, res) => {
  db = loadDB();
  const { customer_name, payment_method } = req.body;

  if (db.cart.length === 0) {
    return res.status(400).json({ error: "Cannot checkout with an empty cart." });
  }

  const totals = calculateCartTotals(db.cart, db.cart_meta.discount_amount);
  const nextNum = db.transactions.length + 124;
  const billNumber = `PS-${String(nextNum).padStart(6, '0')}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const transaction = {
    transaction_id: `TXN-${Date.now()}`,
    bill_number: billNumber,
    cart_id: db.cart_meta.cart_id,
    date: nowStr,
    customer_name: customer_name || "Valued Customer",
    payment_method: payment_method || "Cash",
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    items: db.cart.map(item => ({
      product_name: item.product_name,
      rfid_tag_id: item.rfid_tag_id,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.total_price
    }))
  };

  // Deduct Stock
  db.products = db.products.map(p => {
    const cartItem = db.cart.find(c => c.product_id === p.product_id);
    if (cartItem) {
      const newStock = Math.max(0, p.stock - cartItem.quantity);
      return {
        ...p,
        stock: newStock,
        status: newStock > 0 ? "In Stock" : "Out of Stock"
      };
    }
    return p;
  });

  db.transactions.unshift(transaction);
  db.cart = []; // Clear cart
  db.cart_meta.discount_amount = 0;
  db.cart_meta.applied_coupon = "";
  // Generate new Cart ID for next customer
  db.cart_meta.cart_id = `CART-${Math.floor(1000 + Math.random() * 9000)}`;

  saveDB(db);

  broadcastEvent('CHECKOUT_COMPLETED', { transaction, cart: db.cart, products: db.products });
  res.json({ message: "Checkout successful!", transaction });
});

// GET /api/history - Get past transactions
app.get('/api/history', (req, res) => {
  db = loadDB();
  res.json(db.transactions);
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pasi Supermarket Backend Server running on port ${PORT}`);
});
