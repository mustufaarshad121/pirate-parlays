import { useAuth } from '@/lib/auth';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Palette, FileText, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { icon: User, label: 'Update Email / Phone', desc: 'Change your contact information' },
    { icon: Lock, label: 'Change Password', desc: 'Update your account password' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display font-bold text-xl mb-6">Settings</h1>

      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {user?.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {sections.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors">
            <s.icon size={18} className="text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-muted-foreground" />
            <span className="text-sm">Push Notifications</span>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-muted-foreground" />
            <span className="text-sm">Dark Mode</span>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors">
          <FileText size={18} className="text-muted-foreground" />
          <span className="text-sm">Terms & Conditions</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors">
          <FileText size={18} className="text-muted-foreground" />
          <span className="text-sm">Privacy Policy</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full border-destructive text-destructive hover:bg-destructive/10"
      >
        <LogOut size={16} className="mr-2" /> Log Out
      </Button>
    </div>
  );
};

export default SettingsPage;
