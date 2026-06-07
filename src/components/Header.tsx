import React, { useState } from 'react';
import { useBrecho } from '../BrechoContext';
import { ProductCategory } from '../types';
import { 
  ShoppingBag, 
  Heart, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Plus, 
  Sparkles, 
  CheckCircle
} from 'lucide-react';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onCategorySelect: (category: ProductCategory | 'Todos') => void;
  selectedCategory: ProductCategory | 'Todos';
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onOpenAddProduct: () => void;
  onOpenAdmin: () => void;
  onOpenFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  onCategorySelect,
  selectedCategory,
  onOpenAuth,
  onOpenCart,
  onOpenProfile,
  onOpenAddProduct,
  onOpenAdmin,
  onOpenFavorites
}) => {
  const { currentUser, logoutUser, notifications, setNotificationsRead, cart } = useBrecho();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length;
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal);
  };

  const handleSearchClear = () => {
    setSearchVal('');
    onSearchChange('');
  };

  const categories: (ProductCategory | 'Todos')[] = ['Todos', 'Feminino', 'Masculino', 'Calçados', 'Acessórios', 'Infantil', 'Outros'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-250 shadow-xs w-full" id="main-header">
      {/* Top Banner (Sustainable Eco Promo) */}
      <div className="bg-emerald-900 text-emerald-50 text-center py-1 md:py-1.5 px-3 md:px-4 text-[10px] sm:text-xs font-semibold tracking-wide leading-tight break-words">
        ♻️ Vista-se de sustentabilidade! Roupas incríveis com até 70% de desconto.
      </div>

      <div className="max-w-7xl mx-auto px-1.5 min-[360px]:px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer select-none" onClick={() => { onCategorySelect('Todos'); handleSearchClear(); }} id="logo-container">
            <span className="p-1 sm:p-2 bg-emerald-50 rounded-lg sm:rounded-xl mr-1 sm:mr-2.5 border border-emerald-150">
              <Sparkles className="h-3.5 w-3.5 sm:h-6 sm:w-6 text-emerald-700" />
            </span>
            <div>
              <h1 className="text-xs min-[360px]:text-sm sm:text-lg md:text-xl font-bold tracking-tight text-emerald-800 font-sans whitespace-nowrap">
                BRECHÓ<span className="hidden min-[380px]:inline font-light text-stone-400">VIRTUAL</span>
              </h1>
              <p className="hidden sm:block text-[10px] text-stone-400 font-mono tracking-wider uppercase -mt-0.5">Segunda Mão, Primeira Classe</p>
            </div>
          </div>

          {/* Search Bar - Desktop Only */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative" id="search-form">
            <input
              type="text"
              placeholder="Buscar por roupas, marcas ou palavras-chave..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearchChange(e.target.value);
              }}
              className="w-full bg-stone-100 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-stone-900 placeholder-stone-400"
            />
            <button type="submit" className="absolute right-3.5 top-3 text-stone-400 hover:text-emerald-700 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Actions panel - Desktop Only (sm and up) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-3 lg:gap-4 lg:flex-row" id="header-actions-desktop">
            
            {/* Create listing button */}
            {currentUser && currentUser.role !== 'client' && (
              <button
                onClick={onOpenAddProduct}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold p-1 sm:px-4 sm:py-2.5 rounded-full shadow-xs transition-all cursor-pointer"
                id="btn-advertise"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Desapegar</span>
              </button>
            )}

            {/* Favorite toggle */}
            {currentUser && (
              <button
                onClick={onOpenFavorites}
                className="p-1 min-[360px]:p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:bg-stone-50 hover:text-red-500 transition-colors relative cursor-pointer"
                title="Favoritos"
                id="btn-favorites"
              >
                <Heart className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Notifications panel with dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) setNotificationsRead();
                  }}
                  className="p-1 min-[360px]:p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:bg-stone-50 hover:text-emerald-700 transition-colors relative cursor-pointer"
                  title="Notificações"
                  id="btn-notifications"
                >
                  <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 py-2.5 text-stone-800 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-500 uppercase tracking-wider font-mono">Notificações</span>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-emerald-750 hover:underline"
                      >
                        Fechar
                      </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {userNotifications.length === 0 ? (
                        <div className="py-8 px-4 text-center text-stone-400 text-xs">
                          <CheckCircle className="h-8 w-8 mx-auto mb-1.5 text-stone-300" />
                          Nenhuma notificação por aqui.
                        </div>
                      ) : (
                        userNotifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-3 border-b border-stone-100 text-xs transition-colors hover:bg-stone-50/50 ${!n.isRead ? 'bg-emerald-50/20 font-medium' : ''}`}
                          >
                            <div className="flex gap-2">
                              <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                                n.type === 'success' ? 'bg-emerald-500' : 
                                n.type === 'warning' ? 'bg-emerald-600' : 'bg-blue-500'
                              }`} />
                              <div>
                                <p className="text-stone-700 leading-relaxed">{n.message}</p>
                                <span className="text-[9px] text-stone-400 font-mono block mt-1">
                                  {new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="p-1 min-[360px]:p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:bg-stone-50 hover:text-emerald-700 transition-colors relative cursor-pointer"
              title="Sacola de Compras"
              id="btn-cart"
            >
              <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse" id="cart-count-badge">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User authentication / Profile Area */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Admin button */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onOpenAdmin}
                    className="p-1 min-[360px]:p-1.5 sm:p-2 rounded-full text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Acessar Administração"
                    id="btn-admin-panel"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </button>
                )}

                {/* Profile Avatar Trigger */}
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-1 sm:gap-2 pl-1 pr-1 sm:pr-3 py-0.5 sm:py-1 bg-stone-50 hover:bg-stone-100 rounded-full border border-stone-200 transition-all text-left cursor-pointer"
                  id="btn-profile"
                >
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt={currentUser.name} 
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border border-stone-200" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase border border-emerald-200">
                      {currentUser.name.charAt(0)}
                    </span>
                  )}
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-stone-800 line-clamp-1">{currentUser.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-stone-400 -mt-0.5 font-mono uppercase tracking-wider text-right">
                      {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'seller' ? 'Vendedor' : currentUser.role === 'client' ? 'Cliente' : 'Membro'}
                    </p>
                  </div>
                </button>

                {/* Signout Button */}
                <button
                  onClick={() => { logoutUser(); }}
                  className="p-1 min-[360px]:p-1.5 sm:p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  title="Sair da Conta"
                  id="btn-logout"
                >
                  <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 font-sans border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all flex-shrink-0 cursor-pointer"
                id="btn-auth-trigger"
              >
                <User className="h-4 w-4" />
                <span>Entrar</span>
              </button>
            )}

          </div>

          {/* Simple Mobile Controls - Visible ONLY below sm screen */}
          <div className="flex sm:hidden items-center gap-1.5" id="header-actions-mobile">
            {/* Direct Cart Button on Mobile Header */}
            <button
              onClick={onOpenCart}
              className="p-1.5 bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-emerald-700 active:scale-95 transition-all rounded-full relative cursor-pointer"
              title="Sacola de Compras"
              id="btn-cart-mobile"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse" id="cart-count-badge-mobile">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Authentication / Profile Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                {/* Admin button if admin */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onOpenAdmin}
                    className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
                    title="Painel do Administrador"
                    id="btn-admin-mobile"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </button>
                )}

                {/* Profile Avatar Trigger on mobile */}
                <button
                  onClick={onOpenProfile}
                  className="flex items-center justify-center p-0.5 bg-stone-50 hover:bg-stone-100 rounded-full border border-stone-200 transition-all cursor-pointer"
                  id="btn-profile-mobile"
                  title="Meu Perfil"
                >
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt={currentUser.name} 
                      className="h-6.5 w-6.5 rounded-full object-cover border border-stone-100" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="h-6.5 w-6.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] uppercase border border-emerald-150">
                      {currentUser.name.charAt(0)}
                    </span>
                  )}
                </button>

                {/* Direct Signout Button on Mobile */}
                <button
                  onClick={() => { logoutUser(); }}
                  className="p-1.5 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                  title="Sair"
                  id="btn-logout-mobile"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 font-sans border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0 cursor-pointer"
                id="btn-auth-trigger-mobile"
              >
                <User className="h-3.5 w-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Search - Visible under 768px */}
        <form onSubmit={handleSearchSubmit} className="flex md:hidden pb-4 relative mt-1 w-full max-w-full" id="mobile-search-form">
          <input
            type="text"
            placeholder="Buscar desapegos no Brechó..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="w-full bg-stone-100 border-none text-stone-800 rounded-full py-1.5 pl-4 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="absolute right-3 top-1.5 text-stone-400 hover:text-emerald-700">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Categories selector wrap menu */}
        <div className="flex flex-wrap py-2.5 sm:py-3.5 gap-1.5 sm:gap-2 border-t border-stone-100 w-full" id="category-rail">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategorySelect(c)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-tight transition-all uppercase font-sans cursor-pointer ${
                selectedCategory === c
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-605 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
