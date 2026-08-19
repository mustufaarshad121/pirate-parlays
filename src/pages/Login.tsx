import { useEffect, useState } from 'react';
import { useAuth, WALKTHROUGH_ACCOUNTS } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { lovable } from '@/integrations/lovable/index';
import pirateLogo from '@/assets/pirate-logo.png';

const Login = () => {
  const [tab, setTab] = useState<'login' | 'create'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!ageVerified) {
      setError('Please confirm age & identity verification.');
      return;
    }
    if (tab === 'create' && username.trim().length < 3) {
      setError('Choose a username with at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    const res = tab === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong. Please try again.');
      return;
    }
    if (tab === 'create') setNotice('Account created. Signing you in…');
  };

  const handleGoogle = async () => {
    setError('');
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) setError('Google sign-in failed. Please try again or use email.');
  };

  const useWalkthrough = async (idx: number) => {
    const acct = WALKTHROUGH_ACCOUNTS[idx];
    setError('');
    setBusy(true);
    let res = await signIn(acct.email, acct.password);
    if (!res.ok) {
      const created = await signUp(acct.email, acct.password, acct.username);
      if (created.ok) res = await signIn(acct.email, acct.password);
    }
    setBusy(false);
    if (!res.ok) setError(res.error ?? 'Could not open that account.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <img src={pirateLogo} alt="Pirate Parlays" className="w-24 h-24 rounded-2xl mb-4 object-cover" />
        <h1 className="text-3xl font-display font-bold text-gradient">Pirate Parlays</h1>
        <p className="text-muted-foreground text-sm mt-1">MVP Preview • No Real Money</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            {(['login', 'create'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setNotice(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  tab === t ? 'bg-muted text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t === 'login' ? 'Login' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'create' && (
              <div>
                <label className="block text-sm font-semibold mb-1.5">Username</label>
                <Input
                  placeholder="Pick a pirate name"
                  value={username}
                  maxLength={24}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="bg-secondary border-border"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                maxLength={255}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
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
                <p className="text-sm font-semibold">Age & Identity Verification</p>
                <p className="text-xs text-primary">I confirm I am 21+ years old and agree to identity verification.</p>
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            {notice && <p className="text-primary text-sm">{notice}</p>}

            <Button
              type="submit"
              disabled={busy}
              className="w-full gradient-primary text-primary-foreground font-bold text-base h-12 glow-green"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : tab === 'login' ? 'Log In' : 'Create Account'}
            </Button>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold mb-3">Walkthrough accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {WALKTHROUGH_ACCOUNTS.map((a, i) => (
              <Button key={a.email} variant="outline" disabled={busy} onClick={() => useWalkthrough(i)}>
                {a.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            These open real accounts on the live backend, so anything you do is saved just like a normal player's.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
