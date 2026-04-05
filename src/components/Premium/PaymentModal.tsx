import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, CreditCard, MessageCircle, Copy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import * as API from '../../api/googleAPI';
import { useToast } from '../Toast';

interface PaymentModalProps {
  onClose: () => void;
}

export function PaymentModal({ onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<'wero' | 'momo' | 'om'>('wero');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { setPremium } = useAuthStore();
  const { showToast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copié dans le presse-papier !', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      showToast('Veuillez entrer une référence de transaction', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await API.submitPayment(method, transactionId);
      if (res.success) {
        setSuccess(true);
        // Force upgrade local
        await setPremium(true);
        setTimeout(() => onClose(), 3000);
      } else {
        showToast(res.error || 'Erreur lors de la validation', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌟</span> Devenir Premium
          </h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Paiement confirmé !</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Félicitations, vous êtes désormais Premium.<br />Redirection en cours...</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Choisissez votre moyen de paiement pour débloquer l'accès complet (10€ ou 6500 FCFA / an).
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button 
                type="button"
                onClick={() => setMethod('wero')}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${method === 'wero' ? 'var(--primary)' : 'var(--border)'}`, 
                  background: method === 'wero' ? 'var(--primary-light)' : 'var(--surface)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}
              >
                <CreditCard size={20} color={method === 'wero' ? 'var(--primary)' : 'var(--text-muted)'} />
                Wero (10€)
              </button>
              <button 
                type="button"
                onClick={() => setMethod('momo')}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${method === 'momo' ? '#ffcc00' : 'var(--border)'}`, 
                  background: method === 'momo' ? 'rgba(255, 204, 0, 0.1)' : 'var(--surface)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}
              >
                <Smartphone size={20} color={method === 'momo' ? '#e6b800' : 'var(--text-muted)'} />
                MoMo
              </button>
              <button 
                type="button"
                onClick={() => setMethod('om')}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${method === 'om' ? '#ff6600' : 'var(--border)'}`, 
                  background: method === 'om' ? 'rgba(255, 102, 0, 0.1)' : 'var(--surface)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}
              >
                <Smartphone size={20} color={method === 'om' ? '#ff6600' : 'var(--text-muted)'} />
                OM
              </button>
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: '24px', background: 'var(--bg-secondary)', border: 'none' }}>
              {method === 'wero' ? (
                <>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Paiement par Wero</h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Envoyez exactement <strong>10€</strong> au numéro ci-dessous :</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>+33 6 14 98 44 44</span>
                    <button type="button" className="btn-icon btn-ghost" onClick={() => handleCopy('+33614984444')}><Copy size={16} /></button>
                  </div>
                </>
              ) : (
                <>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px', color: method === 'momo' ? '#e6b800' : '#ff6600' }}>
                    Paiement par {method === 'momo' ? 'MTN Mobile Money' : 'Orange Money'}
                  </h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Le tarif est de <strong>6500 FCFA</strong>.</p>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <MessageCircle color="#25D366" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      Veuillez contacter le <strong>+33 6 14 98 44 44</strong> sur WhatsApp pour obtenir le compte de dépôt final.
                    </div>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label>Référence (ID de Transaction ou votre Numéro)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder={method === 'wero' ? "ex: Référence Wero ou Info expéditeur" : "ex: ID de la transaction SMS..."} 
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                {isSubmitting ? 'Vérification...' : 'Valider mon paiement'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
