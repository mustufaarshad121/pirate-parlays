import { REVENUE_BY_MARKET, REVENUE_BY_REGION, REVENUE_BY_SPORT, SEGMENTS } from '@/lib/admin-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const KpiBars = ({ title, rows }: { title: string; rows: { label: string; value: number }[] }) => {
  const max = Math.max(...rows.map(r => r.value));
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-bold">${r.value.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full gradient-primary" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const AdminAdvancedAnalytics = () => (
  <div className="max-w-5xl mx-auto space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="font-display font-bold text-xl flex items-center gap-2"><BarChart3 size={20} /> Advanced Analytics</h1>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {SEGMENTS.map(s => (
        <Card key={s.key}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.key}</p>
            <p className="font-display text-2xl font-bold">{s.count.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid gap-3 lg:grid-cols-3">
      <KpiBars title="Revenue by sport" rows={REVENUE_BY_SPORT} />
      <KpiBars title="Revenue by region" rows={REVENUE_BY_REGION} />
      <KpiBars title="Revenue by market" rows={REVENUE_BY_MARKET} />
    </div>
  </div>
);

export default AdminAdvancedAnalytics;
