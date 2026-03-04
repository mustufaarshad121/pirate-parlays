import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useBets } from '@/lib/bet-context';
import pirateLogo from '@/assets/pirate-logo.png';
import {
  Home, Trophy, Wallet, Bell, Settings, LogOut,
  LayoutDashboard, Users, Calendar, CreditCard, BarChart3, Headphones,
  Receipt, User, MessageSquare, Swords, Crown, Anchor, Coins,
  Radio, Share2, CreditCard as PaymentIcon, Sparkles, MessageCircle
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const userLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/my-bets', icon: Trophy, label: 'My Bets' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const communityLinks = [
  { to: '/community', icon: MessageSquare, label: 'Feed' },
  { to: '/pools', icon: Swords, label: 'Pools' },
  { to: '/leaderboard', icon: Crown, label: 'Leaderboard' },
  { to: '/bet-sharing', icon: Share2, label: 'Share Bets' },
  { to: '/live-stream', icon: Radio, label: 'Live Stream' },
];

const socialLinks = [
  { to: '/groups', icon: Anchor, label: 'Grouping Game' },
  { to: '/group-chat', icon: MessageSquare, label: 'Group Chat' },
  { to: '/messages', icon: MessageCircle, label: 'DMs' },
  { to: '/pirate-bucks', icon: Coins, label: 'Pirate Bucks' },
];

const settingsLinks = [
  { to: '/payments', icon: PaymentIcon, label: 'Payments' },
  { to: '/personalization', icon: Sparkles, label: 'Personalize' },
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

const NavSection = ({ title, links }: { title: string; links: typeof userLinks }) => (
  <div className="mb-4">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1 font-semibold">{title}</p>
    <div className="space-y-0.5">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`
          }
        >
          <link.icon size={16} />
          {link.label}
        </NavLink>
      ))}
    </div>
  </div>
);

const SidebarContent = ({ user, logout, navigate }: { user: any; logout: () => void; navigate: (p: string) => void }) => {
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="flex items-center gap-3 mb-6 px-2">
        <img src={pirateLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        <h2 className="font-display font-bold text-gradient text-lg leading-tight">Pirate Parlays</h2>
      </div>

      <nav className="flex-1 overflow-auto">
        {isAdmin ? (
          <NavSection title="Admin" links={adminLinks} />
        ) : (
          <>
            <NavSection title="Main" links={userLinks} />
            <NavSection title="Community" links={communityLinks} />
            <NavSection title="Social" links={socialLinks} />
            <NavSection title="Settings" links={settingsLinks} />
          </>
        )}
      </nav>

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
          <button onClick={() => { logout(); navigate('/login'); }} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { slipItems } = useBets();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const mobileBottomLinks = user?.role === 'admin' ? adminLinks.slice(0, 5) : [
    userLinks[0], // Home
    { to: '/community', icon: MessageSquare, label: 'Feed' },
    { to: '/my-bets', icon: Trophy, label: 'Bets' },
    { to: '/pirate-bucks', icon: Coins, label: 'Bucks' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border p-3 sticky top-0 h-screen">
        <SidebarContent user={user} logout={logout} navigate={navigate} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Menu size={20} /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-3 flex flex-col">
                <SidebarContent user={user} logout={logout} navigate={(p) => { navigate(p); setSheetOpen(false); }} />
              </SheetContent>
            </Sheet>
            <img src={pirateLogo} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-display font-bold text-gradient text-sm">Pirate Parlays</span>
          </div>
          {user?.role === 'user' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary">${user.balance.toFixed(2)}</span>
              {slipItems.length > 0 && (
                <button onClick={() => navigate('/bet-slip')} className="relative">
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
          {mobileBottomLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[10px] p-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
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
