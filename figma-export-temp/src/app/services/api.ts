import type { Product, Category, Cart, CartProductItem, Order, OrderItem, Discount, AuthResponse } from '../types';

const BASE_URL = 'http://localhost:8080';

const getToken = () => localStorage.getItem('boho_token');

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function apiFetch<T>(path: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error('No se pudo conectar con el servidor');
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { idCategory: 1, categoryName: 'Vestidos' },
  { idCategory: 2, categoryName: 'Blusas & Tops' },
  { idCategory: 3, categoryName: 'Faldas & Pantalones' },
  { idCategory: 4, categoryName: 'Accesorios' },
  { idCategory: 5, categoryName: 'Abrigos & Chalecos' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    idProduct: 1,
    category: MOCK_CATEGORIES[0],
    productName: 'Vestido Flores del Campo',
    productDescription: 'Delicado vestido floral con escote envolvente y cintura ajustable. Confeccionado en tela ligera de algodón con estampado botánico en tonos tierra y rosa. Perfecto para festivales y días de verano.',
    price: 89.99,
    stock: 15,
    imageProduct: 'https://images.unsplash.com/photo-1759992878336-a5dd342ea245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 2,
    category: MOCK_CATEGORIES[0],
    productName: 'Vestido Crochet Lunar',
    productDescription: 'Vestido maxi de crochet artesanal con detalles de encaje. Tejido a mano con hilos naturales, combina a la perfección con sandalias de cuero o botas camperas.',
    price: 115.00,
    stock: 8,
    imageProduct: 'https://images.unsplash.com/photo-1624633100912-2fc4f1002778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 3,
    category: MOCK_CATEGORIES[0],
    productName: 'Vestido Midi Terracota',
    productDescription: 'Vestido midi en tono terracota con mangas campana y escote en V. El color cálido realza cualquier tono de piel y la caída fluida lo hace ideal para cualquier ocasión.',
    price: 95.00,
    stock: 12,
    imageProduct: 'https://images.unsplash.com/photo-1654943389011-2bb787c204ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 4,
    category: MOCK_CATEGORIES[0],
    productName: 'Vestido Étnico Multicolor',
    productDescription: 'Vestido largo con bordados étnicos multicolores en el escote y dobladillo. Cada pieza es única, con detalles artesanales realizados por comunidades locales.',
    price: 110.00,
    stock: 6,
    imageProduct: 'https://images.unsplash.com/photo-1655731407582-1222311cb11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 5,
    category: MOCK_CATEGORIES[0],
    productName: 'Vestido Floral Jardín',
    productDescription: 'Vestido de algodón estampado con flores silvestres. Tiene escote cuadrado, mangas globo y falda con vuelo. Ideal para picnics, bodas al aire libre o paseos por la ciudad.',
    price: 78.00,
    stock: 20,
    imageProduct: 'https://images.unsplash.com/photo-1624633700872-63940c70c11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 6,
    category: MOCK_CATEGORIES[1],
    productName: 'Blusa Bordada Artesanal',
    productDescription: 'Blusa de algodón blanco con bordados artesanales en el cuello y mangas. Inspirada en las tradiciones textiles latinoamericanas. Cómoda, fresca y única.',
    price: 48.00,
    stock: 22,
    imageProduct: 'https://images.unsplash.com/photo-1585439623131-6a91ce98e4c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 7,
    category: MOCK_CATEGORIES[1],
    productName: 'Top Macramé Boho',
    productDescription: 'Top de macramé tejido a mano con cierre trasero de cordones. Perfecto para la playa o para combinarlo con una falda larga y crear un look boho completo.',
    price: 42.00,
    stock: 14,
    imageProduct: 'https://images.unsplash.com/photo-1582599926390-b4350d5dcd6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 8,
    category: MOCK_CATEGORIES[2],
    productName: 'Falda Maxi Bohemia',
    productDescription: 'Falda maxi fluida en tela de rayón con estampado geométrico azteca. Cintura elástica ajustable y dobladillo asimétrico que aporta movimiento y gracia.',
    price: 65.00,
    stock: 18,
    imageProduct: 'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 9,
    category: MOCK_CATEGORIES[2],
    productName: 'Pantalón Palazzo Lino',
    productDescription: 'Pantalón palazzo de lino natural en color arena. De corte amplio y cómodo, con cintura alta y bolsillos laterales. Sostenible, transpirable y elegante.',
    price: 72.00,
    stock: 10,
    imageProduct: 'https://images.unsplash.com/photo-1549412522-c8a0a5211846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 10,
    category: MOCK_CATEGORIES[3],
    productName: 'Set Pulseras Artesanales',
    productDescription: 'Set de 5 pulseras artesanales con piedras semipreciosas, cuentas de madera y macramé. Cada pieza es única y viene envuelta en papel reciclado con mensaje de energía positiva.',
    price: 32.00,
    stock: 35,
    imageProduct: 'https://images.unsplash.com/photo-1766560360636-69204af3c947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 11,
    category: MOCK_CATEGORIES[3],
    productName: 'Collar Piedras Naturales',
    productDescription: 'Collar largo con piedras naturales de turquesa, ámbar y cuarzo rosa enhebradas en hilo encerado. Artesanía tradicional de los Andes. Cada collar es irrepetible.',
    price: 45.00,
    stock: 28,
    imageProduct: 'https://images.unsplash.com/photo-1710552516885-92638d42a686?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 12,
    category: MOCK_CATEGORIES[4],
    productName: 'Kimono Floral de Seda',
    productDescription: 'Kimono largo en tela satinada con estampado floral en tonos burdeos, verdes y dorados. Versátil: úsalo como vestido, kimono o capa. Cierre con cinturón a juego.',
    price: 98.00,
    stock: 9,
    imageProduct: 'https://images.unsplash.com/photo-1773335954232-957e8945827e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
];

export const MOCK_DISCOUNTS: Discount[] = [
  { idDiscount: 1, code: 'BOHO10', percentage: 10, validFrom: '2024-01-01', validTo: '2027-12-31', active: true },
  { idDiscount: 2, code: 'ALMA20', percentage: 20, validFrom: '2024-01-01', validTo: '2027-12-31', active: true },
  { idDiscount: 3, code: 'VERANO15', percentage: 15, validFrom: '2024-01-01', validTo: '2027-12-31', active: true },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json();
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role: 'ROLE_USER' }),
  });
  if (!res.ok) throw new Error('Error al registrarse');
  return res.json();
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = () =>
  apiFetch<Product[]>('/products', undefined, MOCK_PRODUCTS);

export const getProduct = (id: number) =>
  apiFetch<Product>(`/products/${id}`, undefined, MOCK_PRODUCTS.find(p => p.idProduct === id)!);

export const getProductsByCategory = (categoryId: number) =>
  apiFetch<Product[]>(`/products/category/${categoryId}`, undefined,
    MOCK_PRODUCTS.filter(p => p.category.idCategory === categoryId));

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = () =>
  apiFetch<Category[]>('/categories', undefined, MOCK_CATEGORIES);

export const getCategory = (id: number) =>
  apiFetch<Category>(`/categories/${id}`, undefined, MOCK_CATEGORIES.find(c => c.idCategory === id)!);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getUserCart = (userId: number) =>
  apiFetch<Cart>(`/cart/user/${userId}`, undefined, { idCart: 1 });

export const createCart = (userId: number) =>
  apiFetch<Cart>('/cart', { method: 'POST', body: JSON.stringify({ user: { idUser: userId } }) }, { idCart: 1 });

export const getCartItems = (cartId: number) =>
  apiFetch<CartProductItem[]>(`/cart-products/cart/${cartId}`, undefined, []);

export const addCartItem = (cartId: number, productId: number, quantity: number, unitPrice: number) =>
  apiFetch<CartProductItem>('/cart-products', {
    method: 'POST',
    body: JSON.stringify({ cart: { idCart: cartId }, product: { idProduct: productId }, quantity, unitPrice }),
  });

export const updateCartItem = (id: number, quantity: number) =>
  apiFetch<CartProductItem>(`/cart-products/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const deleteCartItem = (id: number) =>
  apiFetch<void>(`/cart-products/${id}`, { method: 'DELETE' });

// ─── Orders ───────────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  { idOrder: 1, status: 'DELIVERED', total: 178.99, discount: null },
  { idOrder: 2, status: 'PROCESSING', total: 95.00, discount: null },
];

export const getUserOrders = (userId: number) =>
  apiFetch<Order[]>(`/orders/user/${userId}`, undefined, MOCK_ORDERS);

export const getOrder = (id: number) =>
  apiFetch<Order>(`/orders/${id}`, undefined, MOCK_ORDERS[0]);

export const getOrderItems = (id: number): Promise<OrderItem[]> =>
  apiFetch<OrderItem[]>(`/orders/${id}/items`, undefined, [
    { product: MOCK_PRODUCTS[0], quantity: 1, unitPrice: MOCK_PRODUCTS[0].price },
    { product: MOCK_PRODUCTS[9], quantity: 2, unitPrice: MOCK_PRODUCTS[9].price },
  ]);

export const createOrder = (userId: number, total: number, discountId?: number) =>
  apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      user: { idUser: userId },
      status: 'PENDING',
      total,
      ...(discountId ? { discount: { idDiscount: discountId } } : {}),
    }),
  });

// ─── Discounts ────────────────────────────────────────────────────────────────

export const getDiscountByCode = (code: string) =>
  apiFetch<Discount>(`/discounts/code/${code}`, undefined,
    MOCK_DISCOUNTS.find(d => d.code.toLowerCase() === code.toLowerCase())!);
