import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MOCK_POOLS, type Pool } from '@/lib/mock-social';
import { Users, Trophy, DollarSign, Lock, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PoolsPage = () => {
  const { toast } = useToast();
  const [pools, setPools] = useState(MOCK_POOLS);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [joinedPools, setJoinedPools] = useState<string[]>(['pool1']);

  const handleJoin = (poolId: string) => {
    setJoinedPools(prev => [...prev, poolId]);
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, members: p.members + 1 } : p));
    toast({ title: 'Joined Pool! 🏴‍☠️', description: 'You have been added to the pool.' });
    setSelectedPool(null);
  };

  const statusColor = (s: string) => s === 'open' ? 'text-primary' : s === 'in_progress' ? 'text-warning' : 'text-muted-foreground';

  const renderPools = (type: 'public' | 'private') => {
    const filtered = pools.filter(p => p.type === type);
    return (
      <div className="space-y-3">
        {filtered.map(pool => (
          <Card key={pool.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedPool(pool)}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {pool.type === 'private' ? <Lock size={14} className="text-warning" /> : <Globe size={14} className="text-primary" />}
                    <h3 className="font-semibold text-sm">{pool.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">by {pool.creatorName} • {pool.sport}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{pool.rules}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={`text-xs font-semibold uppercase ${statusColor(pool.status)}`}>{pool.status.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pool.members}/{pool.maxMembers}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign size={12} /> Entry: ${pool.entryFee}</span>
                <span className="flex items-center gap-1"><Trophy size={12} /> Prize: ${pool.prizePool}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {pool.members} joined</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Challenges & Pools</h1>
      </div>
      <Tabs defaultValue="public">
        <TabsList className="w-full">
          <TabsTrigger value="public" className="flex-1">Public Pools</TabsTrigger>
          <TabsTrigger value="private" className="flex-1">Private Pools</TabsTrigger>
        </TabsList>
        <TabsContent value="public">{renderPools('public')}</TabsContent>
        <TabsContent value="private">{renderPools('private')}</TabsContent>
      </Tabs>

      {/* Pool Detail */}
      <Dialog open={!!selectedPool} onOpenChange={() => setSelectedPool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPool?.type === 'private' ? <Lock size={16} className="text-warning" /> : <Globe size={16} className="text-primary" />}
              {selectedPool?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPool && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created by</span>
                  <span className="font-semibold">{selectedPool.creatorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sport</span>
                  <span>{selectedPool.sport}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-semibold">${selectedPool.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-semibold text-primary">${selectedPool.prizePool}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Members</span>
                  <span>{selectedPool.members}/{selectedPool.maxMembers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold uppercase ${statusColor(selectedPool.status)}`}>{selectedPool.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Rules</p>
                <p className="text-sm">{selectedPool.rules}</p>
              </div>
              {selectedPool.status === 'open' && (
                joinedPools.includes(selectedPool.id) ? (
                  <Button className="w-full" disabled>Already Joined ✓</Button>
                ) : (
                  <Button className="w-full" onClick={() => handleJoin(selectedPool.id)}>
                    Join Pool — ${selectedPool.entryFee}
                  </Button>
                )
              )}
              {selectedPool.status !== 'open' && (
                <p className="text-center text-sm text-muted-foreground">This pool is {selectedPool.status.replace('_', ' ')}.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoolsPage;
