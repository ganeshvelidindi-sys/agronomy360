// ─────────────────────────────────────────────────────────────
// AGRONOMY 360 — Real localStorage Database
// All data is stored in localStorage so it persists across pages
// In production this would be replaced with a real API/database
// ─────────────────────────────────────────────────────────────

export interface DBUser {
  id: string;
  name: string;
  role: 'farmer' | 'buyer';
  phone: string;
  email?: string;            // optional — for email OTP users
  password: string;          // plain for demo; hash in production
  location: string;
  state: string;
  district: string;
  landSize?: string;
  soilType?: string;
  verified: boolean;
  createdAt: string;
}

export interface DBCrop {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerRating: number;
  farmerVerified: boolean;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  qualityGrade: string;
  harvestDate: string;
  description: string;
  organic: boolean;
  state: string;
  location: string;
  imageUrl: string | null;   // base64 data URL from file input
  active: boolean;
  createdAt: string;
}

export interface DBOrder {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  paymentMethod: string;
  txnId: string;
  escrowStatus: 'held' | 'released' | 'refunded';
  deliveryStatus: 'confirmed' | 'dispatched' | 'delivered';
  createdAt: string;
}

// ─── Keys ───────────────────────────────────────────────────
const KEYS = {
  USERS: 'agr360_users',
  CROPS: 'agr360_crops',
  ORDERS: 'agr360_orders',
};

// ─── Generic helpers ─────────────────────────────────────────
function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function saveAll<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── USERS ───────────────────────────────────────────────────
export const UserDB = {
  getAll: () => getAll<DBUser>(KEYS.USERS),

  findByPhone: (phone: string): DBUser | null => {
    return getAll<DBUser>(KEYS.USERS).find(u => u.phone === phone) || null;
  },

  findByEmail: (email: string): DBUser | null => {
    const e = email.trim().toLowerCase();
    return getAll<DBUser>(KEYS.USERS).find(u => u.email?.toLowerCase() === e) || null;
  },

  register: (data: Omit<DBUser, 'id' | 'createdAt' | 'verified'>): DBUser => {
    const users = getAll<DBUser>(KEYS.USERS);
    // Duplicate check — by phone if provided, by email if provided
    if (data.phone) {
      const existsByPhone = users.find(u => u.phone && u.phone === data.phone);
      if (existsByPhone) throw new Error('Phone already registered');
    }
    if (data.email) {
      const existsByEmail = users.find(u => u.email?.toLowerCase() === data.email?.toLowerCase());
      if (existsByEmail) throw new Error('Email already registered');
    }
    const user: DBUser = {
      ...data,
      id: 'u_' + genId(),
      verified: false,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveAll(KEYS.USERS, users);
    return user;
  },

  login: (phone: string, password: string): DBUser | null => {
    const user = getAll<DBUser>(KEYS.USERS).find(u => u.phone === phone);
    if (!user || user.password !== password) return null;
    return user;
  },

  loginByEmail: (email: string, password: string): DBUser | null => {
    const e = email.trim().toLowerCase();
    const user = getAll<DBUser>(KEYS.USERS).find(u => u.email?.toLowerCase() === e);
    if (!user || user.password !== password) return null;
    return user;
  },

  markVerified: (phone: string): void => {
    const users = getAll<DBUser>(KEYS.USERS);
    const idx = users.findIndex(u => u.phone === phone);
    if (idx !== -1) {
      users[idx].verified = true;
      saveAll(KEYS.USERS, users);
    }
  },

  markVerifiedByEmail: (email: string): void => {
    const e = email.trim().toLowerCase();
    const users = getAll<DBUser>(KEYS.USERS);
    const idx = users.findIndex(u => u.email?.toLowerCase() === e);
    if (idx !== -1) {
      users[idx].verified = true;
      saveAll(KEYS.USERS, users);
    }
  },
};


// ─── CROPS ───────────────────────────────────────────────────
export const CropDB = {
  getAll: (): DBCrop[] => getAll<DBCrop>(KEYS.CROPS).filter(c => c.active),

  getByFarmer: (farmerId: string): DBCrop[] =>
    getAll<DBCrop>(KEYS.CROPS).filter(c => c.farmerId === farmerId),

  getById: (id: string): DBCrop | null =>
    getAll<DBCrop>(KEYS.CROPS).find(c => c.id === id) || null,

  add: (data: Omit<DBCrop, 'id' | 'createdAt' | 'active'>): DBCrop => {
    const crops = getAll<DBCrop>(KEYS.CROPS);
    const crop: DBCrop = {
      ...data,
      id: 'crop_' + genId(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    crops.push(crop);
    saveAll(KEYS.CROPS, crops);
    return crop;
  },

  delete: (id: string, farmerId: string): void => {
    const crops = getAll<DBCrop>(KEYS.CROPS);
    const idx = crops.findIndex(c => c.id === id && c.farmerId === farmerId);
    if (idx !== -1) {
      crops[idx].active = false;
      saveAll(KEYS.CROPS, crops);
    }
  },

  search: (query: string, filters: { category?: string; state?: string; organic?: boolean } = {}): DBCrop[] => {
    let crops = getAll<DBCrop>(KEYS.CROPS).filter(c => c.active);
    if (query) {
      const q = query.toLowerCase();
      crops = crops.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.farmerName.toLowerCase().includes(q)
      );
    }
    if (filters.category && filters.category !== 'All') {
      crops = crops.filter(c => c.category === filters.category);
    }
    if (filters.state && filters.state !== 'All States') {
      crops = crops.filter(c => c.state === filters.state);
    }
    if (filters.organic) {
      crops = crops.filter(c => c.organic);
    }
    return crops.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

// ─── ORDERS ──────────────────────────────────────────────────
export const OrderDB = {
  getAll: () => getAll<DBOrder>(KEYS.ORDERS),

  getByBuyer: (buyerId: string): DBOrder[] =>
    getAll<DBOrder>(KEYS.ORDERS).filter(o => o.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  getByFarmer: (farmerId: string): DBOrder[] =>
    getAll<DBOrder>(KEYS.ORDERS).filter(o => o.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  create: (data: Omit<DBOrder, 'id' | 'createdAt' | 'txnId' | 'escrowStatus' | 'deliveryStatus'>): DBOrder => {
    const orders = getAll<DBOrder>(KEYS.ORDERS);
    const order: DBOrder = {
      ...data,
      id: 'ord_' + genId(),
      txnId: 'AGR360-' + Math.floor(100000000 + Math.random() * 900000000),
      escrowStatus: 'held',
      deliveryStatus: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    saveAll(KEYS.ORDERS, orders);
    return order;
  },

  confirmDelivery: (orderId: string): void => {
    const orders = getAll<DBOrder>(KEYS.ORDERS);
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].deliveryStatus = 'delivered';
      orders[idx].escrowStatus = 'released';
      saveAll(KEYS.ORDERS, orders);
    }
  },
};
