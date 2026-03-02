import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const betData = [
  { name: 'Mon', active: 45, settled: 32 },
  { name: 'Tue', active: 52, settled: 41 },
  { name: 'Wed', active: 38, settled: 56 },
  { name: 'Thu', active: 65, settled: 48 },
  { name: 'Fri', active: 78, settled: 55 },
  { name: 'Sat', active: 92, settled: 67 },
  { name: 'Sun', active: 85, settled: 72 },
];

const winLossData = [
  { name: 'Wins', value: 42, color: 'hsl(152, 76%, 46%)' },
  { name: 'Losses', value: 58, color: 'hsl(200, 30%, 15%)' },
];

const revenueData = [
  { name: 'Mon', revenue: 3200 },
  { name: 'Tue', revenue: 4100 },
  { name: 'Wed', revenue: 2800 },
  { name: 'Thu', revenue: 5200 },
  { name: 'Fri', revenue: 6100 },
  { name: 'Sat', revenue: 8900 },
  { name: 'Sun', revenue: 7400 },
];

const AdminAnalytics = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bets chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-display font-semibold mb-4">Active vs Settled Bets</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={betData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 40%, 10%)', border: '1px solid hsl(200, 30%, 18%)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="active" fill="hsl(152, 76%, 46%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="settled" fill="hsl(200, 30%, 25%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-display font-semibold mb-4">Win/Loss Ratio</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {winLossData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 40%, 10%)', border: '1px solid hsl(200, 30%, 18%)', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
          <h2 className="font-display font-semibold mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 40%, 10%)', border: '1px solid hsl(200, 30%, 18%)', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(152, 76%, 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
