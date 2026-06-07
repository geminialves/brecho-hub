import React, { useState } from 'react';
import { useBrecho } from '../BrechoContext';
import { X, Lock, Mail, Phone, User, CheckCircle, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'recover';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, registerUser, recoverPassword } = useBrecho();
  const [mode, setMode] = useState<AuthMode>('login');

  // Fields and Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const resetFields = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetFields();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('Preencha todos os campos para prosseguir!');
        return;
      }
      const res = loginUser(email, password);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onClose();
          resetFields();
        }, 1200);
      } else {
        setError(res.message);
      }
    } else if (mode === 'register') {
      if (!name || !email || !phone || !password) {
        setError('Por favor preencha todos os campos obrigatórios!');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não batem.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve conter no mínimo 6 caracteres.');
        return;
      }

      const res = registerUser(name, email, phone, password);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          // Send user back to login
          setMode('login');
          resetFields();
          setSuccess('Excelente! Faça logon com as suas credenciais recém registradas.');
        }, 1500);
      } else {
        setError(res.message);
      }
    } else if (mode === 'recover') {
      if (!email) {
        setError('Insira o seu e-mail cadastrado.');
        return;
      }
      const res = recoverPassword(email);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-container">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Main core card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-100 shadow-2xl p-6 sm:p-8 overflow-hidden z-20 animate-scale-up">
        
        {/* Close absolute */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-full transition"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Switching toggles */}
        {mode !== 'recover' && (
          <div className="flex border-b border-stone-100 mb-6 gap-2">
            <button
              onClick={() => handleModeChange('login')}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                mode === 'login' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              onClick={() => handleModeChange('register')}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                mode === 'register' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Brand identity area for recovery status */}
        {mode === 'recover' && (
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-stone-900">Recuperar Minha Senha</h3>
            <p className="text-xs text-stone-400 mt-1">Informe seu e-mail cadastrado para obter uma chave provisória</p>
          </div>
        )}

        {/* Alerts Feedback */}
        {error && (
          <div className="mb-4 py-2.5 px-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 py-2.5 px-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono mb-1">Nome Completo *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-700 font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono mb-1">E-mail de Acesso *</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono mb-1">Telefone / WhatsApp *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-700 font-mono"
                />
              </div>
            </div>
          )}

          {mode !== 'recover' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono">Senha de Acesso *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeChange('recover')}
                    className="text-[10px] uppercase font-bold text-emerald-700 hover:underline tracking-tight"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-700"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono mb-1">Confirmar Senha *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-700"
                />
              </div>
            </div>
          )}

          {/* Form Trigger submissions */}
          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition-all shadow-xs hover:shadow-sm mt-4 text-sm"
            id="btn-auth-submit"
          >
            {mode === 'login' ? 'Entrar na Conta' : mode === 'register' ? 'Completar Cadastro' : 'Enviar Redefinição'}
          </button>

          {/* Fallback to swap forms */}
          {mode === 'recover' && (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="w-full text-center text-xs text-stone-550 hover:text-stone-900 mt-2 hover:underline"
            >
              Voltar ao Login
            </button>
          )}

          {/* Prompt accounts info for preview debugging */}
          <div className="mt-6 border-t border-stone-100 pt-4 text-[10.5px] text-stone-400 leading-relaxed font-mono">
            <span className="font-bold text-emerald-805 uppercase block mb-1">Contas para Testes Rápidos:</span>
            <p>🔑 Cliente: <span className="text-stone-700">felipe@cliente.com</span> | Senha: <span className="text-stone-700">123</span></p>
            <p>🔑 Vendedor: <span className="text-stone-700">mari@vendedor.com</span> | Senha: <span className="text-stone-700">123</span></p>
            <p>🔑 Admin: <span className="text-stone-700">admin@brecho.com</span> | Senha: <span className="text-stone-700">admin</span></p>
          </div>

        </form>

      </div>
    </div>
  );
};
