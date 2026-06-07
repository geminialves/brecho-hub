import React, { useState, useEffect } from 'react';
import { useBrecho } from '../BrechoContext';
import { Product, ProductCategory, ProductCondition } from '../types';
import { X, Upload, Plus, Trash2, Tag, AlertTriangle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES: ProductCategory[] = ['Feminino', 'Masculino', 'Calçados', 'Acessórios', 'Infantil', 'Outros'];
const CONDITIONS: ProductCondition[] = ['Novo com etiqueta', 'Novo sem etiqueta', 'Gentilmente usado', 'Usado com marcas de uso'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { createProduct, updateProduct } = useBrecho();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Feminino');
  const [description, setDescription] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('Gentilmente usado');
  
  // Image URL strings + local base64 lists
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setPriceStr(productToEdit.price.toString());
      setCondition(productToEdit.condition);
      setImages(productToEdit.images);
    } else {
      setName('');
      setCategory('Feminino');
      setDescription('');
      setPriceStr('');
      setCondition('Gentilmente usado');
      setImages([]);
    }
    setError('');
    setSuccess('');
    setImageUrlInput('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Process manual image URL submission
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http://') && !imageUrlInput.startsWith('https://') && !imageUrlInput.startsWith('data:image')) {
      setError('Insira uma URL de imagem válida (começando com http/https ou base64).');
      return;
    }
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Process File upload and convert to base64
  const processFiles = (files: FileList) => {
    setError('');
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
    
    Array.from(files).forEach(file => {
      if (!validExtensions.includes(file.type)) {
        setError('Apenas imagens nos formatos JPG e PNG são permitidas.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }
    if (!description.trim()) {
      setError('Insira uma breve descrição para informar os compradores.');
      return;
    }
    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Informe um preço válido e maior que zero.');
      return;
    }

    if (images.length === 0) {
      setError('Adicione pelo menos uma foto do seu desapego para cadastrar.');
      return;
    }

    if (productToEdit) {
      const res = updateProduct(productToEdit.id, name, category, description, priceNum, condition, images);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message);
      }
    } else {
      const res = createProduct(name, category, description, priceNum, condition, images);
      if (res.success) {
        setSuccess(res.message);
        // Clean fields
        setName('');
        setDescription('');
        setPriceStr('');
        setImages([]);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="product-form-container">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-stone-100 shadow-2xl p-6 sm:p-8 overflow-hidden z-10 animate-scale-up">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 hover:border-emerald-700/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200/50">
                <Tag className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {productToEdit ? 'Editar Anúncio' : 'Anunciar Desapego'}
                </h2>
                <p className="text-xs text-stone-400">Preencha as informações do desapego para disponibilizar na loja</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-5 py-3 px-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 py-3 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              ✨ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" id="product-form">
            
            {/* Split layout: Text fields & Image uploading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Side: General metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Camisa Linho Zara Bege"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">Categoria *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-700"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="89.90"
                      value={priceStr}
                      onChange={(e) => setPriceStr(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">Estado de Conservação *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-700"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">Descrição Completa *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Conte sobre caimento, medidas, defeitos se houver e a história da sua peça..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-700 leading-relaxed"
                  />
                </div>
              </div>


              {/* Right Side: Image Management Area */}
              <div className="space-y-4">
                
                {/* File Drop Stage */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-bold">
                    Fotos do Produto *
                  </label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
                      dragActive 
                        ? 'border-emerald-700 bg-emerald-50/20' 
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <Upload className="h-7 w-7 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-stone-700">Arrastar imagens aqui</p>
                    <p className="text-[10px] text-stone-400 mt-1 uppercase font-mono">Formatos: JPG ou PNG</p>
                    
                    <label className="mt-3.5 inline-block bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer shadow-sm">
                      Selecionar Arquivos
                      <input 
                        type="file" 
                        multiple 
                        accept=".png,.jpg,.jpeg" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Submitting custom URL directly */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">
                    Ou adicione por link URL de imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/your-image..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-stone-900 hover:bg-stone-850 text-white rounded-lg px-3.5 py-1.5 text-xs font-mono"
                    >
                      Ok
                    </button>
                  </div>
                </div>

                {/* Live Images previews scroll field */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-600 block">
                    Fotos Adicionadas ({images.length})
                  </span>
                  
                  {images.length === 0 ? (
                    <div className="border border-stone-100 rounded-xl py-6 text-center text-xs text-stone-400 italic">
                      Nenhuma imagem anexada.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-stone-50 rounded-xl">
                      {images.map((img, index) => (
                        <div key={index} className="relative group/img aspect-square rounded-lg overflow-hidden border border-stone-200">
                          <img src={img} alt="review" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute inset-0 bg-red-600/70 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                            title="Remover foto"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer triggers */}
            <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-5 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-medium rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-full shadow-xs hover:shadow transition-colors"
                id="btn-submit-listing"
              >
                {productToEdit ? 'Salvar Alterações' : 'Publicar Produto'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
