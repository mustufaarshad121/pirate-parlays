import { useState } from 'react';
import { SAMPLE_NOTIFICATIONS } from '@/lib/data';
import { Bell, Trophy, Gift, Zap } from 'lucide-react';

const iconMap: Record<string, JSX.Element> = {
  bet_placed: <Trophy size={16} className="text-primary" />,
  bet_settled: <Trophy size={16} className="text-primary" />,
  match_result: <Zap size={16} className="text-warning" />,
  promotion: <Gift size={16} className="text-primary" />,
};

const Notifications = () => {
  const [notifications] = useState(SAMPLE_NOTIFICATIONS);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display font-bold text-xl mb-1">Notifications</h1>
      <p className="text-muted-foreground text-sm mb-6">{notifications.filter(n => !n.read).length} unread</p>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-card border rounded-lg p-3 flex items-start gap-3 ${n.read ? 'border-border' : 'border-primary/30'}`}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-0.5">
              {iconMap[n.type] || <Bell size={16} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
