import { Product, User, Review } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Mariana Vendas',
    email: 'mari@vendedor.com',
    phone: '(11) 98765-4321',
    role: 'seller',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=70',
    isBlocked: false,
    createdAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'u2',
    name: 'Felipe Cliente',
    email: 'felipe@cliente.com',
    phone: '(21) 99888-7766',
    role: 'client',
    isBlocked: false,
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=70',
    createdAt: '2026-05-12T14:30:00Z'
  },
  {
    id: 'u3',
    name: 'Admin Geral',
    email: 'admin@brecho.com',
    phone: '(11) 90000-1234',
    role: 'admin',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=70',
    isBlocked: false,
    createdAt: '2026-05-01T09:00:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Jaqueta de Couro Vintage',
    category: 'Feminino',
    description: 'Jaqueta de couro legítimo vintage dos anos 90. Excelente caimento, super conservada, forro intacto e zíperes funcionando perfeitamente.',
    price: 349.90,
    condition: 'Gentilmente usado',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1521223869279-3718995498a7?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-01T15:20:00Z'
  },
  {
    id: 'p2',
    name: 'Tênis Running Air Pro',
    category: 'Calçados',
    description: 'Tênis esportivo vermelho de alto desempenho. Nunca usado, na caixa original com etiquetas. Tamanho 41.',
    price: 189.00,
    condition: 'Novo com etiqueta',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-02T10:15:00Z'
  },
  {
    id: 'p3',
    name: 'Vestido Midi Floral',
    category: 'Feminino',
    description: 'Vestido midi estampa floral com botões frontais. Perfeito para o verão. Tecido leve de viscose. Usado poucas vezes, sem marcas.',
    price: 79.90,
    condition: 'Gentilmente usado',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-03T18:45:00Z'
  },
  {
    id: 'p4',
    name: 'Óculos de Sol Aviador Clássico',
    category: 'Acessórios',
    description: 'Óculos de sol modelo aviador com lentes douradas polarizadas. Acompanha estojo e flanela de limpeza originais. Marcas leves na haste esquerda.',
    price: 120.00,
    condition: 'Usado com marcas de uso',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-04T11:30:00Z'
  },
  {
    id: 'p5',
    name: 'Sobretudo de Lã Elegante',
    category: 'Masculino',
    description: 'Sobretudo masculino marrom de lã pura. Super quente e elegante. Ideal para viagens ou invernos rigorosos. Usado apenas duas vezes.',
    price: 420.00,
    condition: 'Gentilmente usado',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-05T09:15:00Z'
  },
  {
    id: 'p6',
    name: 'Bolsa de Couro Estruturada',
    category: 'Acessórios',
    description: 'Bolsa feminina estruturada em couro legítimo caramelo. Divisórias internas, alça transversal regulável. Sem marcas ou arranhões.',
    price: 199.90,
    condition: 'Novo sem etiqueta',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: true,
    isSold: false,
    createdAt: '2026-06-05T14:40:00Z'
  },
  {
    id: 'p7',
    name: 'Jaqueta Jeans Infantil',
    category: 'Infantil',
    description: 'Jaqueta jeans infantil unissex muito estilosa. Tecido macio com elastano para maior conforto da criança. Para idade de 4 a 6 anos.',
    price: 49.90,
    condition: 'Gentilmente usado',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60'
    ],
    sellerId: 'u1',
    sellerName: 'Mariana Vendas',
    isApproved: false,
    isSold: false,
    createdAt: '2026-06-06T16:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    evaluatorId: 'u2',
    evaluatorName: 'Felipe Cliente',
    sellerId: 'u1',
    productId: 'p1',
    productName: 'Jaqueta de Couro Vintage',
    rating: 5,
    comment: 'Vendedora super atenciosa! O produto chegou impecável, bem embalado e idêntico às fotos. Recomendo muito!',
    createdAt: '2026-05-20T16:30:00Z'
  },
  {
    id: 'r2',
    evaluatorId: 'u2',
    evaluatorName: 'Felipe Cliente',
    sellerId: 'u1',
    productId: 'p4',
    productName: 'Óculos de Sol Aviador Clássico',
    rating: 4,
    comment: 'Entrega ágil e produto em excelente conservação, exatamente como anunciado. Adorei o garimpo!',
    createdAt: '2026-05-25T11:00:00Z'
  }
];
