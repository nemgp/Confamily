import { Link } from 'react-router-dom';
import { TreePine, MessageCircle, Shield, Users, Share2, Smartphone, ChevronRight, Heart, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const features = [
  { icon: TreePine, title: 'Arbre Interactif', desc: 'Visualisez et explorez votre arbre généalogique avec zoom, drag et fiches détaillées.', color: '#d97736' },
  { icon: MessageCircle, title: 'Messagerie Familiale', desc: 'Discutez en privé ou en groupe de branche. Restez connecté avec toute la famille.', color: '#3498db' },
  { icon: Shield, title: 'Données Sécurisées', desc: 'Vos données familiales sont cryptées et restent strictement privées.', color: '#27ae60' },
  { icon: Users, title: 'Groupes Automatiques', desc: 'Des groupes de discussion créés automatiquement selon les branches de votre arbre.', color: '#9b59b6' },
  { icon: Share2, title: 'Invitations WhatsApp', desc: 'Invitez vos proches en un clic via WhatsApp pour qu\'ils complètent leurs branches.', color: '#25D366' },
  { icon: Smartphone, title: 'Mobile First', desc: 'Interface optimisée pour tous les écrans. Accessible même pour les aînés.', color: '#e74c3c' },
];

const testimonials = [
  { name: 'Aminata D.', role: 'Dakar → Paris', text: 'Grâce à Confamily, mon fils né en France connaît maintenant ses 43 cousins au Sénégal.', stars: 5 },
  { name: 'Jean-Pierre K.', role: 'Abidjan → Montréal', text: "On a organisé notre première réunion familiale en 20 ans grâce à l'arbre !", stars: 5 },
  { name: 'Fatoumata B.', role: 'Bamako → Lyon', text: "Le coffre-fort préserve des photos de nos grands-parents que personne n'avait numérisées.", stars: 5 },
];

// Count-up hook
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
          else setCount(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ value, label, suffix = '' }: { value: number | string; label: string; suffix?: string }) {
  const isNum = typeof value === 'number';
  const { count, ref } = useCountUp(isNum ? value : 0);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '16px 24px' }}>
      <div style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #d97736, #e8a87c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {isNum ? `${count}${suffix}` : value}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// Preview tree mockup
function TreePreview() {
  const members = [
    { name: 'Grand-Père', emoji: '👴', x: 200, y: 20, color: '#d97736' },
    { name: 'Grand-Mère', emoji: '👵', x: 340, y: 20, color: '#e8a87c' },
    { name: 'Papa', emoji: '👨', x: 140, y: 120, color: '#d97736' },
    { name: 'Maman', emoji: '👩', x: 280, y: 120, color: '#e8a87c' },
    { name: 'Moi', emoji: '🧑', x: 80, y: 220, color: '#3498db' },
    { name: 'Sœur', emoji: '👧', x: 210, y: 220, color: '#e8a87c' },
    { name: 'Conjoint', emoji: '💑', x: 0, y: 320, color: '#27ae60' },
    { name: 'Enfant', emoji: '👶', x: 80, y: 320, color: '#9b59b6' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '380px', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
      {/* Connecting lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 520 420" preserveAspectRatio="none">
        <path d="M240 50 L175 120" stroke="#d97736" strokeWidth="2" strokeDasharray="5,3" fill="none" opacity="0.5" />
        <path d="M375 50 L175 120" stroke="#d97736" strokeWidth="2" strokeDasharray="5,3" fill="none" opacity="0.5" />
        <path d="M175 150 L115 220" stroke="#d97736" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M315 150 L245 220" stroke="#e8a87c" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M175 150 L315 150" stroke="#f39c12" strokeWidth="2" strokeDasharray="8,4" fill="none" opacity="0.4" />
        <path d="M115 250 L35 320" stroke="#3498db" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M115 250 L115 320" stroke="#9b59b6" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
      {members.map((m, i) => (
        <div key={i} style={{
          position: 'absolute', left: m.x, top: m.y,
          background: 'var(--surface)',
          border: `2px solid ${m.color}44`,
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          fontSize: '0.8rem', fontWeight: 600,
          animation: `float ${3 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>
          <span style={{ color: 'var(--text)' }}>{m.name}</span>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 5%', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(250,247,242,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/Confamily/logo.png" alt="Confamily Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          <span className="hide-mobile" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Confamily</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-outline btn-sm" style={{ fontWeight: 600, padding: '8px 14px' }}>Connexion</Link>
          <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>Commencer</Link>
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
            <a href="#demo" className="btn btn-outline btn-lg">Voir la démo</a>
          </div>
        </div>

        {/* Stats with count-up */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '60px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', maxWidth: '600px', margin: '60px auto 0', gap: '0' }}>
          <StatCard value={100} label="Gratuit" suffix="%" />
          <div style={{ width: '1px', background: 'var(--border)', margin: '16px 0' }} />
          <StatCard value="∞" label="Membres" />
          <div style={{ width: '1px', background: 'var(--border)', margin: '16px 0' }} />
          <StatCard value={500} label="Familles" suffix="+" />
          <div style={{ width: '1px', background: 'var(--border)', margin: '16px 0' }} />
          <StatCard value="🌍" label="Diaspora" />
        </div>
      </section>

      {/* Tree Preview Demo */}
      <section id="demo" style={{ padding: '80px 5%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '16px' }}>✨ Aperçu de l'application</span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Un arbre vivant, pas une photo
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                Naviguez, zoom, cliquez sur chaque membre pour voir sa fiche complète. Ajoutez des photos, des dates, des lieux et des professions en temps réel.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Glissez-déposez les membres', 'Colorez les branches par famille', 'Imprimez en haute qualité'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 900 }}>✓</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
              <TreePreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 5%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Tout pour votre famille</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '500px', margin: '0 auto 50px' }}>Des outils pensés pour reconnecter les générations</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 5%', background: 'var(--bg-secondary)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '48px', letterSpacing: '-0.02em' }}>Ils ont reconecté leur famille</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {testimonials.map((t, i) => (
            <div key={i} className="card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#f39c12" color="#f39c12" />
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 'var(--radius-xl)', padding: '60px 40px', maxWidth: '800px', margin: '0 auto', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', position: 'relative' }}>Prêt à reconnecter votre famille ?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px', position: 'relative' }}>Commencez gratuitement et invitez vos proches en quelques clics.</p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, position: 'relative' }}>
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
