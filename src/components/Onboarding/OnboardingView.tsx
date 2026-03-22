import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronRight, TreePine, MessageCircle, Share2, Check } from 'lucide-react';

const steps = [
  { title: 'Votre profil', subtitle: 'Commençons par vous' },
  { title: 'Vos parents', subtitle: 'Ajoutez vos parents à l\'arbre' },
  { title: 'Invitations', subtitle: 'Invitez votre famille' },
];

export function OnboardingView() {
  const [step, setStep] = useState(0);
  const [parentName1, setParentName1] = useState('');
  const [parentName2, setParentName2] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const inviteLink = window.location.origin + window.location.pathname + '#/register';
  const shareWhatsApp = () => {
    const msg = `🌳 ${user?.name || 'Un proche'} vous invite à rejoindre l'arbre familial sur Confamily ! Inscrivez-vous : ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div className="card card-elevated animate-slide" style={{ width: '100%', maxWidth: '520px', padding: '40px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= step ? 'var(--primary)' : 'var(--border)', transition: 'var(--transition)' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '6px' }}>{steps[step].title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{steps[step].subtitle}</p>
        </div>

        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div className="avatar avatar-xl" style={{ margin: '0 auto 20px' }}>{user?.name?.charAt(0) || '?'}</div>
            <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{user?.name || 'Utilisateur'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}><Check size={16} /> <span style={{ fontSize: '0.9rem' }}>Compte créé</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}><TreePine size={16} /> <span style={{ fontSize: '0.9rem' }}>Arbre initialisé</span></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label>Nom du père</label>
              <input className="input" value={parentName1} onChange={e => setParentName1(e.target.value)} placeholder="Prénom Nom" />
            </div>
            <div className="input-group">
              <label>Nom de la mère</label>
              <input className="input" value={parentName2} onChange={e => setParentName2(e.target.value)} placeholder="Prénom Nom" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Vous pourrez ajouter plus de détails plus tard depuis l'arbre.
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>
              Invitez vos proches vivants via WhatsApp pour qu'ils rejoignent l'arbre et complètent leurs branches.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={shareWhatsApp}>📱 Inviter via WhatsApp</button>
              <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Lien copié !'); }}>📋 Copier le lien</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          {step > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>Retour</button> : <div />}
          <button className="btn btn-primary btn-sm" onClick={() => step < 2 ? setStep(step + 1) : navigate('/dashboard')}>
            {step === 2 ? 'Accéder à mon arbre' : 'Continuer'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
