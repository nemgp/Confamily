import { Download, Printer } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function PrintTree() {
  const { user } = useAuthStore();
  const isPremium = user?.isPremium;

  const handleExport = async () => {
    if (!isPremium) { window.location.hash = '/pricing'; return; }
    // Use html2canvas (to be installed) or basic approach
    const treeEl = document.querySelector('.react-flow') as HTMLElement;
    if (!treeEl) return;

    try {
      // Dynamic import for html2canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = treeEl.scrollWidth * 2;
      canvas.height = treeEl.scrollHeight * 2;
      if (ctx) {
        ctx.fillStyle = '#faf7f2';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 48px Inter';
        ctx.fillStyle = '#d97736';
        ctx.fillText('Arbre Confamily', 40, 60);
        ctx.font = '24px Inter';
        ctx.fillStyle = '#666';
        ctx.fillText('Exporté le ' + new Date().toLocaleDateString('fr'), 40, 100);
        ctx.fillText('Fonctionnalité complète disponible avec html2canvas', 40, 160);
      }
      const link = document.createElement('a');
      link.download = 'arbre-confamily.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Erreur lors de l\'export.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn btn-outline btn-sm" onClick={handleExport}>
        <Download size={14} /> {isPremium ? 'Exporter HD' : '🔒 Export HD'}
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
        <Printer size={14} /> Imprimer
      </button>
    </div>
  );
}
