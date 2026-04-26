import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Scissors } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // 1. Sign up with Supabase Auth (include salon name in metadata)
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          salon_name: salonName || 'My Salon',
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      toastError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Wait a moment for the trigger to run (optional)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Manually insert salon_settings and settings if trigger didn't run
      try {
        const { error: salonError } = await supabase!
          .from('salon_settings')
          .insert({
            user_id: data.user.id,
            name: salonName || 'My Salon',
          });
        if (salonError) console.error('Salon settings insert error:', salonError);
      } catch (err) {
        console.error('Unexpected error inserting salon_settings:', err);
      }

      try {
        const { error: settingsError } = await supabase!
          .from('settings')
          .insert({
            user_id: data.user.id,
            dark_mode: false,
            is_unlocked: false,
            pin: '0000',
          });
        if (settingsError) console.error('Settings insert error:', settingsError);
      } catch (err) {
        console.error('Unexpected error inserting settings:', err);
      }

      localStorage.setItem('salon_user_id', data.user.id);
      success('Account created successfully!');
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            Create Account
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400 mt-2">
            Start managing your salon
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Salon Name"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            placeholder="e.g., Glam & Co. Salon"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          <Button type="submit" className="w-full" loading={isLoading}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body text-text-secondary dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}