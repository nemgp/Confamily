import { Link } from 'react-router-dom';
import { TreePine, MessageCircle, Shield, Users, Share2, Smartphone, ChevronRight, Heart } from 'lucide-react';

const features = [
  { icon: TreePine, title: 'Arbre Interactif', desc: 'Visualisez et explorez votre arbre généalogique avec zoom, drag et fiches détaillées.' },
  { icon: MessageCircle, title: 'Messagerie Familiale', desc: 'Discutez en privé ou en groupe de branche. Restez connecté avec toute la famille.' },
  { icon: Shield, title: 'Données Sécurisées', desc: 'Vos données familiales sont cryptées et restent strictement privées.' },
  { icon: Users, title: 'Groupes Automatiques', desc: 'Des groupes de discussion créés automatiquement selon les branches de votre arbre.' },
  { icon: Share2, title: 'Invitations WhatsApp', desc: 'Invitez vos proches en un clic via WhatsApp pour qu\'ils complètent leurs branches.' },
  { icon: Smartphone, title: 'Mobile First', desc: 'Interface optimisée pour tous les écrans. Accessible même pour les aînés.' }
];

const stats = [
  { value: '100%', label: 'Gratuit' },
  { value: '∞', label: 'Membres' },
  { value: '🔒', label: 'Sécurisé' },
  { value: '🌍', label: 'Diaspora' }
];

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(250,247,242,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>C</div>
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)' }}>Confamily</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Commencer</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', padding: '140px 5% 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(217,119,54,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(232,168,124,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="animate-slide" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="badge badge-primary" style={{ marginBottom: '20px' }}>🌳 Le pont numérique entre les générations</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Ne perdez plus jamais<br />
            <span style={{ background: 'linear-gradient(135deg, #d97736, #e8a87c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>le fil de votre histoire</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Confamily combine un arbre généalogique interactif et une messagerie moderne pour reconnecter les familles africaines et leur diaspora.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Créer mon arbre <ChevronRight size={20} />
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">Découvrir</a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '60px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} className="animate-fade" style={{ animationDelay: `${i * 0.1}s`, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 5%', background: 'var(--bg-secondary)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Tout pour votre famille</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '500px', margin: '0 auto 50px' }}>Des outils pensés pour reconnecter les générations</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <f.icon size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 'var(--radius-xl)', padding: '60px 40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Prêt à reconnecter votre famille ?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px' }}>Commencez gratuitement et invitez vos proches en quelques clics.</p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
            Commencer gratuitement <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 5%', borderTop: '1px solid var(--border-light)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          Fait avec <Heart size={14} color="var(--primary)" /> par Confamily — Connect Family © 2026
        </div>
      </footer>
    </div>
  );
}
