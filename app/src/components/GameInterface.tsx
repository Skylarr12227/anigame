import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  PawPrint, 
  Swords, 
  ShoppingCart, 
  Trophy, 
  MessageSquare, 
  LogOut,
  Coins,
  Star,
  Zap
} from 'lucide-react';
import { HuntTab } from './HuntTab';
import { ZooTab } from './ZooTab';
import { PetsTab } from './PetsTab';
import { BattleTab } from './BattleTab';
import { ShopTab } from './ShopTab';
import { LeaderboardTab } from './LeaderboardTab';
import { ChatPanel } from './ChatPanel';

interface GameUser {
  id: string;
  username: string;
  displayName: string | null;
  currency: number;
  zooPoints: number;
}

interface GameInterfaceProps {
  user: GameUser | null;
  socketState: {
    connected: boolean;
    authenticated: boolean;
  };
  socketActions: {
    getPets: () => void;
    getBattleTeams: () => void;
    getInventory: () => void;
    sendChatMessage: (content: string) => void;
  };
  onLogout: () => void;
}

export function GameInterface({ user, socketState, socketActions, onLogout }: GameInterfaceProps) {
  const [activeTab, setActiveTab] = useState('hunt');
  const [chatOpen, setChatOpen] = useState(true);

  // Request initial data on mount
  useEffect(() => {
    socketActions.getPets();
    socketActions.getBattleTeams();
    socketActions.getInventory();
  }, [socketActions]);

  return (
    <div className="min-h-screen bg-[#0b0f19] grid-bg flex flex-col">
      {/* Header */}
      <header className="bg-[#10182b] border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-500" />
            <h1 className="display-font text-xl font-bold text-white hidden sm:block">
              CREATURE <span className="text-purple-500">COLLECTOR</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                <Coins className="w-4 h-4 mr-1" />
                {user?.currency?.toLocaleString() || 0}
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                <Star className="w-4 h-4 mr-1" />
                {user?.zooPoints?.toLocaleString() || 0}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 hidden sm:flex">
                <Zap className="w-4 h-4 mr-1" />
                {socketState.connected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 hidden sm:inline">{user?.username}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Game area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-[#10182b] border-b border-purple-500/20 rounded-none justify-start px-4 py-2 gap-1 flex-wrap">
              <TabsTrigger value="hunt" className="data-[state=active]:bg-purple-600">
                <Target className="w-4 h-4 mr-2" />
                Hunt
              </TabsTrigger>
              <TabsTrigger value="zoo" className="data-[state=active]:bg-purple-600">
                <PawPrint className="w-4 h-4 mr-2" />
                Zoo
              </TabsTrigger>
              <TabsTrigger value="pets" className="data-[state=active]:bg-purple-600">
                <Zap className="w-4 h-4 mr-2" />
                Pets
              </TabsTrigger>
              <TabsTrigger value="battle" className="data-[state=active]:bg-purple-600">
                <Swords className="w-4 h-4 mr-2" />
                Battle
              </TabsTrigger>
              <TabsTrigger value="shop" className="data-[state=active]:bg-purple-600">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
                <Trophy className="w-4 h-4 mr-2" />
                Rank
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="hunt" className="mt-0 h-full">
                <HuntTab />
              </TabsContent>
              <TabsContent value="zoo" className="mt-0 h-full">
                <ZooTab />
              </TabsContent>
              <TabsContent value="pets" className="mt-0 h-full">
                <PetsTab />
              </TabsContent>
              <TabsContent value="battle" className="mt-0 h-full">
                <BattleTab />
              </TabsContent>
              <TabsContent value="shop" className="mt-0 h-full">
                <ShopTab />
              </TabsContent>
              <TabsContent value="leaderboard" className="mt-0 h-full">
                <LeaderboardTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="w-80 border-l border-purple-500/20 bg-[#10182b] hidden lg:flex flex-col">
            <ChatPanel onSendMessage={socketActions.sendChatMessage} />
          </div>
        )}
      </div>

      {/* Mobile chat toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 lg:hidden bg-purple-600 text-white"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
    </div>
  );
}
