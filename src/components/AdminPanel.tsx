import React, { useState } from 'react';
import { useBrecho } from '../BrechoContext';
import { 
  Users, Tag, ShieldCheck, DollarSign, CheckCircle, AlertTriangle, 
  Trash2, Eye, Ban, CheckSquare, Heart, RefreshCw, BarChart2
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminTab = 'submissions' | 'users' | 'reports';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { 
    users, products, orders, adminApproveProduct, adminRemoveProduct, 
    adminToggleBlockUser 
  } = useBrecho();

  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');

  // Filter products waiting for approval
  const pendingProducts = products.filter(p => !p.isApproved);
  const approvedCount = products.filter(p => p.isApproved && !p.isSold).length;

  // Calculte Report metrics
  const totalUsers = users.length;
  const completedOrders = orders.filter(o => o.status !== 'Cancelado');
  const totalVolume = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const platformComission = totalVolume * 0.10; // Simulated 10% platform fee from each transaction

  // Category sales share
  const productSalesMap: { [cat: string]: number } = {};
  completedOrders.forEach(o => {
    o.products.forEach(p => {
      // Find category of matching product in db if possible
      const originalProduct = products.find(prod => prod.id === p.id);
      const cat = originalProduct?.category || 'Outros';
      productSalesMap[cat] = (productSalesMap[cat] || 0) + p.price * p.quantity;
    });
  });

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden font-sans" id="admin-panel-wrapper">
      
      {/* Admin header */}
      <div className="bg-emerald-800 p-6 sm:p-8 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-950 rounded-xl text-emerald-350 border border-emerald-800">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Painel do Administrador</h2>
            <p className="text-xs text-emerald-200 mt-0.5">Gerenciamento, moderação e relatórios transacionais do Brechó</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-white/80 hover:text-white border border-white/20 hover:border-white/40 py-1.5 px-3 rounded-lg bg-emerald-950/20"
        >
          Voltar à Loja
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-stone-100 bg-stone-50/50 px-4 gap-4" id="admin-tabbar">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 ${
            activeTab === 'submissions' ? 'text-emerald-700' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Moderação de Peças ({pendingProducts.length})</span>
          {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700" />}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 ${
            activeTab === 'users' ? 'text-emerald-700' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuários ({totalUsers})</span>
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700" />}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-4 px-2 text-xs uppercase font-bold tracking-wider relative flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'text-emerald-700' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Relatórios Gerais</span>
          {activeTab === 'reports' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700" />}
        </button>
      </div>

      {/* Main core content frame */}
      <div className="p-6 sm:p-8" id="admin-active-stage">
        
        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-stone-800 text-sm mb-2">Aprovação de Produtos Cadastrados</h3>

            {pendingProducts.length === 0 ? (
              <div className="text-center py-16 border border-stone-100 border-dashed rounded-3xl text-stone-400 bg-stone-50/20">
                <CheckCircle className="h-10 w-10 mx-auto text-emerald-450 mb-3" />
                <p className="text-sm font-medium">Tudo limpo por aqui!</p>
                <p className="text-xs text-stone-350 mt-1">Nenhum produto pendente de aprovação aguardando moderação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map(p => (
                  <div key={p.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-100 text-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <img 
                        src={p.images[0]} 
                        alt="pord" 
                        className="h-20 w-20 rounded-xl object-cover border border-stone-200/50 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded">
                          {p.condition}
                        </span>
                        
                        <h4 className="font-bold text-stone-900 leading-tight text-sm mt-1">{p.name}</h4>
                        <p className="text-stone-450 text-[11px] leading-relaxed line-clamp-2 max-w-md">{p.description}</p>
                        
                        <p className="text-[10px] text-stone-400 mt-1.5 font-medium">
                          Vendedor: <span className="text-stone-600 font-bold">{p.sellerName}</span> | Categoria: {p.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-3 text-right">
                      <div>
                        <span className="text-[10px] text-stone-440 uppercase block font-mono">Preço Sugerido</span>
                        <span className="font-bold text-emerald-800 font-mono text-base block">
                          R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Approving actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => adminApproveProduct(p.id)}
                          className="bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg px-3 py-1.5 font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Aprovar</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('Deseja realmente recusar e apagar este anúncio do brechó?')) {
                              adminRemoveProduct(p.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg px-3 py-1.5 font-semibold text-xs inline-flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Recusar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* USERS MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-stone-800 text-sm mb-2">Usuários Cadastrados na plataforma</h3>

            <div className="overflow-x-auto border border-stone-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 font-mono text-[10px] uppercase text-stone-500">
                    <th className="p-4 font-bold">Usuário</th>
                    <th className="p-4 font-bold">E-mail</th>
                    <th className="p-4 font-bold">WhatsApp / Cell</th>
                    <th className="p-4 font-bold">Cargo</th>
                    <th className="p-4 font-bold">Registrado em</th>
                    <th className="p-4 font-bold text-right">Controles Políticos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {users.map(u => (
                    <tr key={u.id} className={`hover:bg-stone-50/50 transition-colors ${u.isBlocked ? 'bg-red-50/20 italic text-stone-400' : ''}`}>
                      <td className="p-4 flex items-center gap-2.5">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="av" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="h-7 w-7 bg-emerald-50 text-emerald-850 font-bold rounded-full flex items-center justify-center uppercase text-[10px]">
                            {u.name.charAt(0)}
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-stone-900">{u.name}</p>
                          {u.isBlocked && <span className="text-[9px] text-red-550 uppercase font-mono font-bold tracking-tight">Bloqueado</span>}
                        </div>
                      </td>
                      <td className="p-4 font-mono">{u.email}</td>
                      <td className="p-4 font-mono">{u.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider font-semibold ${
                          u.role === 'admin' ? 'bg-amber-105 text-amber-800 border border-amber-200' :
                          u.role === 'seller' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                          'bg-stone-100 text-stone-605 border border-stone-200/40'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : u.role === 'seller' ? 'Vendedor' : u.role === 'client' ? 'Cliente' : u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px]">
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => {
                              const message = u.isBlocked 
                                ? `Deseja realmente reativar a conta de ${u.name}?` 
                                : `Deseja bloquear permanentemente a conta de ${u.name}? Ele não poderá mais logar na aplicação.`;
                              if (confirm(message)) {
                                adminToggleBlockUser(u.id);
                              }
                            }}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-lg inline-flex items-center gap-1 ${
                              u.isBlocked 
                                ? 'bg-emerald-600 hover:bg-emerald-550 text-white shadow-xs' 
                                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-105'
                            }`}
                          >
                            <Ban className="h-3 w-3" />
                            <span>{u.isBlocked ? 'Reativar' : 'Bloquear'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-mono italic">Imunidade</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* REPORTS AND METRICS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {/* Global aggregate indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Usuários Registrados</span>
                  <p className="text-2xl font-bold font-mono text-stone-800 mt-1 block">{totalUsers}</p>
                </div>
                <Users className="h-5 w-5 text-stone-500" />
              </div>

              <div className="bg-stone-50 border border-stone-105 p-5 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Anúncios Ativos</span>
                  <p className="text-2xl font-bold font-mono text-stone-800 mt-1 block">{approvedCount}</p>
                </div>
                <Tag className="h-5 w-5 text-stone-500" />
              </div>

              <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Volume Transacionado</span>
                  <p className="text-2xl font-bold font-mono text-stone-800 mt-1 block">R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="h-5 w-5 text-stone-500" />
              </div>

              <div className="bg-emerald-50/45 border border-emerald-100 p-5 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono uppercase font-bold block">Comissão Arrecadada (10%)</span>
                  <p className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">R$ {platformComission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-850" />
              </div>

            </div>

            {/* Simulated graph or list of categorical share */}
            <div className="bg-stone-50/50 rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-850 text-sm mb-4">Vendas por Categoria de Vestuário</h3>

              <div className="space-y-3 font-mono text-[11px]">
                {['Feminino', 'Masculino', 'Calçados', 'Acessórios', 'Infantil', 'Outros'].map(cat => {
                  const val = productSalesMap[cat] || 0;
                  const ratio = totalVolume > 0 ? (val / totalVolume) * 100 : 0;
                  
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between font-sans">
                        <span className="font-bold text-stone-700">{cat}</span>
                        <span className="font-mono text-xs font-semibold text-stone-550">
                          R$ {val.toFixed(2)} ({ratio.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-stone-150 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${ratio || 2}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
