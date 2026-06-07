export type UserRole = 'admin' | 'seller' | 'client' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  isBlocked: boolean;
  createdAt: string;
}

export type ProductCondition = 'Novo com etiqueta' | 'Novo sem etiqueta' | 'Gentilmente usado' | 'Usado com marcas de uso';
export type ProductCategory = 'Masculino' | 'Feminino' | 'Infantil' | 'Calçados' | 'Acessórios' | 'Outros';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  condition: ProductCondition;
  images: string[];
  sellerId: string;
  sellerName: string;
  isApproved: boolean;
  isSold: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pendente' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  sellerId: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'pix' | 'bank';
  provider: string; // e.g., "Visa", "MasterCard", "Pix CPF"
  number: string; // e.g., "•••• •••• •••• 5432", "123.456.789-00"
  holderName: string; // e.g., "Geminiana Alves"
  expiry?: string; // e.g., "12/29"
  isDefault: boolean;
}
