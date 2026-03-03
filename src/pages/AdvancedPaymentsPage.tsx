import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MOCK_PAYMENT_METHODS, type PaymentMethod } from '@/lib/mock-social';
import DemoBadge from '@/components/DemoBadge';
import { CreditCard, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdvancedPaymentsPage = () => {
  const { toast } = useToast();
  const [methods, setMethods] = useState(MOCK_PAYMENT_METHODS);
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [autoAmount, setAutoAmount] = useState('500');

  const setDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    toast({ title: 'Default updated', description: 'Payment method set as default.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Payment Methods</h1>
        <DemoBadge label="Demo Mode — Not connected" />
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-warning">Demo Mode: Payment providers are not connected yet. Preferences are saved locally.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><CreditCard size={18} /> Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {methods.map(method => (
            <div key={method.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${method.isDefault ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground">{method.connected ? 'Connected' : 'Not connected'}</p>
              </div>
              {method.isDefault ? (
                <span className="flex items-center gap-1 text-xs text-primary font-semibold"><Check size={14} /> Default</span>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setDefault(method.id)} className="text-xs">Set Default</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Auto-Withdrawal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Enable Auto-Withdrawal</p>
              <p className="text-xs text-muted-foreground">Automatically withdraw when balance exceeds threshold</p>
            </div>
            <Switch checked={autoWithdraw} onCheckedChange={setAutoWithdraw} />
          </div>
          {autoWithdraw && (
            <div>
              <label className="text-xs text-muted-foreground">Withdrawal Threshold ($)</label>
              <input
                type="number"
                value={autoAmount}
                onChange={e => setAutoAmount(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPaymentsPage;
