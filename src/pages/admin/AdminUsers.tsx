import { useState } from 'react';
import { ADMIN_USERS } from '@/lib/data';
import { Search } from 'lucide-react';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const users = ADMIN_USERS.filter((u) =>
    (u.name + u.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-4">Users Management</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border bg-secondary">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Balance</th>
                <th className="text-left p-3">KYC</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-3 text-muted-foreground">{u.id}</td>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold">${u.balance.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs ${u.kyc === 'verified' ? 'text-primary' : 'text-warning'}`}>{u.kyc}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-primary hover:underline">View</button>
                      <button className="text-xs text-warning hover:underline">
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
