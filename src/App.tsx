import React, { useState } from 'react';
import { BrechoProvider, useBrecho } from './BrechoContext';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { ProductFormModal } from './components/ProductFormModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AlertPopupModal } from './components/AlertPopupModal';
import { Product, ProductCategory, ProductCondition } from './types';
import { 
  SlidersHorizontal, Sliders, ChevronLeft, ChevronRight, X, Heart, Star, 
  Sparkles, ShieldAlert, ArrowUpRight, Recycle, ArrowRight, RotateCcw
} from 'lucide-react';

function AppContent() {
  const { currentUser, products, favorites } = useBrecho();

  // Active Main View State: 'catalog' | 'favorites' | 'dashboard' | 'admin'
  const [activeView, setActiveView] = useState<'catalog' | 'favorites' | 'dashboard' | 'admin'>('catalog');

  // Modular overlay actions state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Search & Filters parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | 'Todos'>('Todos');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Clear all catalog filers
  const handleClearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedCondition('Todos');
    setMaxPrice('');
    setMinPrice('');
    setSearchQuery('');
  };

  // Filter and sort catalog products
  const filteredProducts = products.filter(prod => {
    // 1. Core visibility: Only approved listings showing to regular users, unless it's their own listing or they are admins.
    const isOwner = currentUser && prod.sellerId === currentUser.id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isVisible = prod.isApproved || isOwner || isAdmin;
    if (!isVisible) return false;

    // 2. Search query matches
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = prod.name.toLowerCase().includes(q);
      const matchesDesc = prod.description.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }

    // 3. Category match
    if (selectedCategory !== 'Todos' && prod.category !== selectedCategory) {
      return false;
    }

    // 4. Condition match
    if (selectedCondition !== 'Todos' && prod.condition !== selectedCondition) {
      return false;
    }

    // 5. Price range match
    const minP = parseFloat(minPrice);
    if (!isNaN(minP) && prod.price < minP) {
      return false;
    }
    const maxP = parseFloat(maxPrice);
    if (!isNaN(maxP) && prod.price > maxP) {
      return false;
    }

    return true;
  });

  // Sort matched results
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'priceAsc') {
      return a.price - b.price;
    }
    if (sortBy === 'priceDesc') {
      return b.price - a.price;
    }
    return 0;
  });

  // Paginate results
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Triggering edits from dashboard lists
  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductFormOpen(true);
  };

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductFormOpen(true);
  };

  // Switch to categories filter from header selector
  const handleCategorySelect = (category: ProductCategory | 'Todos') => {
    setSelectedCategory(category);
    setActiveView('catalog');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-stone-50/30 flex flex-col justify-between overflow-x-hidden" id="app-viewport">
      
      {/* 1. Navbar header */}
      <Header 
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => { 
          if (currentUser) {
            setActiveView('dashboard'); 
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenAddProduct={() => {
          if (currentUser) {
            handleOpenAddProduct();
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenFavorites={() => setActiveView('favorites')}
      />

      {/* 2. Main Content Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full" id="main-content-flow">
        
        {/* ----------------- VIEW A: FAVORITES LIST ----------------- */}
        {activeView === 'favorites' && (
          <div className="space-y-6 animate-fade-in" id="favorites-view">
            <div className="flex items-center justify-between border-b border-stone-150 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500 fill-current" /> Seus Favoritos Salvos
                </h2>
                <p className="text-xs text-stone-400 mt-1">Peças exclusivas que você de olho</p>
              </div>
              <button
                onClick={() => setActiveView('catalog')}
                className="text-xs text-emerald-750 hover:underline font-semibold font-sans uppercase tracking-tight"
              >
                Voltar à Vitrine
              </button>
            </div>

            {favorites.filter(f => f.userId === currentUser?.id).length === 0 ? (
              <div className="text-center py-20 bg-white border border-stone-100 rounded-3xl text-stone-400 max-w-lg mx-auto">
                <Heart className="h-10 w-10 mx-auto text-stone-200 mb-3" />
                <p className="text-sm font-medium">Nenhum favorito por aqui</p>
                <p className="text-xs text-stone-300 mt-1">Navegue na vitrine e clique no coração para guardar itens de desejo.</p>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="mt-5 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-5 text-xs font-semibold rounded-full"
                >
                  Garimpar Roupas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products
                  .filter(p => favorites.some(f => f.userId === currentUser?.id && f.productId === p.id))
                  .map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onSelect={(prod) => setSelectedProduct(prod)} 
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ----------------- VIEW B: SELLER DASHBOARD ----------------- */}
        {activeView === 'dashboard' && (
          <div className="space-y-4 animate-fade-in" id="seller-dashboard-container">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Canal do Anunciante</span>
              <button
                onClick={() => setActiveView('catalog')}
                className="text-xs text-stone-500 hover:text-stone-900 border border-stone-200 py-1.5 px-3 rounded-lg hover:bg-stone-50/50"
              >
                Voltar à Vitrine
              </button>
            </div>

            <SellerDashboard 
              onOpenEditProduct={handleOpenEditProduct} 
              onOpenAddProduct={handleOpenAddProduct}
              onClose={() => setActiveView('catalog')} 
            />
          </div>
        )}

        {/* ----------------- VIEW C: ADMIN ACCESS ----------------- */}
        {activeView === 'admin' && (
          <div className="space-y-4 animate-fade-in" id="admin-panel-container">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-red-500">Acesso Restrito</span>
              <button
                onClick={() => setActiveView('catalog')}
                className="text-xs text-stone-500 hover:text-stone-900 border border-stone-200 py-1.5 px-3 rounded-lg"
              >
                Sair do Painel
              </button>
            </div>
            
            <AdminPanel onClose={() => setActiveView('catalog')} />
          </div>
        )}

        {/* ----------------- VIEW D: STANDARDS CATALOG VITRINE ----------------- */}
        {activeView === 'catalog' && (
          <div className="space-y-8 animate-fade-in" id="catalog-view">
            
            {/* Elegant sustainable promotional banner (Anti-slop, clean display) */}
            <div className="bg-stone-100 rounded-3xl p-6 sm:p-10 border border-stone-200/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 z-10 max-w-xl text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-850 border border-emerald-100 px-3 py-1 text-[10px] uppercase font-mono tracking-widest rounded-full font-bold">
                  <Recycle className="h-3.5 w-3.5" /> Moda Circular e Consciente
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans">
                  Garimpe Peças Únicas de Segunda Mão.
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  Roupas, calçados e acessórios selecionados com carinho, prontos para ganhar uma nova jornada no seu guarda-roupa de forma econômica.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-750 hover:underline"
                  >
                    <span>Limpar todas as buscas</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Vector abstract layout representation */}
              <div className="relative h-28 w-28 opacity-20 md:opacity-80 flex-shrink-0">
                <div className="absolute inset-0 bg-emerald-800 rounded-3xl rotate-12" />
                <div className="absolute inset-2 bg-emerald-700 rounded-3xl -rotate-6 flex items-center justify-center text-emerald-50">
                  <Sparkles className="h-10 w-10 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Split container: Filtros panel (Left Col 3) & Products grid list (Right Col 9) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Sidebar Filters panel */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-100 space-y-5" id="filters-sidebar">
                <div className="flex items-center justify-between border-b border-stone-50 pb-2.5">
                  <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4 text-stone-500" /> Filtros Vitrina
                  </h3>
                  
                  {/* Clean up action */}
                  {(selectedCategory !== 'Todos' || selectedCondition !== 'Todos' || maxPrice || minPrice || searchQuery) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] uppercase font-bold text-red-500 hover:underline"
                      title="Apagar buscas"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Filter by Category */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Todos">Todas as Categorias</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Calçados">Calçados</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {/* Filter by Conservation profile condition */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">Estado de Uso</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Todos">Qualquer Conservação</option>
                    <option value="Novo com etiqueta">Novo com etiqueta</option>
                    <option value="Novo sem etiqueta">Novo sem etiqueta</option>
                    <option value="Gentilmente usado">Gentilmente usado</option>
                    <option value="Usado com marcas de uso">Usado com marcas de uso</option>
                  </select>
                </div>

                {/* Filter by Custom price range values */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">Faixa de Preço (R$)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs font-mono text-center focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs font-mono text-center focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sorting Selectors */}
                <div className="space-y-1.5 border-t border-stone-50 pt-3">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="priceAsc">Menor preço primeiro</option>
                    <option value="priceDesc">Maior preço primeiro</option>
                  </select>
                </div>

                {/* Micro support notification */}
                <div className="pt-2 text-[10px] font-mono text-stone-400 leading-normal border-t border-stone-50/70">
                  🦖 Garimpos são peças únicas. Adicione à sacola antes que levem!
                </div>
              </div>


              {/* Right Side panel: Grid list + page indicators */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Visual results quantity check */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-450 font-mono uppercase tracking-wide">
                    Encontrados: <span className="text-stone-800 font-bold font-sans text-sm">{sortedProducts.length}</span> desapegos
                  </span>
                  
                  {/* Category breadcrumb note */}
                  {selectedCategory !== 'Todos' && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-150 py-1 px-3 rounded-full uppercase text-[10px]">
                      Filtro ativo: {selectedCategory}
                    </span>
                  )}
                </div>

                {/* Items render Grid */}
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-24 bg-white border border-stone-100 rounded-3xl max-w-xl mx-auto p-6 space-y-3">
                    <Sliders className="h-10 w-10 mx-auto text-stone-250 mb-1" />
                    <h4 className="font-bold text-stone-900 text-sm">Nenhum resultado corresponde à filtragem</h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                      Experimente rever os filtros de preço, categoria de conservação selecionada ou digite palavras chaves alternativas.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-3.5 bg-stone-900 hover:bg-stone-850 text-white py-2 px-5 text-xs font-bold rounded-full shadow-sm"
                    >
                      Redefinir Filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" id="products-catalog-grid">
                    {paginatedProducts.map(p => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onSelect={(prod) => setSelectedProduct(prod)} 
                      />
                    ))}
                  </div>
                )}

                {/* US07: Paginado Navigator footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-stone-100 pt-6 font-mono text-[11px]" id="pagination-controls">
                    <span className="text-stone-400">
                      Página <span className="text-stone-800 font-bold">{currentPage}</span> de <span className="text-stone-800 font-bold">{totalPages}</span>
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-lg text-stone-605 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="Página anterior"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-lg text-stone-605 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="Próxima página"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. Global Footer copyright and circular disclaimer */}
      <footer className="bg-stone-900 text-stone-400 py-10 mt-14 border-t border-stone-850 text-xs" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Brechó Virtual</h4>
            <p className="leading-relaxed text-stone-400 max-w-xs font-sans">
              Amor à segunda vista! Moda sustentável e economia colaborativa ao alcance de todos. Compra e venda descomplicada de ponta a ponta.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Sustentabilidade</h4>
            <ul className="space-y-1.5 font-sans">
              <li>♻️ Reduza a pegada de água têxtil</li>
              <li>👕 Evite descartes em aterros urbanos</li>
              <li>💰 Economias estimadas de até R$ 1200 por ano</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Suporte Global</h4>
            <p className="leading-relaxed text-stone-400 font-sans">
              Encontrou alguma inconsistência ou precisa de ajuda com a sua venda? Contrate nosso suporte 24h ou consulte a Central Brechó.
            </p>
            <span className="text-[10px] text-stone-500 font-mono uppercase block mt-3 select-all">Applet ID: d5dedbd8-478e</span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-850 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 text-[11px]">
          <p>© 2026 Brechó Virtual Inc. Desenvolvido para fomento da economia circular.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-stone-400 transition">Termos de Uso</span>
            <span className="cursor-pointer hover:text-stone-400 transition">Políticas Gerais</span>
          </div>
        </div>
      </footer>

      {/* 4. Overlay & Dialog Portals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onOpenAuth={() => { setIsCartOpen(false); setIsAuthOpen(true); }}
      />
      
      <ProductFormModal 
        isOpen={isProductFormOpen} 
        onClose={() => { setIsProductFormOpen(false); setProductToEdit(null); }}
        productToEdit={productToEdit}
      />
      
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      <AlertPopupModal />

    </div>
  );
}

export default function App() {
  return (
    <BrechoProvider>
      <AppContent />
    </BrechoProvider>
  );
}
