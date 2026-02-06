import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSocket } from '@/hooks/useSocket';
import type { BattleTeam, Pet, BattleResult } from '@/types/game';
import { Swords, Users, Bot, History, Trophy, Skull, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function BattleTab() {
  const [teams, setTeams] = useState<BattleTeam[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [battleHistory, setBattleHistory] = useState<Array<{ id: string; opponent: string; result: 'win' | 'loss' | 'draw'; turns: number; date: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [battleNpcLevel, setBattleNpcLevel] = useState(1);
  const [showBattleLog, setShowBattleLog] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { actions, setEventHandlers } = useSocket();
  const battleLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEventHandlers({
      onBattleTeamsData: (data) => {
        setTeams(data);
      },
      onPetsData: (data) => {
        setPets(data);
      },
      onBattleFound: () => {
        toast.info('Opponent found! Battle starting...');
      },
      onBattleError: (error) => {
        setSearching(false);
        toast.error(error);
      },
      onBattleResult: (result) => {
        setSearching(false);
        setBattleResult(result);
        setShowBattleLog(true);
        setCurrentActionIndex(0);
        
        if (result.success) {
          const message = result.isDraw 
            ? 'Battle ended in a draw!' 
            : result.isPlayer1 === (result.winner === result.message.match(/\*\*(.*?)\*\*/)?.[1])
              ? 'You won the battle!'
              : 'You lost the battle!';
          
          toast.success(message, {
            description: `XP Gained: ${result.isPlayer1 ? result.team1Xp : result.team2Xp}`,
          });
        }
        
        actions.getBattleHistory();
        actions.getPets();
      },
      onBattleHistory: (history) => {
        setBattleHistory(history.battles);
      },
    });
  }, [setEventHandlers, actions]);

  // Request data on mount
  useEffect(() => {
    actions.getBattleTeams();
    actions.getPets();
    actions.getBattleHistory();
  }, [actions]);

  // Animate battle log
  useEffect(() => {
    if (showBattleLog && battleResult && currentActionIndex < battleResult.actions.length) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentActionIndex(prev => prev + 1);
        battleLogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentActionIndex >= (battleResult?.actions.length || 0)) {
      setIsAnimating(false);
    }
  }, [showBattleLog, battleResult, currentActionIndex]);

  const handleFindBattle = () => {
    setSearching(true);
    actions.findBattle();
  };

  const handleBattleNpc = () => {
    setSearching(true);
    actions.battleNpc(battleNpcLevel);
  };

  const handleUpdateTeam = (teamId: string, slot: number, petId: string | null) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const petIds = [
      slot === 1 ? petId : team.pet1Id,
      slot === 2 ? petId : team.pet2Id,
      slot === 3 ? petId : team.pet3Id,
    ].filter(Boolean) as string[];

    actions.updateTeam(teamId, petIds);
  };

  const activeTeam = teams.find(t => t.isActive);

  return (
    <div className="space-y-6">
      {/* Battle controls */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="display-font text-xl text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-500" />
              PvP Battle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Find an opponent and battle in real-time! Win to earn XP and climb the rankings.
            </p>
            
            <Button 
              onClick={handleFindBattle}
              disabled={searching || !activeTeam}
              className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg"
            >
              {searching ? (
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Users className="w-5 h-5 mr-2" />
              )}
              {searching ? 'Searching...' : 'Find Opponent'}
            </Button>

            {!activeTeam && (
              <p className="text-yellow-400 text-sm">Set up your battle team first!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="display-font text-xl text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-500" />
              Practice (PvE)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Battle against AI opponents to practice and earn XP.
            </p>
            
            <div className="flex gap-2">
              <Select value={battleNpcLevel.toString()} onValueChange={(v) => setBattleNpcLevel(parseInt(v))}>
                <SelectTrigger className="w-32 bg-[#0b0f19]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleBattleNpc}
                disabled={searching || !activeTeam}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {searching ? (
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Bot className="w-5 h-5 mr-2" />
                )}
                Battle NPC
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team management */}
      <Card className="bg-[#10182b] border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Battle Team</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTeam ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => {
                const currentPetId = slot === 1 ? activeTeam.pet1Id : slot === 2 ? activeTeam.pet2Id : activeTeam.pet3Id;
                const currentPet = pets.find(p => p.id === currentPetId);
                
                return (
                  <div key={slot} className="space-y-2">
                    <label className="text-gray-400 text-sm">Slot {slot}</label>
                    <Select 
                      value={currentPetId || 'none'} 
                      onValueChange={(value) => handleUpdateTeam(activeTeam.id, slot, value === 'none' ? null : value)}
                    >
                      <SelectTrigger className="bg-[#0b0f19]">
                        <SelectValue placeholder="Select pet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Empty</SelectItem>
                        {pets.map(pet => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.nickname || pet.species.displayName} (Lv.{pet.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentPet && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{currentPet.species.emoji}</span>
                        <span>Lv.{currentPet.level}</span>
                        <span className="text-red-400">{currentPet.pAtk} ATK</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No active team found.</p>
          )}
        </CardContent>
      </Card>

      {/* Battle History */}
      <Card className="bg-[#10182b] border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Battle History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {battleHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No battles yet!</p>
              ) : (
                battleHistory.map((battle) => (
                  <div 
                    key={battle.id}
                    className="flex items-center justify-between p-2 bg-[#0b0f19] rounded"
                  >
                    <div className="flex items-center gap-2">
                      {battle.result === 'win' && <Trophy className="w-4 h-4 text-yellow-500" />}
                      {battle.result === 'loss' && <Skull className="w-4 h-4 text-red-500" />}
                      {battle.result === 'draw' && <Swords className="w-4 h-4 text-gray-500" />}
                      <span className="text-white">vs {battle.opponent}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={battle.result === 'win' ? 'default' : battle.result === 'loss' ? 'destructive' : 'secondary'}
                      >
                        {battle.result.toUpperCase()}
                      </Badge>
                      <span className="text-gray-500 text-sm">{battle.turns} turns</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Battle Log Dialog */}
      <Dialog open={showBattleLog} onOpenChange={setShowBattleLog}>
        <DialogContent className="bg-[#10182b] border-purple-500/20 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white display-font text-xl">
              {battleResult?.isDraw ? '🤝 Battle Draw!' : battleResult?.winner ? `🏆 ${battleResult.winner} Wins!` : 'Battle Ended'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh]">
            <div className="space-y-2" ref={battleLogRef}>
              {battleResult?.actions.slice(0, currentActionIndex).map((action, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded ${
                    action.isKO ? 'bg-red-500/20 border border-red-500/50' : 'bg-[#0b0f19]'
                  }`}
                >
                  <p className="text-gray-300">{action.message}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-red-400">-{action.damage} HP</span>
                    {action.isCrit && <span className="text-orange-400 font-bold">CRIT!</span>}
                    {action.isKO && <span className="text-red-500 font-bold">KO!</span>}
                    <span className="text-gray-500 ml-auto">
                      {action.target.name}: {action.remainingHp} HP
                    </span>
                  </div>
                </div>
              ))}
              {isAnimating && (
                <div className="flex justify-center py-4">
                  <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
          </ScrollArea>
          {!isAnimating && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">XP Gained:</span>
                <span className="text-yellow-400 font-bold">
                  +{battleResult?.team1Xp || 0}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
