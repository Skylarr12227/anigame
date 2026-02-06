import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import { RARITY_COLORS, RARITY_EMOJIS } from '@/types/game';
import type { Rarity } from '@/types/game';
import { PawPrint, Trophy, Target } from 'lucide-react';

interface ZooData {
  totalSpecies: number;
  uniqueSpecies: number;
  totalZooPoints: number;
  byRarity: Record<string, { count: number; species: string[] }>;
}

export function ZooTab() {
  const [zooData, setZooData] = useState<ZooData | null>(null);
  const { actions, setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onZooData: (data) => {
        setZooData(data);
      },
    });
  }, [setEventHandlers]);

  // Request zoo data on mount and when tab is active
  useEffect(() => {
    actions.getZoo();
  }, [actions]);

  if (!zooData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading zoo data...</p>
      </div>
    );
  }

  const rarityOrder: Rarity[] = ['ULTRA', 'LEGENDARY', 'MYTHICAL', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];

  return (
    <div className="space-y-6">
      {/* Stats header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Catches</p>
                <p className="text-3xl font-bold text-white">{zooData.totalSpecies}</p>
              </div>
              <Target className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10182b] border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Species</p>
                <p className="text-3xl font-bold text-white">{zooData.uniqueSpecies}</p>
              </div>
              <PawPrint className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10182b] border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Zoo Points</p>
                <p className="text-3xl font-bold text-purple-400">{zooData.totalZooPoints.toLocaleString()}</p>
              </div>
              <Trophy className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection by rarity */}
      <div className="grid gap-4">
        {rarityOrder.map((rarity) => {
          const data = zooData.byRarity[rarity];
          if (!data || data.count === 0) return null;

          return (
            <Card 
              key={rarity} 
              className="bg-[#10182b] border-purple-500/20"
              style={{ borderLeftColor: RARITY_COLORS[rarity], borderLeftWidth: '4px' }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{RARITY_EMOJIS[rarity]}</span>
                  <span style={{ color: RARITY_COLORS[rarity] }}>
                    {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {data.count} caught
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-2">
                    {data.species.map((speciesName, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="bg-[#0b0f19]"
                        style={{ borderColor: RARITY_COLORS[rarity], color: RARITY_COLORS[rarity] }}
                      >
                        {speciesName}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}

        {zooData.uniqueSpecies === 0 && (
          <Card className="bg-[#10182b] border-purple-500/20">
            <CardContent className="py-12 text-center">
              <PawPrint className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Your zoo is empty!</p>
              <p className="text-gray-500">Start hunting to collect creatures.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
