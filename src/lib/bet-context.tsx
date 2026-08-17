import React, { createContext, useContext, useState, useCallback } from 'react';
import { BetSlipItem, Bet, SAMPLE_BETS } from './data';
import { useAuth } from './auth';

interface BetContextType {
  slipItems: BetSlipItem[];
  bets: Bet[];
  addToSlip: (item: BetSlipItem) => void;
  removeFromSlip: (outcomeId: string) => void;
  clearSlip: () => void;
  placeBet: (stake: number) => string | null;
  isInSlip: (outcomeId: string) => boolean;
}

const BetContext = createContext<BetContextType | null>(null);

export const BetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slipItems, setSlipItems] = useState<BetSlipItem[]>([]);
  const [bets, setBets] = useState<Bet[]>(SAMPLE_BETS);
  const { user, updateBalance } = useAuth();

  const addToSlip = useCallback((item: BetSlipItem) => {
    setSlipItems((prev) => {
      if (prev.find((i) => i.outcomeId === item.outcomeId)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromSlip = useCallback((outcomeId: string) => {
    setSlipItems((prev) => prev.filter((i) => i.outcomeId !== outcomeId));
  }, []);

  const clearSlip = useCallback(() => setSlipItems([]), []);

  const isInSlip = useCallback((outcomeId: string) => {
    return slipItems.some((i) => i.outcomeId === outcomeId);
  }, [slipItems]);

  const placeBet = useCallback((stake: number): string | null => {
    if (!user || stake <= 0 || stake > user.balance || slipItems.length === 0) return null;
    const totalOdds = slipItems.reduce((acc, i) => acc * i.odds, 1);
    const payout = +(stake * totalOdds).toFixed(2);
    const txRef = `TX-PP-${String(bets.length + 1).padStart(5, '0')}`;
    const newBet: Bet = {
      id: `b${bets.length + 1}`,
      userId: user.id,
      items: [...slipItems],
      stake,
      totalOdds: +totalOdds.toFixed(2),
      payout,
      status: 'pending',
      placedAt: new Date().toISOString(),
      txRef,
    };
    setBets((prev) => [newBet, ...prev]);
    updateBalance(-stake);
    setSlipItems([]);
    return txRef;
  }, [user, slipItems, bets, updateBalance]);

  return (
    <BetContext.Provider value={{ slipItems, bets, addToSlip, removeFromSlip, clearSlip, placeBet, isInSlip }}>
      {children}
    </BetContext.Provider>
  );
};

export const useBets = () => {
  const ctx = useContext(BetContext);
  if (!ctx) throw new Error('useBets must be used within BetProvider');
  return ctx;
};
