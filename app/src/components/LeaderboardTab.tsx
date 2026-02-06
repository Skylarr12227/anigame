import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSocket } from '@/hooks/useSocket';
import { Trophy, Star, Swords, Zap } from 'lucide-react';

interface LeaderboardData {
  zoo: Array<{ rank: number; username: string; score: number }>;
  battle: Array<{ rank: number; username: string; wins: number; losses: number; winRate: string }>;
  pets: Array<{ rank: number; username: string; petName: string; level: number; emoji: string }>;
}

export function LeaderboardTab() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData | null>(null);
  const { actions, setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onLeaderboardsData: (data) => {
        setLeaderboards(data);
      },
    });
  }, [setEventHandlers]);

  // Request data on mount
  useEffect(() => {
    actions.getLeaderboards();
  }, [actions]);

  if (!leaderboards) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading leaderboards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="zoo">
        <TabsList className="mb-4">
          <TabsTrigger value="zoo" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Zoo Points
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Battle Wins
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Top Pets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zoo">
          <Card className="bg-[#10182b] border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Zoo Points Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboards.zoo.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded ${
                      entry.rank <= 3 ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-[#0b0f19]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <span className="text-white font-medium">{entry.username}</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                      {entry.score.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="battle">
          <Card className="bg-[#10182b] border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Swords className="w-6 h-6 text-red-500" />
                Battle Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboards.battle.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded ${
                      entry.rank <= 3 ? 'bg-red-500/10 border border-red-500/30' : 'bg-[#0b0f19]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <span className="text-white font-medium block">{entry.username}</span>
                        <span className="text-gray-500 text-sm">{entry.wins}W / {entry.losses}L</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      {entry.winRate}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pets">
          <Card className="bg-[#10182b] border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-500" />
                Top Pets by Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboards.pets.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded ${
                      entry.rank <= 3 ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-[#0b0f19]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{entry.emoji}</span>
                        <div>
                          <span className="text-white font-medium block">{entry.petName}</span>
                          <span className="text-gray-500 text-sm">Owner: {entry.username}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      Lv.{entry.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
