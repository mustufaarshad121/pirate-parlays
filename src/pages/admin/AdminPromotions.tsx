import { useState } from 'react';
import { BONUS_TYPES, PROMOTIONS, Promotion, TARGET_SEGMENTS } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';

const AdminPromotions = () => {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promotion[]>(PROMOTIONS);
  const [name, setName] = useState('');
  const [bonusType, setBonusType] = useState(BONUS_TYPES[0]);
  const [targeting, setTargeting] = useState(TARGET_SEGMENTS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const create = () => {
    if (!name.trim() || !startDate || !endDate) {
      toast({ title: 'Missing fields', description: 'Name, start date and end date are required.', variant: 'destructive' });
      return;
    }
    setPromos(prev => [
      { id: `p${Date.now()}`, name: name.trim(), bonusType, targeting, startDate, endDate, active: true },
      ...prev,
    ]);
    toast({ title: 'Promotion created', description: name.trim() });
    setName(''); setStartDate(''); setEndDate('');
  };

  const toggle = (id: string) =>
    setPromos(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));

  const select = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm';

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl flex items-center gap-2"><Gift size={20} /> Promotions</h1>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Promotion Builder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Promotion name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Promotion name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bonus type</Label>
              <select className={select} value={bonusType} onChange={e => setBonusType(e.target.value)}>
                {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Targeting</Label>
              <select className={select} value={targeting} onChange={e => setTargeting(e.target.value)}>
                {TARGET_SEGMENTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Starts</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ends</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bonus amounts, rates and eligibility rules are not defined in the supplied requirements and are not set here.
          </p>
          <Button onClick={create}>Create Promotion</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Promotions</h2>
        {promos.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{p.name}</p>
                <Badge variant="outline" className={`text-[10px] ${p.active ? 'border-primary/40 text-primary' : 'text-muted-foreground'}`}>
                  {p.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.bonusType} • {p.targeting} • {p.startDate} → {p.endDate}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggle(p.id)}>{p.active ? 'Deactivate' : 'Activate'}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
