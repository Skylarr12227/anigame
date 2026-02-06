import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSocket } from '@/hooks/useSocket';
import type { Pet } from '@/types/game';
import { RARITY_COLORS } from '@/types/game';
import { Zap, Heart, Sword, Shield, Sparkles, Edit2, Coins } from 'lucide-react';
import { toast } from 'sonner';

export function PetsTab() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [newNickname, setNewNickname] = useState('');

  const { actions, setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onPetsData: (data) => {
        setPets(data);
      },
      onSellResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          actions.getPets();
          actions.getInventory();
        } else {
          toast.error(result.message);
        }
      },
      onNicknameResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          actions.getPets();
          setNicknameDialogOpen(false);
        } else {
          toast.error(result.message);
        }
      },
    });
  }, [setEventHandlers, actions]);

  // Request pets on mount
  useEffect(() => {
    actions.getPets();
  }, [actions]);

  const handleSell = (petId: string) => {
    if (confirm('Are you sure you want to sell this pet? This cannot be undone.')) {
      actions.sellPet(petId);
    }
  };

  const handleNickname = (pet: Pet) => {
    setSelectedPet(pet);
    setNewNickname(pet.nickname || '');
    setNicknameDialogOpen(true);
  };

  const submitNickname = () => {
    if (selectedPet) {
      actions.nicknamePet(selectedPet.id, newNickname);
    }
  };

  const getXpPercentage = (pet: Pet) => {
    // Simplified XP calculation for display
    const xpForNextLevel = pet.level * pet.level * 100;
    return Math.min(100, (pet.xp / xpForNextLevel) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white display-font">Your Pets</h2>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
          {pets.length} pets
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <Card 
            key={pet.id} 
            className="bg-[#10182b] border-purple-500/20 card-hover"
            style={{ borderTopColor: RARITY_COLORS[pet.species.rarity], borderTopWidth: '3px' }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{pet.species.emoji}</span>
                  <div>
                    <CardTitle className="text-lg text-white">
                      {pet.nickname || pet.species.displayName}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{pet.species.displayName}</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: `${RARITY_COLORS[pet.species.rarity]}20`,
                    color: RARITY_COLORS[pet.species.rarity],
                  }}
                >
                  Lv.{pet.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* XP Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>XP</span>
                  <span>{pet.xp} / {pet.level * pet.level * 100}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${getXpPercentage(pet)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{pet.currentHp}/{pet.maxHp} HP</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{pet.currentEnergy}/{pet.maxEnergy} EN</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Sword className="w-4 h-4 text-orange-500" />
                  <span>{pet.pAtk} ATK</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>{pet.pDef} DEF</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>{pet.mAtk} MATK</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  <span>{pet.mDef} MDEF</span>
                </div>
              </div>

              {/* Weapon */}
              {pet.weapon && (
                <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 p-2 rounded">
                  <span>{pet.weapon.emoji}</span>
                  <span>{pet.weapon.displayName}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleNickname(pet)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Rename
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleSell(pet.id)}
                >
                  <Coins className="w-4 h-4 mr-1" />
                  Sell
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pets.length === 0 && (
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardContent className="py-12 text-center">
            <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No pets yet!</p>
            <p className="text-gray-500">Go hunt to catch your first creature.</p>
          </CardContent>
        </Card>
      )}

      {/* Nickname Dialog */}
      <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
        <DialogContent className="bg-[#10182b] border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Pet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="Enter new nickname"
              maxLength={20}
              className="bg-[#0b0f19] border-gray-700"
            />
            <Button onClick={submitNickname} className="w-full bg-purple-600">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
