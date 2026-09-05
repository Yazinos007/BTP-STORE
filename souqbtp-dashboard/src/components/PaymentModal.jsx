import React, { useState } from 'react';
import { X, Building2, Wallet, CreditCard, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentModal({ plan, onClose, onSubmit }) {
  const [method, setMethod] = useState('virement'); // 'virement' or 'cash'
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Veuillez télécharger le reçu de paiement.');
      return;
    }
    setIsSubmitting(true);
    // استدعاء دالة الرفع التي ستمررها من الصفحة الرئيسية
    await onSubmit(plan, method, file);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all" dir="ltr">
      <div className="bg-[#12141c] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Validation du Paiement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Plan Info */}
          <div className="flex justify-between items-center bg-[#1a1d27] p-4 rounded-xl border border-white/5">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Plan sélectionné</p>
              <h3 className="text-xl font-black text-white">{plan.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 font-medium mb-1">Total à payer</p>
              <h3 className="text-2xl font-black text-emerald-400">{plan.price} MAD</h3>
            </div>
          </div>

          {/* Payment Methods Tabs */}
          <div>
            <h4 className="text-white font-medium mb-4">Choisissez votre méthode de paiement :</h4>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setMethod('virement')}
                className={`p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${method === 'virement' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 bg-[#1a1d27] text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Building2 size={24} />
                <span className="font-semibold text-sm">Virement Bancaire</span>
              </button>
              
              <button 
                onClick={() => setMethod('cash')}
                className={`p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${method === 'cash' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-[#1a1d27] text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Wallet size={24} />
                <span className="font-semibold text-sm">Cash Plus / Wafacash</span>
              </button>

              <button disabled className="p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/5 bg-[#1a1d27]/50 text-slate-600 opacity-50 cursor-not-allowed relative overflow-hidden">
                <span className="absolute top-2 right-2 bg-white/10 text-[10px] px-2 py-0.5 rounded text-slate-400 uppercase font-bold">Bientôt</span>
                <CreditCard size={24} />
                <span className="font-semibold text-sm">Carte Bancaire</span>
              </button>
            </div>
          </div>

          {/* Payment Details Content */}
          <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
            {method === 'virement' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-sm text-slate-400">Veuillez effectuer un virement vers le compte professionnel suivant :</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Bénéficiaire</p>
                    <p className="text-white font-bold">BACHIR YASSINE</p>
                  </div>
                  <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">ICE</p>
                    <p className="text-white font-bold tracking-widest">003460220000095</p>
                  </div>
                </div>
                <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">RIB</p>
                  <p className="text-emerald-400 font-mono font-bold text-lg tracking-wider mb-1">225 104 0447028246010126 97</p>
                  <p className="text-xs text-slate-500">Banque: CREDIT AGRICOLE DU MAROC</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-sm text-slate-400">Veuillez effectuer un transfert via Cash Plus ou Wafacash à :</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Nom Complet</p>
                    <p className="text-white font-bold">BACHIR Yassine</p>
                  </div>
                  <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">N° CIN</p>
                    <p className="text-white font-bold tracking-widest">IA83571</p>
                  </div>
                </div>
                <div className="bg-[#12141c] p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Téléphone</p>
                  <p className="text-amber-400 font-mono font-bold text-lg tracking-widest">07 00 71 53 99</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors rounded-2xl p-6 text-center bg-[#1a1d27]/50 group relative">
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            
            {file ? (
              <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 size={40} className="mb-2" />
                <p className="font-bold">{file.name}</p>
                <p className="text-xs text-slate-400">Cliquez pour modifier le fichier</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-white transition-colors group-hover:scale-110">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Télécharger le reçu</h4>
                  <p className="text-sm text-slate-400">Photo ou scan du reçu (JPG, PNG, PDF)</p>
                </div>
                <button className="mt-2 px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors pointer-events-none">
                  Choisir un fichier
                </button>
              </div>
            )}
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Traitement en cours...</>
            ) : (
              'Confirmer le paiement'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}