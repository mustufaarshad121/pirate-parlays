import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MOCK_GROUPS, type Group } from '@/lib/mock-social';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Anchor, Users, DollarSign, Plus, Shield } from 'lucide-react';

const CaptainGroupsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['g1']);
  const [form, setForm] = useState({ name: '', dollarPref: '', maxUsers: '10', criteria: '' });

  const isCaptain = false; // Demo: user1 is not captain

  const handleCreate = () => {
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name: form.name,
      captainId: user!.id,
      captainName: user!.username,
      dollarPreference: form.dollarPref,
      maxUsers: parseInt(form.maxUsers),
      currentUsers: 1,
      joinCriteria: form.criteria,
      members: [{ id: user!.id, username: user!.username, rank: 'Captain' }],
    };
    setGroups(prev => [newGroup, ...prev]);
    setShowCreate(false);
    setForm({ name: '', dollarPref: '', maxUsers: '10', criteria: '' });
    toast({ title: 'Group Created! 🏴‍☠️', description: `${form.name} is now live.` });
  };

  const handleJoin = (groupId: string) => {
    setJoinedGroups(prev => [...prev, groupId]);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, currentUsers: g.currentUsers + 1 } : g));
    toast({ title: 'Joined!', description: 'You joined the group.' });
    setSelectedGroup(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Anchor size={24} /> Captain Groups</h1>
        <DemoBadge />
      </div>

      <p className="text-sm text-muted-foreground">Browse and join groups formed by Captains. Only users with Captain status can create groups.</p>

      {!isCaptain && (
        <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-2 text-sm">
          <Shield size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">You need <span className="text-primary font-semibold">Captain</span> rank to create groups. Keep winning! 🏴‍☠️</span>
        </div>
      )}

      {/* Demo: Allow creating anyway for demo purposes */}
      <Button onClick={() => setShowCreate(true)} className="w-full" variant="outline">
        <Plus size={16} /> Create Group (Demo)
      </Button>

      {groups.map(group => (
        <Card key={group.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedGroup(group)}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Captain: {group.captainName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs"><Users size={12} className="inline" /> {group.currentUsers}/{group.maxUsers}</p>
                {joinedGroups.includes(group.id) && <span className="text-[10px] text-primary font-semibold">JOINED</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span><DollarSign size={12} className="inline" /> {group.dollarPreference}</span>
            </div>
            {group.joinCriteria && (
              <p className="text-xs text-muted-foreground mt-2 bg-secondary/30 rounded p-2">📋 {group.joinCriteria}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Group Detail */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedGroup?.name}</DialogTitle></DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Captain</span><span className="font-semibold">{selectedGroup.captainName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dollar Preference</span><span>{selectedGroup.dollarPreference}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Members</span><span>{selectedGroup.currentUsers}/{selectedGroup.maxUsers}</span></div>
              </div>
              {selectedGroup.joinCriteria && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Join Criteria</p>
                  <p className="text-sm bg-secondary/30 rounded p-2">{selectedGroup.joinCriteria}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Members</p>
                <div className="space-y-1">
                  {selectedGroup.members.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{m.username.charAt(0)}</div>
                      <span>{m.username}</span>
                      <RankBadge rank={m.rank} />
                    </div>
                  ))}
                </div>
              </div>
              {joinedGroups.includes(selectedGroup.id) ? (
                <Button className="w-full" disabled>Already Joined ✓</Button>
              ) : selectedGroup.currentUsers >= selectedGroup.maxUsers ? (
                <Button className="w-full" disabled>Group Full</Button>
              ) : (
                <Button className="w-full" onClick={() => handleJoin(selectedGroup.id)}>Join Group</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Group */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Group</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Group Name</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sunday Slayers" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Dollar Amount Preference</label>
              <Input value={form.dollarPref} onChange={e => setForm(p => ({ ...p, dollarPref: e.target.value }))} placeholder="e.g. $25 - $100 per bet" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max Users</label>
              <Input type="number" value={form.maxUsers} onChange={e => setForm(p => ({ ...p, maxUsers: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Join Criteria / Preference</label>
              <Textarea value={form.criteria} onChange={e => setForm(p => ({ ...p, criteria: e.target.value }))} placeholder="Optional requirements for joining..." rows={2} />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!form.name.trim()}>Create Group</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaptainGroupsPage;
