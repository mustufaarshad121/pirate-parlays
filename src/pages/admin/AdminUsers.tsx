import { useState } from 'react';
import { OVERSIGHT_USERS, OversightUser } from '@/lib/admin-data';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import DemoBadge from '@/components/DemoBadge';

type StatusFilter = 'all' | 'active' | 'suspended' | 'flagged';

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<OversightUser[]>(OVERSIGHT_USERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [viewing, setViewing] = useState<OversightUser | null>(null);
  const [adjusting, setAdjusting] = useState<OversightUser | null>(null);
  const [amount, setAmount] = useState('');

  const visible = users.filter(u => {
    const matchesSearch = (u.name + u.email).toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true : filter === 'flagged' ? u.flags > 0 : u.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleStatus = (u: OversightUser) => {
    const next = u.status === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, status: next } : x)));
    toast({ title: next === 'suspended' ? 'User suspended' : 'User reactivated', description: u.name });
  };

  const flagUser = (u: OversightUser) => {
    setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, flags: x.flags + 1 } : x)));
    toast({ title: 'Content flagged', description: `${u.name} flagged for review.` });
  };

  const applyAdjustment = () => {
    if (!adjusting) return;
    const delta = Number(amount);
    if (!Number.isFinite(delta) || delta === 0) {
      toast({ title: 'Enter an adjustment amount', variant: 'destructive' });
      return;
    }
    setUsers(prev => prev.map(x => (x.id === adjusting.id ? { ...x, balance: Math.max(0, x.balance + delta) } : x)));
    toast({ title: 'Balance adjusted', description: `${adjusting.name}: ${delta > 0 ? '+' : ''}$${delta}` });
    setAdjusting(null);
    setAmount('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl">User Management & Oversight</h1>
        <DemoBadge />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'suspended', 'flagged'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? 'gradient-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border bg-secondary">
                <th className="text-left p-3">User ID</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Balance</th>
                <th className="text-left p-3">KYC</th>
                <th className="text-left p-3">Social</th>
                <th className="text-left p-3">Flags</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-3 text-muted-foreground">{u.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base">{u.avatar}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{u.status}</span>
                  </td>
                  <td className="p-3 text-right font-bold">${u.balance.toLocaleString()}</td>
                  <td className="p-3"><span className={`text-xs ${u.kyc === 'verified' ? 'text-primary' : 'text-warning'}`}>{u.kyc}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{u.posts} posts • {u.comments} comments</td>
                  <td className="p-3">
                    <Badge variant="outline" className={`text-[10px] ${u.flags > 0 ? 'border-destructive/40 text-destructive' : 'text-muted-foreground'}`}>{u.flags}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="text-xs text-primary hover:underline" onClick={() => setViewing(u)}>View Profile</button>
                      <button className="text-xs text-warning hover:underline" onClick={() => flagUser(u)}>Flag</button>
                      <button className="text-xs text-warning hover:underline" onClick={() => toggleStatus(u)}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
                      <button className="text-xs text-muted-foreground hover:underline" onClick={() => setAdjusting(u)}>Adjust Balance</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={o => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">{viewing.avatar}</span>
                <div>
                  <p className="text-muted-foreground text-xs">{viewing.email}</p>
                  <p className="text-xs">Joined {viewing.joined}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{viewing.bio}</p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-secondary rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">Posts</p><p className="font-bold">{viewing.posts}</p></div>
                <div className="bg-secondary rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">Comments</p><p className="font-bold">{viewing.comments}</p></div>
                <div className="bg-secondary rounded-lg p-2 text-center"><p className="text-xs text-muted-foreground">Flags</p><p className="font-bold">{viewing.flags}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjusting} onOpenChange={o => { if (!o) { setAdjusting(null); setAmount(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust balance — {adjusting?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Current balance: ${adjusting?.balance.toLocaleString()}</p>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (use - to debit)" />
            <Button onClick={applyAdjustment} className="w-full">Apply Adjustment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
