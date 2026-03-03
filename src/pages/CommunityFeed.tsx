import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { MOCK_FEED, type FeedPost } from '@/lib/mock-social';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { Heart, MessageCircle, Eye, Users, Send } from 'lucide-react';

const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(MOCK_FEED);
  const [newPost, setNewPost] = useState('');
  const [selectedBet, setSelectedBet] = useState<FeedPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: FeedPost = {
      id: `fp-${Date.now()}`,
      userId: user!.id,
      username: user!.username,
      avatar: '',
      rank: 'Pilot',
      type: 'post',
      content: newPost,
      comments: [],
      likes: 0,
      timestamp: 'Just now',
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      comments: [...p.comments, { id: `c-${Date.now()}`, username: user!.username, text, time: 'Just now' }],
    } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Community Feed</h1>
        <DemoBadge />
      </div>

      {/* Composer */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share your picks, thoughts, or tips... 🏴‍☠️"
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handlePost} disabled={!newPost.trim()}>
                  <Send size={14} /> Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.map(post => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="pt-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                {post.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{post.username}</span>
                  <RankBadge rank={post.rank} />
                  <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                </div>
                <p className="text-sm mt-1">{post.content}</p>
              </div>
            </div>

            {/* Bet Card */}
            {post.betDetails && (
              <div className="bg-secondary/50 rounded-lg p-3 mb-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{post.betDetails.match}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    post.betDetails.status === 'won' ? 'bg-primary/20 text-primary' :
                    post.betDetails.status === 'lost' ? 'bg-destructive/20 text-destructive' :
                    'bg-warning/20 text-warning'
                  }`}>{post.betDetails.status.toUpperCase()}</span>
                </div>
                <p className="font-semibold text-sm">{post.betDetails.outcome}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Odds: {post.betDetails.odds.toFixed(2)}</span>
                  <span>Stake: ${post.betDetails.stake}</span>
                  {post.betDetails.status === 'won' && (
                    <span className="text-primary font-semibold">Won: ${(post.betDetails.stake * post.betDetails.odds).toFixed(2)}</span>
                  )}
                </div>
              </div>
            )}

            {/* Pool Invite */}
            {post.poolDetails && (
              <div className="bg-primary/5 rounded-lg p-3 mb-3 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{post.poolDetails.name}</p>
                    <p className="text-xs text-muted-foreground">{post.poolDetails.members}/{post.poolDetails.maxMembers} members</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-primary text-primary">
                    <Users size={14} /> Join Pool
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Heart size={14} /> {post.likes}
              </button>
              <button onClick={() => setShowComments(p => ({ ...p, [post.id]: !p[post.id] }))} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={14} /> {post.comments.length}
              </button>
              {post.betDetails && (
                <button onClick={() => setSelectedBet(post)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Eye size={14} /> View Bet
                </button>
              )}
            </div>

            {/* Comments */}
            {showComments[post.id] && (
              <div className="mt-3 space-y-2">
                {post.comments.map(c => (
                  <div key={c.id} className="flex gap-2 text-xs">
                    <span className="font-semibold text-primary">{c.username}</span>
                    <span>{c.text}</span>
                    <span className="text-muted-foreground">{c.time}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))}
                    placeholder="Add a comment..."
                    className="h-8 text-xs"
                    onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleComment(post.id)} className="h-8 px-2">
                    <Send size={12} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Bet Detail Modal */}
      <Dialog open={!!selectedBet} onOpenChange={() => setSelectedBet(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bet Details</DialogTitle></DialogHeader>
          {selectedBet?.betDetails && (
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{selectedBet.betDetails.match}</p>
                <p className="font-semibold mt-1">{selectedBet.betDetails.outcome}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div><p className="text-xs text-muted-foreground">Odds</p><p className="font-bold">{selectedBet.betDetails.odds.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Stake</p><p className="font-bold">${selectedBet.betDetails.stake}</p></div>
                  <div><p className="text-xs text-muted-foreground">Payout</p><p className="font-bold text-primary">${(selectedBet.betDetails.stake * selectedBet.betDetails.odds).toFixed(2)}</p></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">By {selectedBet.username} • {selectedBet.timestamp}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityFeed;
