import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SAMPLE_BETS } from '@/lib/data';
import { Share2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BetSharingPage = () => {
  const { toast } = useToast();
  const [selectedBet, setSelectedBet] = useState<typeof SAMPLE_BETS[0] | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
  };

  const shareText = (bet: typeof SAMPLE_BETS[0]) =>
    `🏴‍☠️ Pirate Parlays\n${bet.items.map(i => `${i.match}: ${i.outcome} @ ${i.odds}`).join('\n')}\nTotal Odds: ${bet.totalOdds.toFixed(2)} | Stake: $${bet.stake}\n#PirateParlays`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Bet Sharing</h1>
      </div>
      <p className="text-sm text-muted-foreground">Share your bets with friends on social media.</p>

      {SAMPLE_BETS.map(bet => (
        <Card key={bet.id} className="overflow-hidden">
          <div className="h-1 gradient-primary" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">{bet.txRef}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                bet.status === 'won' ? 'bg-primary/20 text-primary' : bet.status === 'lost' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
              }`}>{bet.status.toUpperCase()}</span>
            </div>
            {bet.items.map((item, i) => (
              <div key={i} className="bg-secondary/50 rounded p-2 mb-2">
                <p className="text-xs text-muted-foreground">{item.match} • {item.market}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{item.outcome}</p>
                  <span className="text-primary font-bold text-sm">{item.odds.toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Stake: <span className="text-foreground font-semibold">${bet.stake}</span> • Payout: <span className="text-primary font-bold">${bet.payout.toFixed(2)}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setSelectedBet(bet); setShowShareModal(true); }}>
                <Share2 size={14} /> Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share Bet</DialogTitle></DialogHeader>
          {selectedBet && (
            <div className="space-y-4">
              {/* Preview Card */}
              <div className="bg-secondary rounded-lg p-4 border border-primary/20">
                <div className="text-center mb-3">
                  <p className="font-display font-bold text-gradient text-lg">🏴‍☠️ Pirate Parlays</p>
                </div>
                {selectedBet.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm border-b border-border last:border-0">
                    <span>{item.outcome}</span>
                    <span className="text-primary font-bold">{item.odds.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-2 text-center">
                  <p className="text-xs text-muted-foreground">Total Odds: <span className="text-primary font-bold">{selectedBet.totalOdds.toFixed(2)}</span></p>
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={() => handleCopy(shareText(selectedBet))}>
                <Copy size={14} /> Copy Share Text
              </Button>

              <div className="grid grid-cols-3 gap-2">
                {['WhatsApp', 'Twitter', 'Instagram'].map(platform => (
                  <Button key={platform} variant="secondary" size="sm" onClick={() => {
                    handleCopy(shareText(selectedBet));
                    toast({ title: `${platform}`, description: 'Share text copied! Paste it in your app.' });
                  }}>
                    <ExternalLink size={12} /> {platform}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                ⚠️ Direct sharing opens via clipboard copy. Paste in your preferred app.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BetSharingPage;
