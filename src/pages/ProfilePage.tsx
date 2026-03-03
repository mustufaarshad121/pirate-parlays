import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { CURRENT_PROFILE, ALL_SPORTS, RANK_ICONS } from '@/lib/mock-social';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { User, Trophy, Target, Flame, Award, TrendingUp, Edit2, Save, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(CURRENT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [selectedSports, setSelectedSports] = useState<string[]>(profile.sportsInterests);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const handleSave = () => {
    setProfile(p => ({ ...p, bio, sportsInterests: selectedSports }));
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <DemoBadge />
      </div>

      {/* Avatar + Basic Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-3xl border-2 border-primary/30">
                {profile.avatar || <User className="w-10 h-10 text-muted-foreground" />}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-display font-bold">{user?.username}</h2>
                <RankBadge rank={profile.rank} size="md" />
              </div>
              {editing ? (
                <Textarea value={bio} onChange={e => setBio(e.target.value)} className="mt-2" rows={2} />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => editing ? handleSave() : setEditing(true)}>
              {editing ? <Save size={18} /> : <Edit2 size={18} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sports Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sports Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => editing && toggleSport(sport)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSports.includes(sport)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                } ${!editing && 'cursor-default'}`}
              >
                {sport}
              </button>
            ))}
          </div>
          {!editing && <p className="text-xs text-muted-foreground mt-2">Tap Edit to change interests</p>}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Trophy, label: 'Total Bets', value: profile.stats.totalBets },
              { icon: Target, label: 'Win Rate', value: `${profile.stats.winRate}%` },
              { icon: Flame, label: 'Win Streak', value: `${profile.stats.winStreak} 🔥` },
              { icon: Award, label: 'Ranking', value: `#${profile.stats.ranking}` },
              { icon: TrendingUp, label: 'XP', value: profile.stats.xp.toLocaleString() },
              { icon: Award, label: 'Pirate Bucks', value: `🪙 ${profile.stats.pirateBucks}` },
            ].map(stat => (
              <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon size={14} />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="font-display font-bold text-lg">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
