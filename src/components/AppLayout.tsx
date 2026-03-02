import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useBets } from '@/lib/bet-context';
import pirateLogo from '@/assets/pirate-logo.png';
import {
  Home, Trophy, Wallet, Bell, Settings, LogOut,
  LayoutDashboard, Users, Calendar, CreditCard, BarChart3, Headphones,
  Receipt
} from 'lucide-react';

const userLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/my-bets', icon: Trophy, label: 'My Bets' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/matches', icon: Calendar, label: 'Matches' },
  { to: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/support', icon: Headphones, label: 'Support' },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { slipItems } = useBets();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src={pirateLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h2 className="font-display font-bold text-gradient text-lg leading-tight">Pirate Parlays</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-border pt-4 mt-4">
          {user?.role === 'user' && (
            <div className="px-3 mb-3">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-display font-bold text-primary text-lg">${user.balance.toFixed(2)}</p>
            </div>
          )}
          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <img src={pirateLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-gradient">Pirate Parlays</span>
          </div>
          {user?.role === 'user' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary">${user.balance.toFixed(2)}</span>
              {slipItems.length > 0 && (
                <button
                  onClick={() => navigate('/bet-slip')}
                  className="relative"
                >
                  <Receipt size={20} className="text-primary" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {slipItems.length}
                  </span>
                </button>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center justify-around bg-card border-t border-border py-2 sticky bottom-0 z-50">
          {links.slice(0, 5).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[10px] p-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
