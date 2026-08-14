import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BetProvider } from "@/lib/bet-context";
import { GroupProvider } from "@/lib/group-context";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import MatchDetails from "./pages/MatchDetails";
import BetSlip from "./pages/BetSlip";
import MyBets from "./pages/MyBets";
import WalletPage from "./pages/WalletPage";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityFeed from "./pages/CommunityFeed";
import PoolsPage from "./pages/PoolsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BetSharingPage from "./pages/BetSharingPage";
import LiveStreamPage from "./pages/LiveStreamPage";
import AdvancedPaymentsPage from "./pages/AdvancedPaymentsPage";
import PersonalizationPage from "./pages/PersonalizationPage";
import GroupingGamePage from "./pages/GroupingGamePage";
import GroupDetailPage from "./pages/GroupDetailPage";
import GameEntryPage from "./pages/GameEntryPage";
import GroupChatPage from "./pages/GroupChatPage";
import DMPage from "./pages/DMPage";
import CaptainGroupsPage from "./pages/CaptainGroupsPage";
import PirateBucksPage from "./pages/PirateBucksPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminGrouping from "./pages/admin/AdminGrouping";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminAdvancedAnalytics from "./pages/admin/AdminAdvancedAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      {!user ? (
        <Route path="*" element={<Navigate to="/login" replace />} />
      ) : user.role === 'admin' ? (
        <Route element={<AppLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/matches" element={<AdminMatches />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/grouping" element={<AdminGrouping />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/advanced-analytics" element={<AdminAdvancedAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      ) : (
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/match/:id" element={<MatchDetails />} />
          <Route path="/bet-slip" element={<BetSlip />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/bet-sharing" element={<BetSharingPage />} />
          <Route path="/live-stream" element={<LiveStreamPage />} />
          <Route path="/payments" element={<AdvancedPaymentsPage />} />
          <Route path="/personalization" element={<PersonalizationPage />} />
          <Route path="/groups" element={<GroupingGamePage />} />
          <Route path="/groups/game/:id" element={<GameEntryPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/group-chat" element={<GroupChatPage />} />
          <Route path="/messages" element={<DMPage />} />
          <Route path="/captain-groups" element={<CaptainGroupsPage />} />
          <Route path="/pirate-bucks" element={<PirateBucksPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BetProvider>
        <GroupProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </GroupProvider>
      </BetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
