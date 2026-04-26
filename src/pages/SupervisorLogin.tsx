import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Scissors, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

interface Salon {
  id: string;
  name: string;
}

export function SupervisorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState('');
  const [showSalonSelect, setShowSalonSelect] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo supervisor credentials
    if (email === 'supervisor@salon.com' && password === 'supervisor123') {
      try {
        // Fetch salons from salon_settings (with error handling)
        const { data: salonData, error } = await supabase!
          .from('salon_settings')
          .select('user_id, name')
          .not('user_id', 'is', null);

        if (error) {
          console.error('Error fetching salons:', error);
          // Fallback: use a default demo salon
          setSalons([{ id: 'demo', name: 'Demo Salon' }]);
          setShowSalonSelect(true);
          setIsLoading(false);
          return;
        }

        if (salonData && salonData.length > 0) {
          const salonList = salonData.map(s => ({
            id: s.user_id,
            name: s.name,
          }));
          setSalons(salonList);
          setShowSalonSelect(true);
          setIsLoading(false);
          return;
        }
        
        // No salons found – create a temporary demo salon
        setSalons([{ id: 'demo', name: 'Demo Salon' }]);
        setShowSalonSelect(true);
      } catch (err) {
        console.error('Unexpected error:', err);
        toastError('Error loading salons, using demo mode');
        setSalons([{ id: 'demo', name: 'Demo Salon' }]);
        setShowSalonSelect(true);
      }
      setIsLoading(false);
      return;
    }

    toastError('Invalid email or password');
    setIsLoading(false);
  };

  const handleSelectSalon = () => {
    if (!selectedSalonId) {
      toastError('Please select a salon to view');
      return;
    }

    const selectedSalon = salons.find(s => s.id === selectedSalonId);
    
    localStorage.setItem('supervisor_session', JSON.stringify({
      email: email,
      name: 'Supervisor',
      loggedIn: true,
      viewingSalonId: selectedSalonId,
      viewingSalonName: selectedSalon?.name || 'Salon'
    }));
    
    success(`Viewing salon: ${selectedSalon?.name}`);
    navigate('/supervisor-dashboard');
  };

  if (showSalonSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-h2 font-heading font-bold text-text-primary dark:text-white">
              Select Salon
            </h1>
            <p className="text-body text-text-secondary dark:text-gray-400 mt-2">
              Choose which salon to view
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Salon"
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              options={[
                { value: '', label: 'Select a salon...' },
                ...salons.map(salon => ({ value: salon.id, label: salon.name })),
              ]}
              required
            />
            <Button onClick={handleSelectSalon} className="w-full">
              View Dashboard
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowSalonSelect(false);
                setEmail('');
                setPassword('');
              }} 
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            Supervisor Portal
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400 mt-2">
            Enter your credentials to access salon data
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="supervisor@salon.com"
            required
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" loading={isLoading}>
            <Lock className="w-4 h-4 mr-2" />
            Login
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-caption text-text-secondary dark:text-gray-400">
            Demo: supervisor@salon.com / supervisor123
          </p>
        </div>
      </Card>
    </div>
  );
}