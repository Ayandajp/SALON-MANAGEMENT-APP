import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { useSettings } from '../hooks/useSettings';

export function PINLock() {
  const { settings, unlock } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  if (settings.isUnlocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredPin = String(pin).trim();
    const storedPin = String(settings.pin).trim();
    
    if (enteredPin === storedPin) {
      unlock();
      setError('');
      setPin('');
    } else {
      setError('Incorrect PIN');
      setIsShaking(true);
      
      setTimeout(() => {
        setPin('');
        setIsShaking(false);
        setError('');
      }, 400);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPin(value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background dark:bg-dark-background">
      <div className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-h2 font-heading font-bold text-text-primary dark:text-white mb-2">
            Salon Manager
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400">
            Enter PIN to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={handlePinChange}
            className={`w-full px-4 py-4 rounded-md border bg-background dark:bg-dark-surface text-center text-h2 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent dark:text-white transition-all ${
              isShaking ? 'animate-shake' : ''
            } ${error ? 'border-danger' : 'border-border dark:border-dark-border'}`}
            placeholder="••••"
            autoFocus
            aria-label="4-digit PIN"
            aria-invalid={error ? 'true' : 'false'}
          />
          {error && (
            <p className="text-caption text-danger text-center" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pin.length !== 4}>
            Unlock
          </Button>
          <div className="bg-surface dark:bg-dark-surface rounded-md p-4 text-center">
            <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">
              Default PIN: <span className="font-mono font-semibold text-text-primary dark:text-white">0000</span>
            </p>
            <p className="text-caption text-text-secondary dark:text-gray-400">
              Change this in Settings after unlocking
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}