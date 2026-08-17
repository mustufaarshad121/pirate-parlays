import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Anchor, Info, ShieldX, ChevronRight } from 'lucide-react';

// Per Final Client-Confirmed Grouping Game Override (v2.0):
// - No Captain may create, own, configure, approve, invite users to, or control
//   a Grouping Game.
// - Captain remains only as an existing profile RANK, outside the Grouping Game.
// - All grouping is system-created and random.
//
// This page previously allowed Captain-created groups. That behavior has been
// removed. The page is retained as an informational surface only.
const CaptainGroupsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Anchor size={24} /> Captain Rank
        </h1>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldX size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Captain-created groups have been removed</p>
              <p className="text-xs text-muted-foreground">
                Per the client-confirmed Grouping Game specification, no user — including Captains — can create, own,
                configure, approve, invite, or control a Grouping Game. All groups are created by Pirate Parlays and
                filled by random matchmaking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Captain as a profile rank</p>
              <p className="text-xs text-muted-foreground">
                Captain remains as an existing profile rank displayed on user profiles and community surfaces. It is a
                social/status label only and grants no Grouping Game controls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => navigate('/groups')}>
        Go to the Grouping Game <ChevronRight size={14} className="ml-1" />
      </Button>
    </div>
  );
};

export default CaptainGroupsPage;
