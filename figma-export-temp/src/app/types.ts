export interface Category {
  idCategory: number;
  categoryName: string;
}

export interface Product {
  idProduct: number;
  category: Category;
  productName: string;
  productDescription: string;
  price: number;
  stock: number;
  imageProduct: string;
}

export interface CartProductItem {
  idCartProduct: number;
  cart?: { idCart: number };
  product: Product;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  idCart: number;
  user?: User;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  idOrder: number;
  user?: User;
  status: OrderStatus;
  total: number;
  discount?: Discount | null;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Discount {
  idDiscount: number;
  code: string;
  percentage: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

export interface User {
  idUser: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  idUser?: number;
}

export interface LocalCartItem {
  product: Product;
  quantity: number;
}
