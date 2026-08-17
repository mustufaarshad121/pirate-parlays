import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, BarChart3 } from 'lucide-react';

const LiveStreamPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Live Stream</h1>
      </div>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-secondary flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary" />
          <div className="relative text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Play size={32} className="text-primary ml-1" />
            </div>
            <p className="font-display font-bold text-lg">No Live Stream Available</p>
            <p className="text-sm text-muted-foreground">Live streams will appear here during events</p>
          </div>

          {/* Score Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
            <div className="bg-card/80 backdrop-blur px-4 py-1.5 rounded-lg">
              <span className="font-display font-bold text-sm">Lakers <span className="text-primary">87</span> — <span className="text-primary">82</span> Celtics</span>
            </div>
            <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="text-xs">Q3 4:22</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Match Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-bold">Lakers vs Celtics</p>
              <p className="text-xs text-muted-foreground">NBA • March 4, 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-semibold text-destructive">LIVE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><BarChart3 size={18} /> Visual Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Possession', home: '54%', away: '46%' },
              { label: 'FG%', home: '48.2%', away: '45.8%' },
              { label: 'Rebounds', home: '32', away: '28' },
              { label: 'Turnovers', home: '8', away: '11' },
            ].map(stat => (
              <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2 text-center">{stat.label}</p>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-primary">{stat.home}</span>
                  <span>{stat.away}</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: stat.home }} />
                </div>
              </div>
            ))}
          </div>

          {/* Score Timeline */}
          <div className="mt-4 bg-secondary/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Score Timeline</p>
            <div className="flex items-end gap-1 h-16">
              {[20, 25, 38, 42, 48, 55, 60, 65, 72, 78, 82, 87].map((score, i) => (
                <div key={i} className="flex-1 bg-primary/40 rounded-t" style={{ height: `${(score / 87) * 100}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStreamPage;
