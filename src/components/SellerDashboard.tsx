import React, { useState } from 'react';
import { useBrecho } from '../BrechoContext';
import { Product, Order, Review, ProductCategory, ProductCondition } from '../types';
import { 
  BarChart2, ShoppingBag, DollarSign, Tag, User, Phone, CheckCircle, 
  Trash2, Edit, AlertCircle, TrendingUp, Grid, Truck, MessageSquare, Star, 
  Settings2, Image, Camera, CheckSquare, Key, Mail, CreditCard, Plus, Check, Lock, ShieldAlert
} from 'lucide-react';

interface SellerDashboardProps {
  onOpenEditProduct: (product: Product) => void;
  onOpenAddProduct?: () => void;
  onClose: () => void;
}

type DashTab = 'metrics' | 'listings' | 'purchases' | 'sales' | 'profile';

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onOpenEditProduct, onOpenAddProduct, onClose }) => {
  const { 
    currentUser, products, orders, reviews, deleteProduct, updateProfile, 
    addReview, simulateChangeOrderStatus,
    paymentMethods, updateCredentials, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod,
    showAlert
  } = useBrecho();

  const isSellerOrAdmin = currentUser ? (currentUser.role === 'seller' || currentUser.role === 'admin') : false;

  const [activeTab, setActiveTab] = useState<DashTab>(() => {
    return currentUser?.role === 'client' ? 'purchases' : 'metrics';
  });

  // Profile fields state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profilePic, setProfilePic] = useState(currentUser?.profilePicture || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Credentials and Security state
  const [emailVal, setEmailVal] = useState(currentUser?.email || '');
  const [currentPasswordVal, setCurrentPasswordVal] = useState('');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Payment Methods form state
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [payType, setPayType] = useState<'credit_card' | 'pix'>('credit_card');
  const [payProvider, setPayProvider] = useState('');
  const [payNumber, setPayNumber] = useState('');
  const [payHolder, setPayHolder] = useState(currentUser?.name || '');
  const [payExpiry, setPayExpiry] = useState('');

  // Evaluation form state
  const [evaluatingProduct, setEvaluatingProduct] = useState<{ id: string; sellerId: string; name: string } | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [evalSuccess, setEvalSuccess] = useState('');

  if (!currentUser) return null;

  // Filter listings & metrics
  const myProducts = products.filter(p => p.sellerId === currentUser.id);
  const activeListings = myProducts.filter(p => !p.isSold && p.isApproved);
  const soldProductsCount = myProducts.filter(p => p.isSold).length;

  // My Sales: orders where currentUser is the seller
  const mySales = orders.filter(o => o.sellerId === currentUser.id);
  const totalEarnings = mySales.reduce((acc, curr) => curr.status !== 'Cancelado' ? acc + curr.total : acc, 0);

  // My Purchases: orders where currentUser is the buyer
  const myPurchases = orders.filter(o => o.buyerId === currentUser.id);

  // My reviews received
  const myReviews = reviews.filter(r => r.sellerId === currentUser.id);
  const averageRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    const res = updateProfile(profileName, profilePhone, profilePic);
    if (res.success) {
      setProfileSuccess('Seu perfil foi reconfigurado com sucesso!');
      setTimeout(() => setProfileSuccess(''), 2000);
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecurityError('');

    if (newPasswordVal && newPasswordVal !== confirmPasswordVal) {
      setSecurityError('A nova senha e a confirmação não conferem!');
      return;
    }

    const res = updateCredentials(emailVal, currentPasswordVal, newPasswordVal);
    if (res.success) {
      setSecuritySuccess('Credenciais de login alteradas com sucesso!');
      setCurrentPasswordVal('');
      setNewPasswordVal('');
      setConfirmPasswordVal('');
      setTimeout(() => setSecuritySuccess(''), 3000);
    } else {
      setSecurityError(res.message);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber.trim() || !payProvider.trim() || !payHolder.trim()) {
      return;
    }
    addPaymentMethod({
      type: payType,
      provider: payProvider,
      number: payNumber,
      holderName: payHolder,
      expiry: payType === 'credit_card' ? payExpiry : undefined,
      isDefault: false
    });
    setPayNumber('');
    setPayProvider('');
    setPayHolder('');
    setPayExpiry('');
    setIsAddingPayment(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingProduct) return;
    if (!evalComment.trim()) {
      showAlert('Escreva um comentário sobre sua avaliação!', 'warning', 'Avaliação Incompleta');
      return;
    }

    addReview(evaluatingProduct.sellerId, evaluatingProduct.id, evaluatingProduct.name, evalRating, evalComment);
    setEvalSuccess('Sua avaliação foi enviada com sucesso! Obrigado.');
    setEvalComment('');
    setEvalRating(5);
    setTimeout(() => {
      setEvaluatingProduct(null);
      setEvalSuccess('');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden font-sans" id="seller-dashboard-wrapper">
      {/* Upper Brand Showcase */}
      <div className="bg-stone-900 border-b border-stone-850 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {currentUser.profilePicture ? (
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.name} 
              className="h-14 w-14 rounded-full object-cover border-2 border-emerald-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250 flex items-center justify-center font-bold text-lg uppercase">
              {currentUser.name.charAt(0)}
            </span>
          )}
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center justify-center sm:justify-start gap-2">
              {currentUser.name}
              <span className="px-2 py-0.5 bg-emerald-850/20 text-emerald-400 text-[10px] font-mono rounded uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Admin Geral' : currentUser.role === 'seller' ? 'Vendedor' : 'Cliente'}
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">Telefone comercial: {currentUser.phone || 'Sem número cadastrado'}</p>
          </div>
        </div>

        {/* Aggregate Ratings */}
        {averageRating && (
          <div className="flex items-center gap-2.5 bg-stone-850 py-2.5 px-4 rounded-xl border border-stone-800">
            <div className="flex text-amber-500">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white leading-none">{averageRating} / 5.0</p>
              <span className="text-[10px] text-stone-400 font-mono">Reputação ({myReviews.length} avaliações)</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs list bar */}
      <div className="flex overflow-x-auto border-b border-stone-100 px-4 gap-4" id="dashboard-tabbar">
        {isSellerOrAdmin && (
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'metrics' ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Métricas</span>
            {activeTab === 'metrics' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-750" />}
          </button>
        )}

        {isSellerOrAdmin && (
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'listings' ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Meus Anúncios ({myProducts.length})</span>
            {activeTab === 'listings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-750" />}
          </button>
        )}

        <button
          onClick={() => setActiveTab('purchases')}
          className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 flex-shrink-0 relative ${
            activeTab === 'purchases' ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Histórico Compras ({myPurchases.length})</span>
          {activeTab === 'purchases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-750" />}
        </button>

        {isSellerOrAdmin && (
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'sales' ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Histórico Vendas ({mySales.length})</span>
            {activeTab === 'sales' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-750" />}
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'profile' ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span>Gerenciar Perfil</span>
          {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-750" />}
        </button>
      </div>

      {/* Main Core Tab Content Frame */}
      <div className="p-6 sm:p-8" id="dashboard-active-stage">
        
        {/* TAB 1: METRIC DEALS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Performance metrics grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-605 font-mono uppercase font-bold block">Ganhos Totais</span>
                  <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
                    R$ {totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
                  <DollarSign className="h-5 w-5" />
                </span>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Peças Vendidas</span>
                  <span className="text-2xl font-bold text-stone-800 mt-1 block font-mono">
                    {soldProductsCount}
                  </span>
                </div>
                <span className="p-3 bg-white rounded-xl text-stone-605 shadow-sm">
                  <CheckCircle className="h-5 w-5" />
                </span>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Anúncios Ativos</span>
                  <span className="text-2xl font-bold text-stone-800 mt-1 block font-mono">
                    {activeListings.length}
                  </span>
                </div>
                <span className="p-3 bg-white rounded-xl text-stone-605 shadow-sm">
                  <Tag className="h-5 w-5" />
                </span>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Conversão</span>
                  <span className="text-2xl font-bold text-stone-800 mt-1 block font-mono">
                    {myProducts.length > 0 ? ((soldProductsCount / myProducts.length) * 10).toFixed(0) : '0'} / 10
                  </span>
                </div>
                <span className="p-3 bg-white rounded-xl text-stone-605 shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </span>
              </div>
            </div>

            {/* Performance charts illustration */}
            <div className="bg-stone-50/50 rounded-2xl border border-stone-100 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-stone-800 text-sm mb-4">Relatório Vendas Mensais (R$)</h3>
                
                {/* Simulated vertical chart bars */}
                <div className="h-44 flex items-end justify-between font-mono text-[10px] text-stone-400 pt-4 pb-2 border-b border-stone-200">
                  <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-stone-600 block mb-1">R$ 0</span>
                    <div className="w-10 bg-stone-200 rounded-t-md h-1" />
                    <span className="mt-2.5">Março 26</span>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-stone-600 block mb-1">R$ 180</span>
                    <div className="w-10 bg-emerald-800/10 rounded-t-md h-12" />
                    <span className="mt-2.5">Abril 26</span>
                  </div>

                  <div className="flex flex-col items-center flex-1 font-sans">
                    <span className="font-bold text-emerald-800 font-mono block mb-1">R$ {totalEarnings.toFixed(0)}</span>
                    <div className="w-10 bg-emerald-700 rounded-t-md h-24" />
                    <span className="mt-2.5 font-mono text-[10px] text-stone-400">Este Mês</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-stone-800 text-sm mb-4">Comentários e Clientes Recentes</h3>
                
                {myReviews.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-6">Você ainda não recebeu avaliações de compradores.</p>
                ) : (
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                    {myReviews.map(rev => (
                      <div key={rev.id} className="p-3 bg-white border border-stone-100 rounded-xl text-xs space-y-1.5 shadow-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-stone-700">{rev.evaluatorName}</span>
                          <span className="font-mono text-stone-400">{new Date(rev.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex text-amber-500 gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-stone-500 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* TAB 2: MY AD LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-2">
              <h3 className="font-semibold text-stone-850 text-sm">Seus anúncios na loja</h3>
              {onOpenAddProduct && (
                <button
                  type="button"
                  onClick={onOpenAddProduct}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Anúncio
                </button>
              )}
            </div>
            
            {myProducts.length === 0 ? (
              <div className="text-center py-16 border border-stone-100 border-dashed rounded-3xl text-stone-400">
                <Tag className="h-10 w-10 mx-auto text-stone-250 mb-3" />
                <p className="text-sm font-medium">Você não possui produtos anunciados</p>
                <p className="text-xs text-stone-300 mt-1 mb-4">Inscreva suas roupas e ganhe uma graninha extra.</p>
                {onOpenAddProduct && (
                  <button
                    type="button"
                    onClick={onOpenAddProduct}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Criar Primeiro Anúncio
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProducts.map(p => (
                  <div key={p.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 text-xs">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="h-20 w-20 rounded-xl object-cover border border-stone-200/50 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Status badge */}
                        <div className="flex gap-1.5 mb-1 items-center">
                          <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wide uppercase rounded font-bold ${
                            p.isSold 
                              ? 'bg-stone-200 text-stone-500' 
                              : p.isApproved 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-stone-100 text-stone-600'
                          }`}>
                            {p.isSold ? 'Vendido ✓' : p.isApproved ? 'Ativo na Loja' : 'Pendente de Moderação'}
                          </span>
                          <span className="text-[9px] text-stone-400 font-mono">{p.category}</span>
                        </div>
                        
                        <h4 className="font-bold text-stone-900 leading-tight truncate">{p.name}</h4>
                        <p className="text-[11px] font-mono text-stone-500 font-bold mt-1">
                          R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Controls inside seller view */}
                      {!p.isSold && (
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => onOpenEditProduct(p)}
                            className="p-2 bg-white text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 border border-stone-200 rounded-lg flex items-center gap-1 font-semibold transition-all"
                            title="Editar anúncio"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza de que deseja apagar permanentemente este anúncio?')) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-655 border border-red-100 rounded-lg flex items-center gap-1 font-medium transition-all"
                            title="Apagar anúncio"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* TAB 3: HISTORIC OF PURCHASES & REVIEWS */}
        {activeTab === 'purchases' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-stone-800 text-sm mb-2">Suas Compras Efetuadas</h3>

            {/* Simulated Reviews dialog box */}
            {evaluatingProduct && (
              <div className="bg-emerald-50/10 p-5 rounded-2xl border border-emerald-150/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> Avaliar Compra: {evaluatingProduct.name}
                  </h4>
                  <button 
                    onClick={() => setEvaluatingProduct(null)}
                    className="text-stone-400 hover:text-stone-700 text-xs"
                  >
                    Cancelar
                  </button>
                </div>

                {evalSuccess ? (
                  <p className="text-xs text-emerald-800 bg-emerald-50 py-2 px-4 rounded-lg font-medium">{evalSuccess}</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs text-stone-701">
                    <div>
                      <span className="block mb-1.5 font-bold">Quantas estrelas você daria para o vendedor?</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEvalRating(star)}
                            className="p-1 text-amber-500 transition-transform hover:scale-110"
                          >
                            <Star className={`h-6 w-6 ${evalRating >= star ? 'fill-current' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Comentário / Detalhes de Encontro</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Produto incrível, idêntico às fotos, cheiroso e vendedora fofa demais!"
                        required
                        value={evalComment}
                        onChange={(e) => setEvalComment(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-stone-900 text-white rounded-lg px-4 py-2 font-semibold hover:bg-stone-850"
                    >
                      Enviar Avaliação
                    </button>
                  </form>
                )}
              </div>
            )}

            {myPurchases.length === 0 ? (
              <div className="text-center py-16 border border-stone-100 rounded-3xl text-stone-400">
                <ShoppingBag className="h-10 w-10 mx-auto text-stone-250 mb-3" />
                <p className="text-sm font-medium">Você ainda não comprou no Brechó</p>
                <p className="text-xs text-stone-350 mt-1">Adicione itens na sacola para fechar compras sustentáveis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPurchases.map(ord => (
                  <div key={ord.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-100/80 text-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-stone-400">PEDIDO #{ord.id}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {ord.products.map(p => (
                          <div key={p.id} className="flex items-center gap-2 font-sans font-medium text-stone-800">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-700" />
                            <span>{p.name} (x{p.quantity})</span>
                            <span className="text-stone-450 text-[10px] font-mono">
                              - R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-stone-500">
                        Vendido por: <span className="font-bold">{ord.sellerName}</span>
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-2 text-right">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase block font-mono">Total Pago</span>
                        <span className="font-bold text-emerald-800 text-sm font-mono">
                          R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Order status tracking element badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-mono rounded font-medium ${
                          ord.status === 'Entregue' ? 'bg-emerald-50 text-emerald-700' :
                          ord.status === 'Enviado' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-605 border border-stone-200/50'
                        }`}>
                          📦 Status: {ord.status}
                        </span>

                        {/* Evaluate Seller Trigger */}
                        {ord.status === 'Entregue' && ord.products[0] && (
                          <button
                            onClick={() => setEvaluatingProduct({
                              id: ord.products[0].id,
                              sellerId: ord.sellerId,
                              name: ord.products[0].name
                            })}
                            className="bg-white text-stone-700 border border-stone-220 hover:bg-stone-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 font-semibold shadow-xs"
                          >
                            <Star className="h-3 w-3 fill-current text-amber-500" />
                            <span>Avaliar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* TAB 4: HISTORIC OF SALES AND SHIPPING MANAGER */}
        {activeTab === 'sales' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-stone-800 text-sm mb-2 font-sans">Suas Vendas Feitas</h3>
            
            {mySales.length === 0 ? (
              <div className="text-center py-16 border border-stone-100 rounded-3xl text-stone-400">
                <Truck className="h-10 w-10 mx-auto text-stone-250 mb-3" />
                <p className="text-sm font-medium">Nenhum faturamento por enquanto</p>
                <p className="text-xs text-stone-350 mt-1">Após compradores efetuarem transações elas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mySales.map(ord => (
                  <div key={ord.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-100 text-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-stone-400">VENDA #{ord.id}</span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {ord.products.map(p => (
                          <p key={p.id} className="font-semibold text-stone-800">
                            {p.name} (x{p.quantity}) - <span className="font-mono text-[11px] text-stone-500">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </p>
                        ))}
                      </div>

                      <p className="text-[11px] text-stone-500 font-medium">
                        Comprador: <span className="text-stone-800 font-bold">{ord.buyerName}</span>
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-3 text-right">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-mono block">Valor Líquido</span>
                        <span className="font-bold text-emerald-800 font-mono text-sm block">
                          R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Simulation trigger buttons */}
                        {ord.status === 'Aprovado' && (
                          <button
                            onClick={() => simulateChangeOrderStatus(ord.id, 'Enviado')}
                            className="bg-stone-900 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-stone-850 flex items-center gap-1.5 shadow-sm"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Despachar Peça (Enviar)</span>
                          </button>
                        )}

                        {ord.status === 'Enviado' && (
                          <button
                            onClick={() => simulateChangeOrderStatus(ord.id, 'Entregue')}
                            className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-emerald-550 flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                            <span>Marcar Entregue</span>
                          </button>
                        )}

                        <span className={`px-2 py-1 text-[10px] font-mono rounded font-bold ${
                          ord.status === 'Entregue' ? 'bg-emerald-50 text-emerald-700' :
                          ord.status === 'Enviado' ? 'bg-blue-50 text-blue-700' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* TAB 5: MANAGE PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-10 max-w-2xl mx-auto animate-fade-in" id="profile-management-full-view">
            
            {/* Seção 1: Dados do Perfil */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-5">
                <User className="h-5 w-5 text-emerald-700" />
                <h3 className="font-semibold text-stone-850 text-base">Dados Pessoais & Contato</h3>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileSuccess && (
                  <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl text-center font-medium">
                    ✨ {profileSuccess}
                  </div>
                )}

                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative">
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt="preview avatar" 
                        className="h-20 w-20 rounded-full object-cover border-2 border-stone-200" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="h-20 w-20 rounded-full bg-stone-105 text-stone-500 border border-stone-200 flex items-center justify-center font-bold text-lg uppercase">
                        {profileName.charAt(0) || 'U'}
                      </span>
                    )}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full transition cursor-pointer border-2 border-white">
                      <Camera className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 font-mono">Modifique o link abaixo para alterar foto do avatar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-701">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Nome de Exibição *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-stone-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">WhatsApp de Contato *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-stone-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="(11) 98765-4321"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">URL da Foto de Perfil</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-stone-400">
                        <Image className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={profilePic}
                        onChange={(e) => setProfilePic(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Salvar Dados Pessoais
                  </button>
                </div>
              </form>
            </div>

            {/* Seção 2: Credenciais de Logon (E-mail & Senha) */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-5">
                <Lock className="h-5 w-5 text-emerald-700" />
                <h3 className="font-semibold text-stone-850 text-base">E-mail & Senha de Acesso</h3>
              </div>

              <form onSubmit={handleSecuritySubmit} className="space-y-4">
                {securitySuccess && (
                  <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl text-center font-medium">
                    ✨ {securitySuccess}
                  </div>
                )}
                {securityError && (
                  <div className="py-2.5 px-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-shake">
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                <div className="text-xs text-stone-701 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">E-mail Cadastrado *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-stone-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <hr className="border-stone-100" />
                  <p className="text-[10px] text-stone-400 leading-normal font-medium">
                    🔒 Preencha os campos abaixo de senha se você deseja alterá-la. Caso mude somente o e-mail, pode deixá-los em branco.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Senha Atual</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-stone-400">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          value={currentPasswordVal}
                          onChange={(e) => setCurrentPasswordVal(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono"
                          placeholder="••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Nova Senha</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-stone-400">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          value={newPasswordVal}
                          onChange={(e) => setNewPasswordVal(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono"
                          placeholder="Senha nova"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Confirmar Senha</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-stone-400">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          value={confirmPasswordVal}
                          onChange={(e) => setConfirmPasswordVal(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono"
                          placeholder="Repita a nova"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-stone-850 hover:bg-stone-900 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Salvar Email & Senha
                  </button>
                </div>
              </form>
            </div>

            {/* Seção 3: Formas de Pagamento Salvas */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-semibold text-stone-850 text-base">Formas de Pagamento</h3>
                </div>
                {!isAddingPayment && (
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-stone-200 text-stone-600 hover:text-emerald-800 hover:border-emerald-600 text-xs font-semibold rounded-lg transition-all hover:bg-emerald-50/50 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </button>
                )}
              </div>

              {isAddingPayment ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-4 p-4 bg-stone-50/70 border border-stone-200/60 rounded-xl animate-scale-up">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-stone-400">Nova Forma de Pagamento</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingPayment(false)}
                      className="text-[10px] text-stone-400 hover:text-stone-701 font-mono hover:underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Tipo de Pagamento</label>
                      <select
                        value={payType}
                        onChange={(e) => {
                          const val = e.target.value as 'credit_card' | 'pix';
                          setPayType(val);
                          setPayProvider(val === 'credit_card' ? 'Visa' : 'Chave CPF');
                          setPayNumber('');
                        }}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800"
                      >
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="pix">Pix</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Bandeira / Tipo de Chave</label>
                      <input
                        type="text"
                        required
                        placeholder={payType === 'credit_card' ? 'Ex: Visa, MasterCard' : 'Ex: CPF, E-mail, Celular'}
                        value={payProvider}
                        onChange={(e) => setPayProvider(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none text-stone-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Número do Cartão ou Chave Pix</label>
                      <input
                        type="text"
                        required
                        placeholder={payType === 'credit_card' ? '4532 9876 1234 5678' : 'Ex: geminialvess@gmail.com'}
                        value={payNumber}
                        onChange={(e) => setPayNumber(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none font-mono text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Nome do Titular</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Geminiana Alves"
                        value={payHolder}
                        onChange={(e) => setPayHolder(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none text-stone-900"
                      />
                    </div>

                    {payType === 'credit_card' && (
                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 mb-1">Vencimento (MM/AA)</label>
                        <input
                          type="text"
                          required
                          placeholder="12/29"
                          value={payExpiry}
                          onChange={(e) => setPayExpiry(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none font-mono text-stone-900"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPayment(false)}
                      className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                    >
                      Gravar Conta
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Lista de formas de pagamento */}
              <div className="space-y-4 mt-4">
                {paymentMethods.filter(pm => pm.userId === currentUser.id).length === 0 ? (
                  <p className="text-stone-400 text-xs text-center py-6 font-mono">Nenhuma forma de pagamento registrada ainda nesta conta.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.filter(pm => pm.userId === currentUser.id).map(pm => (
                      <div 
                        key={pm.id} 
                        className={`p-4 rounded-xl border relative flex flex-col justify-between transition-all ${
                          pm.isDefault 
                            ? 'border-emerald-600/80 bg-emerald-50/10 shadow-xs' 
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 capitalize font-mono">
                              {pm.type === 'credit_card' ? (
                                <>💳 Cartão</>
                              ) : (
                                <>⚡ Pix</>
                              )}
                            </span>
                            {pm.isDefault && (
                              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 font-bold uppercase select-none">
                                <Check className="h-3.5 w-3.5" /> Padrão
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-stone-900 text-sm truncate">{pm.provider}</p>
                          <p className="text-xs font-mono text-stone-500 mt-1">{pm.number}</p>
                          <p className="text-[10px] text-stone-400 mt-2 font-medium">Titular: {pm.holderName}</p>
                          {pm.expiry && <p className="text-[10px] text-stone-400 font-mono">Vence: {pm.expiry}</p>}
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-stone-100">
                          {!pm.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultPaymentMethod(pm.id)}
                              className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                            >
                              Tornar Padrão
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePaymentMethod(pm.id)}
                            className="text-[10px] text-stone-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
