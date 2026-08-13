import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import pirateLogo from '@/assets/pirate-logo.png';

const Login = () => {
  const [tab, setTab] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [twoFactor, setTwoFactor] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageVerified) {
      setError('Please confirm age & KYC verification.');
      return;
    }
    if (twoFactor && code.trim().length < 4) {
      setError('Enter the 6-digit verification code (demo: any 4+ digits).');
      return;
    }
    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try demo accounts below.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <img src={pirateLogo} alt="Pirate Parlays" className="w-24 h-24 rounded-2xl mb-4 object-cover" />
        <h1 className="text-3xl font-display font-bold text-gradient">Pirate Parlays</h1>
        <p className="text-muted-foreground text-sm mt-1">MVP Demo • No Real Money</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Tabs */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === 'login' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === 'create' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign-in method */}
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'email' as const, icon: Mail, label: 'Email' },
                { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    method === m.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  }`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {method === 'email' ? 'Username or Email' : 'Mobile Number'}
              </label>
              <Input
                placeholder={method === 'email' ? 'Enter username or email' : 'Enter mobile number'}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="bg-secondary border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <Checkbox
                checked={ageVerified}
                onCheckedChange={(v) => setAgeVerified(v === true)}
                className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div>
                <p className="text-sm font-semibold">Age & KYC Verification</p>
                <p className="text-xs text-primary">I confirm I am 21+ years old and agree to identity verification.</p>
              </div>
            </div>

            {/* Optional two-factor authentication (demo) */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={twoFactor}
                  onCheckedChange={(v) => { setTwoFactor(v === true); setError(''); }}
                  className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1.5"><ShieldCheck size={14} /> Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Optional. Demo only — no code is actually sent.</p>
                </div>
              </div>
              {twoFactor && (
                <Input
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  className="bg-secondary border-border"
                />
              )}
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-bold text-base h-12 glow-green">
              Continue
            </Button>

            <p className="text-center text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Forgot password?
            </p>

            {/* Social sign-in (demo placeholders) */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Google', 'Facebook'].map(p => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setError(`${p} sign-in is a demo placeholder. Use the demo credentials below.`)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </form>
        </div>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-card border border-border rounded-xl p-5"
        >
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center text-xs">i</span>
            Demo Credentials
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User:</span>
              <code className="bg-secondary px-2 py-0.5 rounded text-foreground">user1 / 1234U</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin:</span>
              <code className="bg-secondary px-2 py-0.5 rounded text-foreground">admin1 / 1234a</code>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
