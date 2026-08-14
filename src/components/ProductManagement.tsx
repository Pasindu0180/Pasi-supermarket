import React, { useState } from 'react';
import { Product } from '../types';
import { Package, Plus, Search, Edit3, Trash2, Tag, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  onCreateProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const PRESET_IMAGES = [
  { name: 'Rice / Grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Milk / Dairy', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { name: 'Biscuits / Snacks', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80' },
  { name: 'Sugar / Salt', url: 'https://images.unsplash.com/photo-1622484210800-885160867086?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tea / Coffee', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cooking Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Chocolate / Sweets', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pulses / Dhal', url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80' },
];

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    product_name: string;
    rfid_tag_id: string;
    category: string;
    price: string;
    stock: string;
    image: string;
  }>({
    product_name: '',
    rfid_tag_id: '',
    category: 'Grains & Staples',
    price: '',
    stock: '25',
    image: PRESET_IMAGES[0].url,
  });

  const categories = ['All', 'Grains & Staples', 'Dairy & Beverage', 'Snacks & Biscuits', 'Cooking Essentials', 'Produce', 'General'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rfid_tag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setErrorMessage(null);
    setFormData({
      product_name: '',
      rfid_tag_id: `RFID0${products.length + 1}`,
      category: 'Grains & Staples',
      price: '',
      stock: '30',
      image: PRESET_IMAGES[0].url,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setErrorMessage(null);
    setEditingProduct(prod);
    setFormData({
      product_name: prod.product_name,
      rfid_tag_id: prod.rfid_tag_id,
      category: prod.category,
      price: String(prod.price),
      stock: String(prod.stock),
      image: prod.image,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.product_name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!formData.rfid_tag_id.trim()) {
      setErrorMessage("RFID Tag ID is required.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage("Please enter a valid positive price.");
      return;
    }

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.product_id, {
          product_name: formData.product_name,
          rfid_tag_id: formData.rfid_tag_id,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image,
        });
        setEditingProduct(null);
      } else {
        await onCreateProduct({
          product_name: formData.product_name,
          rfid_tag_id: formData.rfid_tag_id,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image,
        });
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProductId) {
      await onDeleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" /> Supermarket Product Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage inventory items, pricing, stock levels, and unique RFID tag assignments
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, RFID tag, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => (
          <div key={prod.product_id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all flex flex-col group shadow-lg">
            
            {/* Image & Status Badge */}
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              <img
                src={prod.image}
                alt={prod.product_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              
              {/* RFID Tag Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{prod.rfid_tag_id}</span>
              </div>

              {/* Status Badge */}
              <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                prod.status === 'In Stock'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {prod.status}
              </div>

              <div className="absolute bottom-2 left-3 right-3 text-xs text-slate-300 font-medium truncate">
                {prod.category}
              </div>
            </div>

            {/* Body Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-white text-base leading-snug line-clamp-2">{prod.product_name}</h4>
                <div className="text-xs text-slate-400 mt-0.5">ID: <span className="font-mono text-slate-300">{prod.product_id}</span></div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Unit Price</div>
                  <div className="text-lg font-black text-emerald-400">Rs. {prod.price.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">In Stock</div>
                  <div className="text-sm font-bold text-white">{prod.stock} units</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleOpenEditModal(prod)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingProductId(prod.product_id)}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>{editingProduct ? 'Edit Product Details' : 'Add New Supermarket Item'}</span>
            </h3>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g. Keeri Samba Rice 5kg"
                  className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">RFID Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.rfid_tag_id}
                    onChange={(e) => setFormData({ ...formData, rfid_tag_id: e.target.value })}
                    placeholder="e.g. RFID001"
                    className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-emerald-400 font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Must be unique</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Price (LKR / Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1250"
                    className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Product Image URL & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Product Image</span>
                </label>
                
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />

                {/* Preset image thumbnails */}
                <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-none">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-colors focus:ring-2 focus:ring-emerald-500"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Product Deletion</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this product from the database? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
