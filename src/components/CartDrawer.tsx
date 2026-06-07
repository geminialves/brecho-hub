import React, { useState } from 'react';
import { useBrecho } from '../BrechoContext';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { cart, removeFromCart, updateCartQuantity, currentUser, checkout, showAlert } = useBrecho();
  const [successOrder, setSuccessOrder] = useState<{ id?: string; total: number } | null>(null);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (!currentUser) {
      showAlert('Inicie sessão para poder finalizar sua compra!', 'warning', 'Login Requerido');
      onOpenAuth();
      return;
    }
    
    const res = checkout();
    if (res.success) {
      setSuccessOrder({ id: res.orderId, total });
    } else {
      showAlert(res.message, 'error', 'Houve um Erro');
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" onClick={successOrder ? handleCloseSuccess : onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-100 shadow-2xl flex flex-col justify-between animate-slide-left h-full">
          
          {/* SUCCESS STATUS PANEL */}
          {successOrder ? (
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full gap-5">
              <span className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Compra Concluída!</h3>
                <p className="text-sm text-stone-400 mt-1 leading-relaxed">
                  Obrigado por apoiar a economia circular e fazer compras conscientes. Seu recibo está gerado.
                </p>
              </div>

              {/* Order Invoice Recipe */}
              <div className="w-full bg-stone-50 rounded-2xl border border-stone-100 p-5 mt-2 text-left space-y-3 font-mono">
                <div className="border-b border-stone-200 border-dashed pb-3.5 flex justify-between text-xs">
                  <span className="text-stone-400 uppercase">Pedido ID</span>
                  <span className="text-stone-700 font-bold">{successOrder.id || 'ORD_DEFAULT'}</span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <p className="text-stone-400 uppercase">Formato Pagamento</p>
                  <p className="text-stone-700">Saldo virtual / Boleto aprovado</p>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-stone-400 uppercase">Destinatário</p>
                  <p className="text-stone-700">{currentUser?.name}</p>
                </div>

                <div className="border-t border-stone-200 border-dashed pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-stone-800 uppercase">Total Pago</span>
                  <span className="text-emerald-805 text-base">R$ {successOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="w-full space-y-2 mt-4">
                <button
                  onClick={handleCloseSuccess}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-full text-sm font-semibold transition-all shadow"
                >
                  Continuar Explorando
                </button>
                <p className="text-[10px] text-stone-400 font-mono">
                  Sua entrega está sendo preparada pelo(s) vendedor(es)!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* CART ITEMS VIEW */}
              <div>
                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-700" />
                    <h3 className="font-bold text-stone-900 text-lg">Sua Sacola</h3>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {cart.length}
                    </span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-700 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Items collection */}
                <div className="divide-y divide-stone-100 overflow-y-auto max-h-[70vh] px-6">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center text-stone-400 flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-stone-200 mb-3" />
                      <p className="text-sm font-medium">Sua sacola está vazia</p>
                      <p className="text-xs text-stone-300 mt-1">Navegue pelas roupas e adicione peças únicas.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="py-4 flex gap-4">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="h-16 w-16 rounded-xl object-cover border border-stone-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-stone-100 text-stone-500 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded mb-1">
                            {item.product.condition}
                          </span>
                          <h4 className="font-semibold text-stone-900 text-sm truncate leading-tight">
                            {item.product.name}
                          </h4>
                          <p className="text-xs font-mono text-emerald-700 font-semibold mt-1">
                            R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-stone-400 text-[10px]">
                            <span>Vendido por: {item.product.sellerName.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-stone-350 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                          
                          {/* Sizing constraints: Unique thrift piece counter indicator */}
                          <span className="text-[10px] font-mono text-stone-400 px-2 py-0.5 bg-stone-50 rounded">
                            Qtd: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Summary & Purchase Triggers */}
              {cart.length > 0 && (
                <div className="px-6 py-6 border-t border-stone-100 bg-stone-50/50 space-y-4">
                  {/* Total aggregate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Subtotal</span>
                      <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Frete (Entrega Brechó)</span>
                      <span className="text-emerald-600 font-semibold uppercase font-mono text-[10px]">Grátis</span>
                    </div>
                    <div className="border-t border-stone-200/50 my-1 pt-2 flex justify-between text-sm font-bold text-stone-900">
                      <span>Total</span>
                      <span className="text-emerald-800 text-base font-mono">
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Submit trigger button */}
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:shadow-md transition-all"
                    id="btn-checkout"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
