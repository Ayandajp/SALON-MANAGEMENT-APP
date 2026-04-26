import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Scissors } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toastError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      localStorage.setItem('salon_user_id', data.user.id);
      success('Login successful!');
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
            Salon Manager
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="Enter your password"
            required
          />
          <Button type="submit" className="w-full" loading={isLoading}>
            <Lock className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body text-text-secondary dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}