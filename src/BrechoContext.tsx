import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, CartItem, Order, Review, Notification, Favorite, ProductCategory, ProductCondition, PaymentMethod } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_REVIEWS } from './initialData';

interface BrechoContextType {
  users: User[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  notifications: Notification[];
  favorites: Favorite[];
  cart: CartItem[];
  currentUser: User | null;
  paymentMethods: PaymentMethod[];
  alertPopup: {
    isOpen: boolean;
    message: string;
    title: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  showAlert: (message: string, type?: 'info' | 'success' | 'warning' | 'error', title?: string) => void;
  closeAlert: () => void;
  registerUser: (name: string, email: string, phone: string, password: string) => { success: boolean; message: string };
  loginUser: (email: string, password: string) => { success: boolean; message: string };
  logoutUser: () => void;
  recoverPassword: (email: string) => { success: boolean; message: string };
  updateProfile: (name: string, phone: string, profilePicture?: string) => { success: boolean; message: string };
  updateCredentials: (email: string, currentPassword?: string, newPassword?: string) => { success: boolean; message: string };
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'userId'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  createProduct: (name: string, category: ProductCategory, description: string, price: number, condition: ProductCondition, images: string[]) => { success: boolean; message: string };
  updateProduct: (id: string, name: string, category: ProductCategory, description: string, price: number, condition: ProductCondition, images: string[]) => { success: boolean; message: string };
  deleteProduct: (id: string) => { success: boolean; message: string };
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => { success: boolean; message: string; orderId?: string };
  toggleFavorite: (productId: string) => void;
  addReview: (sellerId: string, productId: string, productName: string, rating: number, comment: string) => void;
  adminApproveProduct: (productId: string) => void;
  adminRemoveProduct: (productId: string) => void;
  adminToggleBlockUser: (userId: string) => void;
  setNotificationsRead: () => void;
  simulateChangeOrderStatus: (orderId: string, status: Order['status']) => void;
}

const BrechoContext = createContext<BrechoContextType | undefined>(undefined);

export const BrechoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial LocalStorage Seeding & State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('brecho_v3_users');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('brecho_v3_users', JSON.stringify(INITIAL_USERS));
    // Save plain-text passwords specifically for simulation (since this is an demo environment)
    // We bind dummy passwords to mock users
    localStorage.setItem('brecho_v3_users_passwords', JSON.stringify({
      'mari@vendedor.com': '123',
      'felipe@cliente.com': '123',
      'admin@brecho.com': 'admin'
    }));
    return INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('brecho_v3_products');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('brecho_v3_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('brecho_v3_reviews');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('brecho_v3_reviews', JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('brecho_v3_orders');
    if (saved) return JSON.parse(saved);
    const mockOrders: Order[] = [
      {
        id: 'o_prev1',
        buyerId: 'u2',
        buyerName: 'Felipe Cliente',
        sellerId: 'u1',
        sellerName: 'Mariana Vendas',
        products: [
          {
            id: 'p1_prev',
            name: 'Jaqueta de Couro Vintage',
            price: 349.90,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
            quantity: 1
          }
        ],
        total: 349.90,
        status: 'Entregue',
        createdAt: '2026-05-20T16:00:00Z'
      },
      {
        id: 'o_prev2',
        buyerId: 'u2',
        buyerName: 'Felipe Cliente',
        sellerId: 'u1',
        sellerName: 'Mariana Vendas',
        products: [
          {
            id: 'p3_prev',
            name: 'Vestido Midi Floral',
            price: 79.90,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60',
            quantity: 1
          }
        ],
        total: 79.90,
        status: 'Aprovado',
        createdAt: '2026-05-25T10:30:00Z'
      }
    ];
    localStorage.setItem('brecho_v3_orders', JSON.stringify(mockOrders));
    return mockOrders;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('brecho_v3_notifications');
    if (saved) return JSON.parse(saved);
    const initialNotifications: Notification[] = [
      {
        id: 'n1',
        userId: 'u1',
        message: 'Bem-vinda ao Brechó Virtual, Mariana! Comece anunciando seus desapegos ou gerenciando sua vitrina.',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'n2',
        userId: 'u2',
        message: 'Seja bem-vindo, Felipe! Explore as melhores marcas e faça ótimas compras sustentáveis.',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('brecho_v3_notifications', JSON.stringify(initialNotifications));
    return initialNotifications;
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const saved = localStorage.getItem('brecho_v3_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('brecho_v3_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('brecho_v3_payment_methods');
    if (saved) return JSON.parse(saved);
    const initialPM: PaymentMethod[] = [
      {
        id: 'pm1',
        userId: 'u2',
        type: 'credit_card',
        provider: 'Visa',
        number: '•••• •••• •••• 4829',
        holderName: 'Felipe Cliente',
        expiry: '10/30',
        isDefault: true
      },
      {
        id: 'pm2',
        userId: 'u2',
        type: 'pix',
        provider: 'E-mail',
        number: 'felipe@cliente.com',
        holderName: 'Felipe Cliente',
        isDefault: false
      },
      {
        id: 'pm3',
        userId: 'u1',
        type: 'pix',
        provider: 'Celular',
        number: '(11) 98765-4321',
        holderName: 'Mariana Vendedora',
        isDefault: true
      }
    ];
    localStorage.setItem('brecho_v3_payment_methods', JSON.stringify(initialPM));
    return initialPM;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('brecho_v3_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [alertPopup, setAlertPopup] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    message: '',
    title: 'Aviso',
    type: 'info'
  });

  const showAlert = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', title = 'Aviso') => {
    setAlertPopup({
      isOpen: true,
      message,
      title,
      type
    });
  };

  const closeAlert = () => {
    setAlertPopup(prev => ({ ...prev, isOpen: false }));
  };

  // 2. Synchronize States with LocalStorage
  useEffect(() => {
    localStorage.setItem('brecho_v3_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('brecho_v3_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('brecho_v3_current_user', JSON.stringify(currentUser));
      // Keep individual user record in sync
      setUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
    } else {
      localStorage.removeItem('brecho_v3_current_user');
    }
  }, [currentUser]);


  // Helper functions for localized alerts
  const showNotification = (userId: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };


  // 3. User Actions
  const registerUser = (name: string, email: string, phone: string, password: string) => {
    if (!name || !email || !phone || !password) {
      return { success: false, message: 'Todos os campos são obrigatórios!' };
    }

    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'Este e-mail já está cadastrado!' };
    }

    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      role: 'client',
      isBlocked: false,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);

    // Save passwords safely simulated
    const passwords = JSON.parse(localStorage.getItem('brecho_v3_users_passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('brecho_v3_users_passwords', JSON.stringify(passwords));

    // Automated welcome notification
    showNotification(newUser.id, `Seja bem-vindo(a), ${name}! Sua conta foi criada com sucesso comercial.`, 'success');

    return { success: true, message: 'Cadastro finalizado com sucesso!' };
  };

  const loginUser = (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Usuário não cadastrado!' };
    }

    if (user.isBlocked) {
      return { success: false, message: 'Esta conta está bloqueada pelo administrador!' };
    }

    const passwords = JSON.parse(localStorage.getItem('brecho_v3_users_passwords') || '{}');
    if (passwords[email] !== password) {
      return { success: false, message: 'A senha informada está incorreta!' };
    }

    setCurrentUser(user);
    return { success: true, message: `Bem-vindo de volta, ${user.name}!` };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const recoverPassword = (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'E-mail não localizado no sistema.' };
    }

    // Since this is a demo, we simulate sending an email
    // We update the notification for that user to inform them of a recovery action
    showNotification(user.id, 'Você solicitou a recuperação de senha. Sua senha provisória foi redefinida para "123456".', 'warning');
    
    // Update passwords
    const passwords = JSON.parse(localStorage.getItem('brecho_v3_users_passwords') || '{}');
    passwords[email] = '123456';
    localStorage.setItem('brecho_v3_users_passwords', JSON.stringify(passwords));

    return { success: true, message: 'Instruções enviadas! Uma nova senha temporária "123456" foi configurada para sua segurança.' };
  };


  const updateProfile = (name: string, phone: string, profilePicture?: string) => {
    if (!currentUser) return { success: false, message: 'Sessão encerrada!' };

    const updatedUser = {
      ...currentUser,
      name,
      phone,
      profilePicture: profilePicture || currentUser.profilePicture
    };

    setCurrentUser(updatedUser);
    showNotification(currentUser.id, 'Seu perfil foi atualizado com sucesso.', 'info');
    return { success: true, message: 'Perfil editado com sucesso!' };
  };

  const updateCredentials = (email: string, currentPassword?: string, newPassword?: string) => {
    if (!currentUser) return { success: false, message: 'Sessão encerrada!' };

    // 1. If email changed, check is unique
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUser.id);
      if (emailExists) {
        return { success: false, message: 'Este e-mail já está em uso por outro usuário!' };
      }
    }

    // 2. Validate current password if new password is provided
    const passwords = JSON.parse(localStorage.getItem('brecho_v3_users_passwords') || '{}');
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword || passwords[currentUser.email] !== currentPassword) {
        return { success: false, message: 'A senha atual informada está incorreta!' };
      }
      passwords[email] = newPassword;
    } else if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      // transfer password from old email key to new email key
      const oldPwd = passwords[currentUser.email] || '123';
      passwords[email] = oldPwd;
      delete passwords[currentUser.email];
    }

    // Save passwords back to localStorage
    localStorage.setItem('brecho_v3_users_passwords', JSON.stringify(passwords));

    // Update currentUser and user list
    const updatedUser = {
      ...currentUser,
      email
    };
    setCurrentUser(updatedUser);

    showNotification(currentUser.id, 'Suas credenciais (e-mail/senha) foram atualizadas de forma segura!', 'success');
    return { success: true, message: 'Credenciais atualizadas com sucesso!' };
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newMethod: PaymentMethod = {
      ...method,
      id: 'pm_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      isDefault: paymentMethods.filter(pm => pm.userId === currentUser.id).length === 0 ? true : method.isDefault
    };

    if (newMethod.isDefault) {
      setPaymentMethods(prev => prev.map(pm => pm.userId === currentUser.id ? { ...pm, isDefault: false } : pm).concat(newMethod));
    } else {
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    showNotification(currentUser.id, `Nova forma de pagamento (${method.provider}) adicionada com sucesso!`, 'success');
  };

  const removePaymentMethod = (id: string) => {
    if (!currentUser) return;
    const itemToRemove = paymentMethods.find(pm => pm.id === id);
    setPaymentMethods(prev => {
      const filtered = prev.filter(pm => pm.id !== id);
      if (itemToRemove?.isDefault) {
        const firstRemaining = filtered.find(pm => pm.userId === currentUser.id);
        if (firstRemaining) {
          return filtered.map(pm => pm.id === firstRemaining.id ? { ...pm, isDefault: true } : pm);
        }
      }
      return filtered;
    });
    showNotification(currentUser.id, 'Forma de pagamento removida.', 'info');
  };

  const setDefaultPaymentMethod = (id: string) => {
    if (!currentUser) return;
    setPaymentMethods(prev => prev.map(pm => {
      if (pm.userId !== currentUser.id) return pm;
      return {
        ...pm,
        isDefault: pm.id === id
      };
    }));
    showNotification(currentUser.id, 'Forma de pagamento padrão atualizada.', 'info');
  };


  // 4. Product Actions
  const createProduct = (
    name: string,
    category: ProductCategory,
    description: string,
    price: number,
    condition: ProductCondition,
    images: string[]
  ) => {
    if (!currentUser) return { success: false, message: 'Faça login para cadastrar!' };
    if (!name || !category || !description || price <= 0 || !condition) {
      return { success: false, message: 'Por favor preencha todos os dados obrigatórios!' };
    }

    const cleanImages = images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60' // Default tee image
    ];

    const newProduct: Product = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      description,
      price,
      condition,
      images: cleanImages,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      isApproved: currentUser.role === 'admin', // Auto-approved if admin, otherwise needs approval
      isSold: false,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);

    if (currentUser.role !== 'admin') {
      showNotification(currentUser.id, `O anúncio "${name}" foi criado e está aguardando a aprovação de um administrador.`, 'info');
    } else {
      showNotification(currentUser.id, `O anúncio "${name}" foi publicado instantaneamente pela sua conta administradora!`, 'success');
    }

    return { success: true, message: 'Produto cadastrado com sucesso!' };
  };

  const updateProduct = (
    id: string,
    name: string,
    category: ProductCategory,
    description: string,
    price: number,
    condition: ProductCondition,
    images: string[]
  ) => {
    if (!currentUser) return { success: false, message: 'Inicie sessão para editar.' };
    const prod = products.find(p => p.id === id);
    if (!prod) return { success: false, message: 'Anúncio não encontrado.' };

    if (prod.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Não autorizado.' };
    }

    const cleanImages = images.length > 0 ? images : prod.images;

    const updatedProducts = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name,
          category,
          description,
          price,
          condition,
          images: cleanImages,
          isApproved: currentUser.role === 'admin' ? p.isApproved : false // Re-require approval if regular user edits and was previously approved
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    
    if (currentUser.role !== 'admin') {
      showNotification(prod.sellerId, `O seu anúncio atualizado para "${name}" passou para aprovação novamente.`, 'warning');
    } else {
      showNotification(prod.sellerId, `O anúncio "${name}" foi editado e atualizado.`, 'success');
    }

    return { success: true, message: 'Anúncio atualizado com sucesso!' };
  };

  const deleteProduct = (id: string) => {
    if (!currentUser) return { success: false, message: 'Não autorizado.' };
    const p = products.find(prod => prod.id === id);
    if (!p) return { success: false, message: 'Não encontrado.' };

    if (p.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Sem permissão.' };
    }

    setProducts(prev => prev.filter(prod => prod.id !== id));
    // Remove if also in cart
    setCart(prev => prev.filter(item => item.product.id !== id));
    // Remove if in favorites
    setFavorites(prev => prev.filter(fav => fav.productId !== id));

    return { success: true, message: 'Anúncio removido com sucesso!' };
  };


  // 5. Shopping Cart Actions
  const addToCart = (product: Product) => {
    if (product.isSold) return;
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        // Since it's a thrift/brechó, items are unique! Quantity is capped at 1. We just keep it as 1.
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    // Unique item: quantity should be 1. But standard support.
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };


  const checkout = () => {
    if (!currentUser) return { success: false, message: 'Faça login para concluir a compra.' };
    if (cart.length === 0) return { success: false, message: 'Seu carrinho está vazio!' };

    const newOrders: Order[] = [];
    const updatedProductsMap = [...products];

    // For every item in the cart, create a deal.
    // Grouping items by sellerId to trigger alerts to each seller separately
    const sellerGroups: { [sellerId: string]: CartItem[] } = {};
    cart.forEach(item => {
      if (!sellerGroups[item.product.sellerId]) {
        sellerGroups[item.product.sellerId] = [];
      }
      sellerGroups[item.product.sellerId].push(item);
    });

    const currentOrderId = 'ord_' + Math.random().toString(36).substr(2, 9);

    Object.entries(sellerGroups).forEach(([sellerId, items]) => {
      const sellerName = items[0].product.sellerName;
      const orderTotal = items.reduce((acc, current) => acc + (current.product.price * current.quantity), 0);

      const newOrder: Order = {
        id: currentOrderId + '_' + sellerId.substring(2, 5),
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: sellerId,
        sellerName: sellerName,
        products: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images[0],
          quantity: item.quantity
        })),
        total: orderTotal,
        status: 'Aprovado', // Auto-approved on mock bank payment
        createdAt: new Date().toISOString()
      };

      newOrders.push(newOrder);

      // Trigger seller notification
      showNotification(
        sellerId,
        `Oba! Você vendeu ${items.length} produto(s) para ${currentUser.name}! Total: R$ ${orderTotal.toFixed(2)}.`,
        'success'
      );

      // Decrement inventory/mark products as sold
      items.forEach(cItem => {
        const pIdx = updatedProductsMap.findIndex(p => p.id === cItem.product.id);
        if (pIdx > -1) {
          updatedProductsMap[pIdx].isSold = true;
        }
      });
    });

    setOrders(prev => [...newOrders, ...prev]);
    setProducts(updatedProductsMap);
    setCart([]);

    showNotification(
      currentUser.id,
      `Compra realizada com sucesso! Você adquiriu ${cart.length} item(ns). Acompanhe no seu histórico.`,
      'success'
    );

    return { success: true, message: 'Pedido finalizado com sucesso!', orderId: currentOrderId };
  };


  // 6. Favorites Actions
  const toggleFavorite = (productId: string) => {
    if (!currentUser) return;
    setFavorites(prev => {
      const exists = prev.find(fav => fav.userId === currentUser.id && fav.productId === productId);
      if (exists) {
        return prev.filter(fav => fav.id !== exists.id);
      } else {
        const newFav: Favorite = {
          id: 'fav_' + Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          productId: productId
        };
        return [...prev, newFav];
      }
    });
  };


  // 7. Reviews Actions
  const addReview = (sellerId: string, productId: string, productName: string, rating: number, comment: string) => {
    if (!currentUser) return;

    const newRev: Review = {
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      sellerId,
      productId,
      productName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newRev, ...prev]);

    // Send thank notification to the evaluate taker
    showNotification(
      sellerId,
      `Você recebeu uma avaliação nova de ${currentUser.name} (${rating} estrelas): "${comment.substr(0, 30)}..."`,
      'info'
    );
  };


  // 8. Admin Specific Actions
  const adminApproveProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isApproved: true } : p));
    showNotification(prod.sellerId, `Seu produto "${prod.name}" foi examinado e aprovado para o público comprador!`, 'success');
  };

  const adminRemoveProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProducts(prev => prev.filter(p => p.id !== productId));
    showNotification(prod.sellerId, `O produto "${prod.name}" foi indisponibilizado por infringir políticas de venda do Brechó.`, 'warning');
  };

  const adminToggleBlockUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedBlocked = !targetUser.isBlocked;
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: updatedBlocked } : u));
    
    // If we blocked currently logged in user, logout them.
    if (currentUser?.id === userId && updatedBlocked) {
      logoutUser();
    }
  };

  const setNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
  };

  const simulateChangeOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    showNotification(
      order.buyerId,
      `O status do seu pedido para "${order.products[0]?.name || 'itens'}" mudou para: ${status}!`,
      'info'
    );
  };

  return (
    <BrechoContext.Provider value={{
      users,
      products,
      reviews,
      orders,
      notifications,
      favorites,
      cart,
      currentUser,
      paymentMethods,
      alertPopup,
      showAlert,
      closeAlert,
      registerUser,
      loginUser,
      logoutUser,
      recoverPassword,
      updateProfile,
      updateCredentials,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      createProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      checkout,
      toggleFavorite,
      addReview,
      adminApproveProduct,
      adminRemoveProduct,
      adminToggleBlockUser,
      setNotificationsRead,
      simulateChangeOrderStatus
    }}>
      {children}
    </BrechoContext.Provider>
  );
};

export const useBrecho = () => {
  const context = useContext(BrechoContext);
  if (!context) {
    throw new Error('useBrecho must be used within a BrechoProvider');
  }
  return context;
};
