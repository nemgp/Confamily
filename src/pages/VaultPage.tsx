import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Upload, FileText, Image, Music, Lock, Folder, Trash2, Download, Plus, Loader } from 'lucide-react';
import * as API from '../api/googleAPI';
import { useToast } from '../components/Toast';

type VaultFile = API.VaultFile;

export function VaultPage() {
  const { user } = useAuthStore();
  const isPremium = user?.isPremium;
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isPremium) {
      setIsLoading(false);
      return;
    }
    API.getVaultFiles().then(res => {
      if (res.success && res.files) setFiles(res.files);
    }).finally(() => setIsLoading(false));
  }, [isPremium]);

  const getCatFromType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const toUpload = Array.from(fileList);

    for (const file of toUpload) {
      if (file.size > 50 * 1024 * 1024) {
        showToast(`${file.name} dépasse la limite de 50 Mo`, 'error');
        continue;
      }

      setUploadingFiles(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        const res = await API.uploadToVault(file, (pct) => {
          setUploadingFiles(prev => ({ ...prev, [file.name]: pct }));
        });
        
        if (res.success && res.fileId) {
          showToast(`${file.name} ajouté au coffre`, 'success');
          setFiles(prev => [{
            fileId: res.fileId!, name: res.name || file.name, url: res.url || '',
            size: res.size || file.size, date: new Date().toISOString(), mimeType: file.type
          }, ...prev]);
        } else {
          showToast(`Erreur d'upload pour ${file.name}`, 'error');
        }
      } catch (err) {
        showToast(`Échec upload: ${file.name}`, 'error');
      } finally {
        setUploadingFiles(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;
    try {
      const res = await API.deleteVaultFile(fileId);
      if (res.success) {
        setFiles(prev => prev.filter(f => f.fileId !== fileId));
        showToast('Fichier supprimé', 'success');
      } else {
        showToast(res.error || 'Erreur suppression', 'error');
      }
    } catch {
      showToast('Échec de la suppression', 'error');
    }
  };

  const getFormatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  if (!isPremium) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem'
        }}>🔒</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Coffre-Fort Numérique</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.7 }}>
          Stockez en toute sécurité vos documents officiels, photos haute définition et récits audio familiaux.
          <br />Cette fonctionnalité est réservée aux membres <strong>Premium</strong>.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          {['📄 Documents', '🖼️ Photos', '🎵 Enregistrements'].map(item => (
            <span key={item} className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>{item}</span>
          ))}
        </div>
        <a href="#/pricing" className="btn btn-primary btn-lg">Passer en Premium</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={24} color="var(--primary)" /> Coffre-Fort
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{files.length} fichier{files.length > 1 ? 's' : ''} enregistré{files.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()}>
          <Plus size={16} /> Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px',
          background: dragOver ? 'var(--primary-light)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'var(--transition)',
        }}
      >
        <Upload size={32} color={dragOver ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, color: dragOver ? 'var(--primary)' : 'var(--text-secondary)', margin: 0 }}>
          Glissez vos fichiers ici ou <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>parcourez</span>
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Sécurisé dans Google Drive — max 50 MB</p>
      </div>

      {Object.entries(uploadingFiles).map(([name, pct]) => (
        <div key={name} className="card" style={{ padding: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Loader className="animate-spin" size={24} color="var(--primary)" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{name}</p>
            <div style={{ background: 'var(--border)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary)', height: '100%', width: `${pct}%`, transition: 'width 0.2s' }} />
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{pct}%</span>
        </div>
      ))}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader className="animate-spin" size={32} color="var(--primary)" /></div>
      ) : files.length === 0 && Object.keys(uploadingFiles).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Folder size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Votre coffre est vide. Ajoutez vos premiers documents protégés.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map(f => {
            const cat = getCatFromType(f.mimeType);
            const Icon = cat === 'image' ? Image : cat === 'audio' ? Music : FileText;
            const bg = cat === 'image' ? 'rgba(39,174,96,0.1)' : cat === 'audio' ? 'rgba(155,89,182,0.1)' : 'rgba(52,152,219,0.1)';
            const color = cat === 'image' ? '#27ae60' : cat === 'audio' ? '#9b59b6' : '#3498db';

            return (
              <div key={f.fileId} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={color} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                    {f.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{getFormatSize(f.size)}</span>
                    <span style={{ color: 'var(--border-light)' }}>•</span>
                    <span>{new Date(f.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-icon btn-ghost" onClick={() => window.open(f.url, '_blank')} title="Télécharger">
                    <Download size={18} />
                  </button>
                  <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(f.fileId)} style={{ color: 'var(--danger)' }} title="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
