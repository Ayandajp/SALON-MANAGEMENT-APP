import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useSettings } from '../hooks/useSettings';

export function LockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { settings, unlock } = useSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === settings.pin) {
      unlock();
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white mb-2">
            Salon Management
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400">
            Enter your PIN to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="PIN"
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            error={error}
            autoFocus
            required
          />

          {error && (
            <div className="flex items-center gap-2 text-danger" role="alert">
              <AlertCircle className="w-4 h-4" />
              <span className="text-caption">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full">
            Unlock
          </Button>

          <p className="text-caption text-center text-text-secondary dark:text-gray-400 mt-4">
            Default PIN: 0000
          </p>
        </form>
      </div>
    </div>
  );
}