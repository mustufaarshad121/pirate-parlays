import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MOCK_SUGGESTED_PARLAYS } from '@/lib/mock-social';
import DemoBadge from '@/components/DemoBadge';
import { Sparkles, Bell, Palette, Zap } from 'lucide-react';

const PersonalizationPage = () => {
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifs, setNotifs] = useState({
    friendActivity: true,
    challenges: true,
    streakMilestones: true,
    bonusCommunity: false,
  });

  const toggleNotif = (key: keyof typeof notifs) => setNotifs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Personalization & Alerts</h1>
        <DemoBadge />
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Sparkles size={18} className="text-warning" /> AI Bet Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Enable AI Suggestions</p>
              <p className="text-xs text-muted-foreground">Get personalized bet recommendations</p>
            </div>
            <Switch checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
          </div>

          {aiSuggestions && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Zap size={12} className="text-warning" /> Demo AI Suggestions</p>
              {MOCK_SUGGESTED_PARLAYS.map(parlay => (
                <div key={parlay.id} className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{parlay.title}</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{parlay.confidence}% conf.</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {parlay.legs.map((leg, i) => (
                      <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">{leg}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Combined Odds: <span className="text-primary font-bold">{parlay.odds.toFixed(2)}</span></p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Palette size={18} /> Theme Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['dark', 'light'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors text-center ${
                  theme === t ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${t === 'dark' ? 'bg-background border border-border' : 'bg-foreground'}`} />
                <p className="text-sm font-semibold capitalize">{t}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">⚠️ Theme switching is visual only in demo.</p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Bell size={18} /> Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'friendActivity' as const, label: 'Friend Activity', desc: 'When friends place bets or win' },
            { key: 'challenges' as const, label: 'Challenges', desc: 'New challenges and pool invites' },
            { key: 'streakMilestones' as const, label: 'Streak Milestones', desc: 'Win streak achievements' },
            { key: 'bonusCommunity' as const, label: 'Bonus & Community', desc: 'Pirate Bucks bonuses and community updates' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={notifs[item.key]} onCheckedChange={() => toggleNotif(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationPage;
