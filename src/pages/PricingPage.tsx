import { Check, Crown, TreePine, Lock, Printer, X, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    badge: '',
    features: [
      { text: "Jusqu'à 50 membres", ok: true },
      { text: 'Messagerie illimitée', ok: true },
      { text: 'Groupes de branches', ok: true },
      { text: 'Invitations WhatsApp', ok: true },
      { text: 'Coffre-fort numérique', ok: false },
      { text: "Impression de l'arbre", ok: false },
      { text: 'Support prioritaire', ok: false },
    ],
    cta: 'Plan actuel',
    highlight: false,
    isCurrent: true,
  },
  {
    name: 'Famille XL',
    price: '4.99',
    period: '/mois',
    badge: 'Populaire',
    features: [
      { text: 'Membres illimités', ok: true },
      { text: 'Messagerie illimitée', ok: true },
      { text: 'Groupes de branches', ok: true },
      { text: 'Invitations WhatsApp', ok: true },
      { text: 'Coffre-fort numérique (10 Go)', ok: true },
      { text: "Impression HD de l'arbre", ok: true },
      { text: 'Support prioritaire', ok: true },
    ],
    cta: 'Passer en Premium',
    highlight: true,
    isCurrent: false,
  }
];

export function PricingPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <span className="badge badge-premium" style={{ marginBottom: '16px' }}><Crown size={12} /> Premium</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Famille XL — Plus de place pour votre histoire</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
        Passez au plan Premium pour débloquer le coffre-fort numérique, l'impression d'arbre et les membres illimités.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {plans.map((p, i) => (
          <div key={i} className="card" style={{
            padding: '32px', position: 'relative',
            border: p.highlight ? '2px solid var(--primary)' : '1px solid var(--border-light)',
            boxShadow: p.highlight ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
            opacity: p.isCurrent ? 0.8 : 1,
          }}>
            {p.badge && <span className="badge badge-primary" style={{ position: 'absolute', top: '-12px', right: '20px' }}>{p.badge}</span>}
            {p.isCurrent && <span className="badge badge-success" style={{ position: 'absolute', top: '-12px', left: '20px' }}>Plan actuel</span>}
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>{p.name}</h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{p.price}€</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.period}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: f.ok ? 'var(--text)' : 'var(--text-muted)' }}>
                  {f.ok ? <Check size={16} color="var(--success)" /> : <X size={16} />}
                  <span style={{ fontSize: '0.9rem' }}>{f.text}</span>
                </div>
              ))}
            </div>
            {p.isCurrent ? (
              <button className="btn btn-block btn-ghost" disabled style={{ opacity: 0.5, cursor: 'not-allowed', border: '2px solid var(--border)' }}>
                <Check size={16} /> Plan actuel
              </button>
            ) : (
              <button className="btn btn-block btn-primary">
                <Sparkles size={16} /> {p.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} /> Paiement sécurisé</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TreePine size={14} /> Annulation à tout moment</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Printer size={14} /> Export illimité</span>
      </div>
    </div>
  );
}
