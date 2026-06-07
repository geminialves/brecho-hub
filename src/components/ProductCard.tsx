import React from 'react';
import { Product } from '../types';
import { useBrecho } from '../BrechoContext';
import { Heart, Tag, Star, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { currentUser, favorites, toggleFavorite, reviews, addToCart, cart, showAlert } = useBrecho();

  const isFav = currentUser ? favorites.some(f => f.userId === currentUser.id && f.productId === product.id) : false;
  const isAlreadyInCart = cart.some(item => item.product.id === product.id);

  // Calculate seller rating from reviews
  const sellerReviews = reviews.filter(r => r.sellerId === product.sellerId);
  const averageRating = sellerReviews.length > 0 
    ? (sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(1)
    : null;

  // Condition color pairing map
  const conditionColors: { [key in Product['condition']]: string } = {
    'Novo com etiqueta': 'bg-emerald-50 text-emerald-700 border-emerald-150',
    'Novo sem etiqueta': 'bg-emerald-50/70 text-emerald-800 border-emerald-200/50',
    'Gentilmente usado': 'bg-stone-100 text-stone-600 border-stone-200',
    'Usado com marcas de uso': 'bg-stone-100 text-stone-500 border-stone-200/80'
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showAlert('Por favor, faça logon para salvar seus favoritos!', 'warning', 'Acesso Restrito');
      return;
    }
    toggleFavorite(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.isSold) return;
    addToCart(product);
  };

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden hover:shadow-md hover:border-emerald-700/20 transition-all flex flex-col h-full cursor-pointer relative"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        
        {/* Sold banner overlay */}
        {product.isSold && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-stone-900 text-stone-100 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest border border-stone-800 font-bold shadow-lg">
              Vendido
            </span>
          </div>
        )}

        {/* Pending approval overlay (for the seller) */}
        {!product.isApproved && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-stone-900/95 text-stone-100 text-[10px] font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full backdrop-blur-xs border border-stone-800">
            Aguardando Aprovação
          </div>
        )}

        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60'} 
          alt={product.name} 
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Favorite heart icon absolute button */}
        {!product.isSold && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all z-20 shadow-sm ${
              isFav 
                ? 'bg-red-50 text-red-500 border border-red-100' 
                : 'bg-white/90 text-stone-600 hover:text-red-500 hover:bg-white border border-stone-100'
            }`}
            style={{ width: '40px', height: '40px' }} // Standard cursor target size
            title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Category banner */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-stone-950/80 text-white text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm backdrop-blur-xs">
            {product.category}
          </span>
        </div>

        {/* Direct Add to Cart Button */}
        {!product.isSold && product.isApproved && (
          <button
            onClick={handleAddToCartClick}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all duration-300 z-20 shadow-sm flex items-center justify-center cursor-pointer ${
              isAlreadyInCart 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500' 
                : 'bg-white/95 text-stone-600 hover:text-emerald-700 hover:bg-white border border-stone-100'
            }`}
            style={{ width: '40px', height: '40px' }}
            title={isAlreadyInCart ? "Já está na sacola" : "Adicionar à sacola diretamente"}
            id={`btn-quick-add-${product.id}`}
          >
            {isAlreadyInCart ? (
              <Check className="h-4.5 w-4.5" />
            ) : (
              <Plus className="h-4.5 w-4.5" />
            )}
          </button>
        )}
      </div>

      {/* Product Content info panel */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-1.5">
          {/* Condition tag */}
          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-medium rounded-full border ${conditionColors[product.condition]}`}>
            {product.condition}
          </span>

          {/* Seller simple rating */}
          {averageRating && (
            <span className="flex items-center gap-0.5 text-xs text-orange-600 font-medium">
              <Star className="h-3 w-3 fill-current text-amber-500" /> {averageRating}
            </span>
          )}
        </div>

        {/* Name and description snippet */}
        <div className="flex-1">
          <h3 className="font-semibold text-stone-900 text-sm leading-tight line-clamp-1 group-hover:text-emerald-750 transition-colors">
            {product.name}
          </h3>
          <p className="text-stone-400 text-xs line-clamp-1 mt-1 font-sans">
            {product.description}
          </p>
        </div>

        {/* Price and Seller container */}
        <div className="flex items-end justify-between border-t border-stone-50 pt-3 mt-1.5">
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-mono tracking-wider -mb-0.5">Valor Único</p>
            <p className="font-mono text-base font-semibold text-stone-900">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block font-mono">Anunciante</span>
            <span className="text-xs font-semibold text-stone-700 line-clamp-1 max-w-[120px]">{product.sellerName.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
