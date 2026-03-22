import { Share2, ExternalLink } from 'lucide-react';

export function WhatsAppInvite() {
  const inviteLink = window.location.origin + window.location.pathname + '#/register';
  const message = `🌳 Rejoins notre arbre généalogique familial sur Confamily ! Ne perdons plus jamais le fil de notre histoire. Inscris-toi ici : ${inviteLink}`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Confamily — Rejoins notre famille', text: message, url: inviteLink });
    } else {
      shareWhatsApp();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Lien copié !');
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3 style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Share2 size={18} color="var(--primary)" /> Inviter un membre
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Envoyez une invitation à vos proches pour qu'ils complètent leur branche de l'arbre.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={shareWhatsApp}>
          📱 WhatsApp
        </button>
        <button className="btn btn-outline btn-sm" onClick={shareNative}>
          <ExternalLink size={14} /> Partager
        </button>
        <button className="btn btn-ghost btn-sm" onClick={copyLink}>
          📋 Copier le lien
        </button>
      </div>
    </div>
  );
}
