import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useJoinByCode } from '@/lib/groups';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

const JoinByCodePage = () => {
  const navigate = useNavigate();
  const { code: codeParam } = useParams<{ code: string }>();
  const [code, setCode] = useState(codeParam ?? '');
  const [error, setError] = useState('');
  const join = useJoinByCode();

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 4) {
      setError('Enter the full invite code.');
      return;
    }
    setError('');
    try {
      const groupId = await join.mutateAsync(trimmed);
      toast.success('You joined the group.');
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join that group.');
    }
  };

  useEffect(() => {
    if (codeParam) void submit(codeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}><ArrowLeft size={20} /></Button>
        <h1 className="text-xl font-display font-bold">Join with an invite code</h1>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Invite code</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={code}
            maxLength={12}
            placeholder="ABC-1234"
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') void submit(code); }}
            className="bg-secondary border-border tracking-widest font-mono text-center text-lg"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={join.isPending} onClick={() => submit(code)}>
            {join.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <KeyRound size={16} className="mr-2" />}
            Join group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinByCodePage;
