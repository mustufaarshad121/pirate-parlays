import { ADMIN_STATS, ADMIN_USERS, MATCHES, SAMPLE_TRANSACTIONS } from '@/lib/data';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Users', value: ADMIN_STATS.totalUsers.toLocaleString(), icon: Users, color: 'text-primary' },
  { label: 'Active Bets', value: ADMIN_STATS.activeBets.toString(), icon: Activity, color: 'text-warning' },
  { label: 'Revenue', value: `$${ADMIN_STATS.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
  { label: 'Pending Withdrawals', value: ADMIN_STATS.pendingWithdrawals.toString(), icon: TrendingUp, color: 'text-destructive' },
];

const AdminDashboard = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Overview of platform activity</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <h2 className="font-display font-bold mb-3">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left pb-2">User</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-right pb-2">Balance</th>
                <th className="text-left pb-2">KYC</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_USERS.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium">{u.name}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="text-right font-bold">${u.balance.toLocaleString()}</td>
                  <td>
                    <span className={`text-xs ${u.kyc === 'verified' ? 'text-primary' : 'text-warning'}`}>{u.kyc}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent matches */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-display font-bold mb-3">Active Matches</h2>
        <div className="space-y-2">
          {MATCHES.filter(m => m.status === 'live').map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">{m.homeTeam} vs {m.awayTeam}</p>
                <p className="text-xs text-muted-foreground">{m.league}</p>
              </div>
              <span className="text-xs font-bold text-primary">LIVE {m.homeScore} - {m.awayScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
