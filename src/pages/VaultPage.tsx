import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Upload, FileText, Image, Music, Lock, Folder } from 'lucide-react';

type VaultFile = { name: string; type: string; date: string; size: string };

const mockFiles: VaultFile[] = [
  { name: 'Acte_Naissance_Papa.pdf', type: 'document', date: '2024-03-15', size: '1.2 MB' },
  { name: 'Photo_Mariage_1985.jpg', type: 'image', date: '2024-02-20', size: '3.5 MB' },
  { name: 'Recit_GrandMere.mp3', type: 'audio', date: '2024-01-10', size: '8.1 MB' },
];

const icons: Record<string, typeof FileText> = { document: FileText, image: Image, audio: Music };

export function VaultPage() {
  const { user } = useAuthStore();
  const isPremium = user?.isPremium;
  const [files] = useState<VaultFile[]>(mockFiles);

  if (!isPremium) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Coffre-Fort Numérique</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>
          Stockez en toute sécurité vos documents officiels, photos haute définition et récits audio familiaux.
          <br />Cette fonctionnalité est réservée aux membres <strong>Premium</strong>.
        </p>
        <a href="#/pricing" className="btn btn-primary btn-lg">Passer en Premium</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={24} color="var(--primary)" /> Coffre-Fort
        </h1>
        <button className="btn btn-primary btn-sm"><Upload size={16} /> Ajouter un fichier</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {files.map((f, i) => {
          const Icon = icons[f.type] || Folder;
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.size} · {f.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
