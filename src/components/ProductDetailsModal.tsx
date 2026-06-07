import React, { useState } from 'react';
import { Product } from '../types';
import { useBrecho } from '../BrechoContext';
import { 
  X, Heart, ShoppingBag, Star, Mail, Phone, Shield, ShieldAlert,
  ArrowRight, Info, AlertTriangle, MessageSquare, Check
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const { currentUser, favorites, toggleFavorite, addToCart, cart, reviews, showAlert } = useBrecho();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedPrompt, setAddedPrompt] = useState(false);

  if (!isOpen) return null;

  const isFav = currentUser ? favorites.some(f => f.userId === currentUser.id && f.productId === product.id) : false;
  const isAlreadyInCart = cart.some(item => item.product.id === product.id);

  // Retrieve reviews for the seller of this product
  const sellerReviews = reviews.filter(r => r.sellerId === product.sellerId);
  const averageRating = sellerReviews.length > 0 
    ? (sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(1)
    : null;

  const handleFavoriteClick = () => {
    if (!currentUser) {
      showAlert('Faça logon para favoritar este item!', 'warning', 'Sessão Requerida');
      onOpenAuth();
      return;
    }
    toggleFavorite(product.id);
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedPrompt(true);
    setTimeout(() => {
      setAddedPrompt(false);
    }, 2000);
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Conditions list tags mapping
  const conditionsDescription: { [key in Product['condition']]: string } = {
    'Novo com etiqueta': 'Item sem uso algum, ainda acompanhado das etiquetas originais de fábrica.',
    'Novo sem etiqueta': 'Item novinho que nunca foi utilizado, porém não possui mais as etiquetas.',
    'Gentilmente usado': 'Peça pouquíssimo usada, em condições impecáveis sem marcas visíveis ou defeitos.',
    'Usado com marcas de uso': 'Peça com sinais normais de desgaste natural pelo tempo ou uso, ideal para garimpo.'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="product-detail-container">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-stone-100 shadow-2xl p-5 sm:p-8 overflow-hidden z-10 animate-scale-up grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Close button inside modal container */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-stone-100/90 rounded-full text-stone-500 hover:text-stone-850 transition shadow-sm border border-stone-150 z-30"
            title="Fechar Detalhes"
          >
            <X className="h-5 w-5" />
          </button>

          {/* LEFT SECTION (Col Span 6): IMAGES GALLERY */}
          <div className="md:col-span-6 flex flex-col gap-3 relative">
            
            {/* Main picture viewport */}
            <div className="aspect-square bg-stone-50 rounded-2xl overflow-hidden border border-stone-105 relative">
              {product.isSold && (
                <div className="absolute inset-0 bg-stone-900/65 flex items-center justify-center z-10">
                  <span className="bg-stone-900 text-white font-mono uppercase tracking-widest text-xs font-bold py-3 px-6 border border-stone-800 rounded-full shadow-lg">
                    Item vendido
                  </span>
                </div>
              )}
              
              <img 
                src={product.images[activeImageIdx] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60'} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnails rail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 mt-1" id="thumbnails-rail">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all ${
                      idx === activeImageIdx ? 'border-emerald-700 scale-95 shadow-sm' : 'border-stone-150 hover:border-stone-300'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* RIGHT SECTION (Col Span 6): METADATA & TRANSACTION CHANNELS */}
          <div className="md:col-span-6 flex flex-col justify-between gap-5 text-xs text-stone-700">
            
            <div className="space-y-4">
              {/* Category tag line */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-stone-905 text-stone-950 font-semibold px-2.5 py-0.5 rounded-full border border-stone-200 text-[10px] uppercase tracking-wider font-mono">
                  {product.category}
                </span>

                <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                  {product.condition}
                </span>
              </div>

              {/* Title & Price display */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
                  {product.name}
                </h2>
                
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl font-black font-mono text-stone-900">
                    R$ {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-stone-400">Garimpo Único</span>
                </div>
              </div>

              {/* Description text box */}
              <div className="border-t border-stone-100 pt-3 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">Descrição da Peça</span>
                <p className="text-stone-600 leading-relaxed font-sans text-xs">
                  {product.description}
                </p>
              </div>

              {/* Condition note explanation details */}
              <div className="bg-stone-50 border border-stone-100/70 p-3 rounded-xl flex gap-2">
                <Info className="h-4.5 w-4.5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-700 text-[10px] uppercase font-mono block">Condição: {product.condition}</span>
                  <p className="text-[10.5px] text-stone-450 mt-0.5 leading-normal">{conditionsDescription[product.condition]}</p>
                </div>
              </div>

              {/* Advertiser card information (US08) */}
              <div className="border-t border-stone-100 pt-3.5 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">Sobre o Anunciante</span>
                
                <div className="flex items-center justify-between gap-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center justify-center uppercase">
                      {product.sellerName.charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold text-stone-900 text-xs">{product.sellerName}</p>
                      
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-stone-400 font-medium">
                        {averageRating ? (
                          <span className="text-orange-600 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current text-amber-500" /> {averageRating} / 5.0
                          </span>
                        ) : (
                          <span>Sem avaliações ainda</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <a 
                      href={`https://wa.me/${product.sellerId}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-mono"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>


            {/* SUBMIT TRIGGERS FOOTER BOX */}
            <div className="border-t border-stone-100 pt-4 mt-2">
              
              {/* Cart insertion feedback flags banner */}
              {addedPrompt && (
                <div className="mb-3 py-1.5 px-3 bg-stone-900 text-white rounded-lg text-center font-mono text-[10px] tracking-wide flex items-center justify-center gap-1.5 animate-pulse">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> PEÇA ADICIONADA À SACOLA!
                </div>
              )}

              <div className="flex gap-2.5">
                {/* Add to Favorite key button */}
                <button
                  onClick={handleFavoriteClick}
                  className={`p-3 rounded-full border transition-all ${
                    isFav 
                      ? 'bg-red-50 text-red-500 border-red-100' 
                      : 'bg-stone-50 text-stone-600 hover:text-red-500 hover:bg-stone-100 border-stone-200'
                  }`}
                  style={{ width: '48px', height: '48px' }}
                  title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  id="btn-details-favorite"
                >
                  <Heart className={`h-5 w-5 mx-auto ${isFav ? 'fill-current' : ''}`} />
                </button>

                {/* Add to shopping bag button */}
                {product.isSold ? (
                  <button
                    disabled
                    className="flex-1 bg-stone-100 text-stone-400 rounded-full font-bold cursor-not-allowed py-3 h-12"
                    id="btn-details-addcart-sold"
                  >
                    Peça Esgotada
                  </button>
                ) : isAlreadyInCart ? (
                  <button
                    disabled
                    className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-full font-bold py-3 h-12 text-xs uppercase font-mono tracking-wider cursor-not-allowed"
                    id="btn-details-addcart-already"
                  >
                    Já está na Sacola
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-all hover:shadow-md flex items-center justify-center gap-2 h-12 text-sm shadow-sm"
                    id="btn-details-addcart"
                  >
                    <ShoppingBag className="h-4.5 w-4.5" />
                    <span>Adicionar à Sacola</span>
                  </button>
                )}
              </div>
            </div>

            {/* SELLER EVALUATIONS LIST */}
            {sellerReviews.length > 0 && (
              <div className="mt-4 border-t border-stone-100 pt-3.5 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">Feedback de Clientes</span>
                <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                  {sellerReviews.map(r => (
                    <div key={r.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-[11px] leading-relaxed">
                      <div className="flex justify-between items-center text-[9.5px] font-mono text-stone-400">
                        <span className="font-bold text-stone-605">{r.evaluatorName}</span>
                        <span>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex text-amber-500 my-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-stone-550 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
