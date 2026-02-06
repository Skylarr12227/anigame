import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import type { HuntResult, Rarity } from '@/types/game';
import { RARITY_COLORS, RARITY_EMOJIS } from '@/types/game';
import { Target, Ticket, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function HuntTab() {
  const [huntResults, setHuntResults] = useState<HuntResult[]>([]);
  const [huntStats, setHuntStats] = useState<{
    totalAnimals: number;
    byRarity: Record<string, number>;
    rarityChances: Record<string, string>;
  } | null>(null);
  const [hunting, setHunting] = useState(false);
  const [multiHunting, setMultiHunting] = useState(false);

  const { actions, setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onHuntResult: (result) => {
        setHunting(false);
        setMultiHunting(false);
        
        if (result.success) {
          setHuntResults(prev => [result, ...prev].slice(0, 50));
          toast.success('Hunt successful!', { description: result.message });
        } else {
          toast.error(result.message);
        }
      },
      onMultiHuntResult: (result) => {
        setHunting(false);
        setMultiHunting(false);
        
        if (result.success) {
          result.hunts.forEach(hunt => {
            if (hunt.success) {
              setHuntResults(prev => [hunt, ...prev].slice(0, 50));
            }
          });
          toast.success('Multi-hunt complete!', { description: result.message });
        } else {
          toast.error(result.message);
        }
      },
      onHuntStats: (stats) => {
        setHuntStats(stats);
      },
    });
  }, [setEventHandlers]);

  // Request hunt stats on mount
  useEffect(() => {
    actions.getHuntStats();
  }, [actions]);

  const handleHunt = useCallback(() => {
    setHunting(true);
    actions.hunt();
  }, [actions]);

  const handleMultiHunt = useCallback(() => {
    setMultiHunting(true);
    actions.multiHunt();
  }, [actions]);

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* Hunt controls */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="display-font text-xl text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              Hunt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Spend 10💰 to hunt for creatures. Higher rarity creatures are harder to find but grant more rewards!
            </p>
            
            <Button 
              onClick={handleHunt}
              disabled={hunting || multiHunting}
              className="w-full bg-purple-600 hover:bg-purple-700 h-16 text-lg"
            >
              {hunting ? (
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Target className="w-5 h-5 mr-2" />
              )}
              Hunt (10💰)
            </Button>

            <Button 
              onClick={handleMultiHunt}
              disabled={hunting || multiHunting}
              variant="outline"
              className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 h-14"
            >
              {multiHunting ? (
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Ticket className="w-5 h-5 mr-2" />
              )}
              Multi-Hunt x5 (45💰)
            </Button>
          </CardContent>
        </Card>

        {/* Rarity info */}
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              Rarity Chances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {huntStats && Object.entries(huntStats.rarityChances).map(([rarity, chance]) => (
                <div key={rarity} className="flex justify-between items-center">
                  <span 
                    className="font-medium"
                    style={{ color: RARITY_COLORS[rarity as Rarity] }}
                  >
                    {RARITY_EMOJIS[rarity as Rarity]} {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
                  </span>
                  <span className="text-gray-400">{chance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hunt log */}
      <div className="lg:col-span-2">
        <Card className="bg-[#10182b] border-purple-500/20 h-full">
          <CardHeader>
            <CardTitle className="text-white">Hunt Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] lg:h-[500px]">
              <div className="space-y-2">
                {huntResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hunts yet. Start hunting to see your results here!
                  </p>
                ) : (
                  huntResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-[#0b0f19] rounded-lg border border-gray-800 animate-slide-in"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {result.animal && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{result.animal.emoji}</span>
                              <Badge 
                                variant="secondary"
                                style={{ 
                                  backgroundColor: `${RARITY_COLORS[result.animal.rarity]}20`,
                                  color: RARITY_COLORS[result.animal.rarity],
                                  borderColor: RARITY_COLORS[result.animal.rarity],
                                }}
                                className="border"
                              >
                                {result.animal.rarity}
                              </Badge>
                              {result.isNew && (
                                <Badge variant="default" className="bg-green-600">
                                  NEW
                                </Badge>
                              )}
                            </div>
                          )}
                          <p className="text-white font-medium">
                            {result.animal?.displayName || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            +{result.zooPointsGained} Zoo Points | +{result.xpGained} XP
                          </p>
                        </div>
                        <span className="text-gray-500 text-xs">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
