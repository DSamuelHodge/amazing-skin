import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Search, 
  Plus, 
  Check, 
  RefreshCw, 
  Tag, 
  History,
  ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  price: number;
}

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Cloud Melt Cleansing Gel (120ml)', sku: 'CMC-120', stock: 142, reserved: 8, lowStockThreshold: 20, price: 29.00 },
  { id: '2', name: 'Lumina Barrier Serum (30ml)', sku: 'LBS-30', stock: 12, reserved: 4, lowStockThreshold: 15, price: 42.00 },
  { id: '3', name: 'Velvet Lock Moisture Cream (50ml)', sku: 'VLM-50', stock: 89, reserved: 6, lowStockThreshold: 15, price: 38.00 },
  { id: '4', name: 'Refill Pod: Barrier Serum (30ml)', sku: 'RFP-30', stock: 6, reserved: 2, lowStockThreshold: 10, price: 34.00 },
  { id: '5', name: 'Botanical Cleansing Bar (90g)', sku: 'BCB-90', stock: 210, reserved: 12, lowStockThreshold: 25, price: 18.00 },
];

const mockOrders = [
  { id: 'ORD-88219', customer: 'Clara Vance', total: '$109.00', status: 'Processing', date: 'Just now', items: 3 },
  { id: 'ORD-88218', customer: 'Liam Sterling', total: '$42.00', status: 'Shipped', date: '25m ago', items: 1 },
  { id: 'ORD-88217', customer: 'Sophia Bennett', total: '$89.00', status: 'Delivered', date: '2h ago', items: 2 },
  { id: 'ORD-88216', customer: 'Marcus Hayes', total: '$147.00', status: 'Delivered', date: '5h ago', items: 4 },
];

const mockAuditLogs = [
  { id: 'log_1', user: 'eleanor.ross@luminaskin.com', role: 'admin', action: 'SEC-AUTH-SUCCESS (2FA Hardware Verified)', time: '12:38:10' },
  { id: 'log_2', user: 'eleanor.ross@luminaskin.com', role: 'admin', action: 'INV-RESTOCK (CMC-120 +50 units)', time: '11:15:02' },
  { id: 'log_3', user: 'system.daemon', role: 'system', action: 'GUEST-CART-MERGE (usr_cust_8821)', time: '10:44:22' },
  { id: 'log_4', user: 'stripe.webhook', role: 'system', action: 'PAYMENT_INTENT_CAPTURED (ORD-88219)', time: '09:20:11' },
];

export function AdminDashboardModal() {
  const { isAdminDashboardOpen, closeAdminDashboard, user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'audit'>('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAdminDashboardOpen || !user) return null;

  const handleRestock = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = item.stock + 25;
        toast.success(`Restocked ${item.name}`, {
          description: `Stock level updated to ${newStock} units. Audit event registered.`
        });
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAdminDashboard}
        className="fixed inset-0 bg-forest-bg/85 backdrop-blur-md"
      />

      {/* Main Admin Console Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl bg-canvas-bg text-stone-900 rounded-3xl shadow-2xl border border-stone-300/80 overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Top Operations Header */}
        <div className="bg-forest-surface text-emerald-50 px-6 py-5 border-b border-emerald-900/50 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-medium text-white">Lumina Operations Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono uppercase bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Logged in as <span className="text-white font-medium">{user.firstName} {user.lastName}</span> ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeAdminDashboard();
                toast.info('Returned to customer storefront');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-medium transition-colors"
            >
              View Storefront
            </button>
            <button
              onClick={closeAdminDashboard}
              className="p-2 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Bar */}
        <div className="bg-white border-b border-stone-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
            { id: 'inventory', label: 'Live Inventory & Stock', icon: Package },
            { id: 'orders', label: 'Recent Orders', icon: Users },
            { id: 'audit', label: 'Security & Audit Logs', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start text-stone-500 mb-2">
                    <span className="text-xs font-medium tracking-wide uppercase">Today's Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-serif font-semibold text-stone-900">$4,820.00</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +18.4% from yesterday
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start text-stone-500 mb-2">
                    <span className="text-xs font-medium tracking-wide uppercase">Active Orders</span>
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-serif font-semibold text-stone-900">38</div>
                  <div className="text-xs text-stone-500 mt-1">6 pending fulfillment</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start text-stone-500 mb-2">
                    <span className="text-xs font-medium tracking-wide uppercase">Low Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-serif font-semibold text-amber-600">2 SKUs</div>
                  <div className="text-xs text-amber-700 font-medium mt-1">Barrier Serum Refills</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex justify-between items-start text-stone-500 mb-2">
                    <span className="text-xs font-medium tracking-wide uppercase">Member Rewards</span>
                    <Tag className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-serif font-semibold text-stone-900">1,420 pts</div>
                  <div className="text-xs text-stone-500 mt-1">Redeemed this week</div>
                </div>
              </div>

              {/* Quick Actions & High Priority Notice */}
              <div className="bg-brand-primary text-emerald-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-medium text-white">Automated Evening Ritual Restock Scheduled</h3>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Suppliers in Grasse, France have dispatched 400 glass bottles of Cloud Melt Cleanser. Arrival expected Thursday.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  Manage Warehouse Stock
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search SKU or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                  />
                </div>
                <div className="text-xs text-stone-500">
                  Showing {filteredInventory.length} inventory units
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Product Variant</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Reserved</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredInventory.map((item) => {
                      const isLow = item.stock <= item.lowStockThreshold;
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-stone-900">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-stone-500">{item.sku}</td>
                          <td className="py-3.5 px-4 font-medium text-stone-900">${item.price.toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">{item.stock}</td>
                          <td className="py-3.5 px-4 text-stone-500">{item.reserved}</td>
                          <td className="py-3.5 px-4">
                            {isLow ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Low Stock ({item.stock})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Healthy ({item.stock})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRestock(item.id)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg text-xs font-medium transition-colors border border-stone-200 hover:border-emerald-300 flex items-center gap-1 ml-auto"
                            >
                              <Plus className="w-3 h-3" /> +25 Units
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-200 flex justify-between items-center">
                <h3 className="font-serif text-base font-medium text-stone-900">Live Customer Orders</h3>
                <span className="text-xs text-stone-500">Stripe Webhooks Synchronized</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {mockOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-900">{ord.id}</td>
                        <td className="py-3.5 px-4 font-medium text-stone-900">{ord.customer}</td>
                        <td className="py-3.5 px-4 text-stone-500">{ord.items} items</td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">{ord.total}</td>
                        <td className="py-3.5 px-4 text-stone-500">{ord.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'Processing' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : ord.status === 'Shipped'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-base font-medium text-stone-900">Immutable Security & Audit Ledger</h3>
                  <p className="text-xs text-stone-500">Every privileged mutation is verified with HMAC signatures.</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ISO-27001 Active
                </span>
              </div>

              <div className="space-y-2">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400">{log.time}</span>
                      <span className="font-bold text-emerald-900">{log.user}</span>
                      <span className="text-stone-700">{log.action}</span>
                    </div>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                      {log.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
