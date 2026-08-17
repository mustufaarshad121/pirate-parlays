import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CURRENT_PROFILE, MOCK_PIRATE_BUCKS_HISTORY, MOCK_REDEMPTION_ITEMS, type RedemptionItem } from '@/lib/mock-social';
import { Coins, ArrowUp, ArrowDown, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PirateBucksPage = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(CURRENT_PROFILE.stats.pirateBucks);
  const [history, setHistory] = useState(MOCK_PIRATE_BUCKS_HISTORY);
  const [selectedItem, setSelectedItem] = useState<RedemptionItem | null>(null);

  const handleRedeem = (item: RedemptionItem) => {
    if (balance < item.cost) {
      toast({ title: 'Insufficient Pirate Bucks', description: `You need ${item.cost - balance} more.`, variant: 'destructive' });
      return;
    }
    setBalance(prev => prev - item.cost);
    setHistory(prev => [
      { id: `pb-${Date.now()}`, type: 'spent', amount: -item.cost, description: `Redeemed: ${item.name}`, date: new Date().toISOString().split('T')[0] },
      ...prev,
    ]);
    toast({ title: 'Redeemed! 🏴‍☠️', description: `${item.name} has been redeemed.` });
    setSelectedItem(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Coins className="text-warning" /> Pirate Bucks</h1>
      </div>

      {/* Balance */}
      <Card className="border-primary/30">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Your Balance</p>
          <p className="text-4xl font-display font-bold text-warning mt-1">🪙 {balance}</p>
          <p className="text-xs text-muted-foreground mt-1">Pirate Bucks</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="shop">
        <TabsList className="w-full">
          <TabsTrigger value="shop" className="flex-1">Redeem Shop</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">Earn/Spend History</TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <div className="grid grid-cols-2 gap-3">
            {MOCK_REDEMPTION_ITEMS.map(item => (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedItem(item)}>
                <CardContent className="pt-4 text-center">
                  <span className="text-3xl">{item.image}</span>
                  <p className="font-semibold text-sm mt-2">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-warning font-bold mt-2">🪙 {item.cost}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-2">
            {history.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earned' ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                  {tx.type === 'earned' ? <ArrowUp size={16} className="text-primary" /> : <ArrowDown size={16} className="text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'earned' ? 'text-primary' : 'text-destructive'}`}>
                  {tx.type === 'earned' ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Redeem Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Redeem Item</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4 text-center">
              <span className="text-5xl">{selectedItem.image}</span>
              <h3 className="font-display font-bold text-lg">{selectedItem.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-2xl font-bold text-warning">🪙 {selectedItem.cost}</p>
                <p className="text-xs text-muted-foreground mt-1">Your balance: 🪙 {balance}</p>
              </div>
              <Button className="w-full" onClick={() => handleRedeem(selectedItem)} disabled={balance < selectedItem.cost}>
                <ShoppingBag size={16} /> Redeem
              </Button>
              {balance < selectedItem.cost && (
                <p className="text-xs text-destructive">Not enough Pirate Bucks</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PirateBucksPage;
