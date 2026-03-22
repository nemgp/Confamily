import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardingView() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2);
    else if (step === 2) navigate('/dashboard');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-color)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--surface-color)',
        padding: '3rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '2.5rem' }}>Confamily</h1>
        
        {step === 1 && (
          <>
            <h2 style={{ marginBottom: '2rem' }}>Commençons votre histoire</h2>
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Comment vous appelez-vous ?</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom et nom"
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ marginBottom: '2rem' }}>Bienvenue {name} !</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Nous allons créer le premier nœud de votre arbre généalogique. 
              Vous pourrez ensuite inviter votre famille via WhatsApp pour qu'ils complètent leurs branches.
            </p>
          </>
        )}

        <button 
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {step === 1 ? 'Continuer' : 'Accéder à mon Arbre'}
        </button>
      </div>
    </div>
  );
}
