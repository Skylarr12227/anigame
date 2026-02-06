import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import type { Item } from '@/types/game';
import { ShoppingCart, Package, Sword, Gift, Coins, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ShopItem extends Item {
  stats?: {
    pAtk: number;
    mAtk: number;
    energyCost: number;
  };
}

export function ShopTab() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [weapons, setWeapons] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<{ currency: number; items: Item[] }>({ currency: 0, items: [] });
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const { actions, setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onShopData: (data) => {
        setItems(data.items);
        setWeapons(data.weapons);
      },
      onInventoryData: (data) => {
        setInventory(data);
      },
      onDailyResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          setDailyClaimed(true);
          actions.getInventory();
        } else {
          toast.error(result.message);
        }
      },
      onBuyResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          actions.getInventory();
          actions.getShop();
        } else {
          toast.error(result.message);
        }
      },
      onBuyWeaponResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          actions.getInventory();
        } else {
          toast.error(result.message);
        }
      },
      onUseResult: (result) => {
        if (result.success) {
          toast.success(result.message);
          actions.getInventory();
        } else {
          toast.error(result.message);
        }
      },
    });
  }, [setEventHandlers, actions]);

  // Request data on mount
  useEffect(() => {
    actions.getShop();
    actions.getInventory();
  }, [actions]);

  const handleBuyItem = (itemId: string) => {
    actions.buyItem(itemId, 1);
  };

  const handleBuyWeapon = (weaponId: string) => {
    actions.buyWeapon(weaponId);
  };

  const handleUseItem = (itemId: string) => {
    actions.useItem(itemId);
  };

  const handleDaily = () => {
    actions.claimDaily();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left sidebar - Currency & Daily */}
      <div className="space-y-4">
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              Your Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-400">
              {inventory.currency.toLocaleString()}💰
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Daily Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Claim your daily reward! Streaks increase your bonus.
            </p>
            <Button 
              onClick={handleDaily}
              disabled={dailyClaimed}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {dailyClaimed ? 'Claimed!' : 'Claim Daily'}
            </Button>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Your Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {inventory.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items yet!</p>
                ) : (
                  inventory.items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-[#0b0f19] rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <p className="text-white text-sm">{item.displayName}</p>
                          <p className="text-gray-500 text-xs">x{item.quantity}</p>
                        </div>
                      </div>
                      {item.type === 'CONSUMABLE' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUseItem(item.id)}
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Shop items */}
      <div className="lg:col-span-2">
        <Card className="bg-[#10182b] border-purple-500/20 h-full">
          <CardHeader>
            <CardTitle className="display-font text-xl text-white flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-purple-500" />
              Shop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="items">
              <TabsList className="mb-4">
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Items
                </TabsTrigger>
                <TabsTrigger value="weapons" className="flex items-center gap-2">
                  <Sword className="w-4 h-4" />
                  Weapons
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-[#0b0f19] border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{item.emoji}</span>
                            <div>
                              <p className="text-white font-medium">{item.displayName}</p>
                              <p className="text-gray-400 text-sm">{item.description}</p>
                              <Badge variant="secondary" className="mt-1">
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold">{item.buyPrice}💰</p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleBuyItem(item.id)}
                              disabled={!item.buyPrice || inventory.currency < item.buyPrice}
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="weapons">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weapons.map((weapon) => (
                    <Card key={weapon.id} className="bg-[#0b0f19] border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{weapon.emoji}</span>
                            <div>
                              <p className="text-white font-medium">{weapon.displayName}</p>
                              <p className="text-gray-400 text-sm">{weapon.description}</p>
                              {weapon.stats && (
                                <div className="flex gap-2 mt-1 text-xs">
                                  <span className="text-orange-400">+{weapon.stats.pAtk} PATK</span>
                                  <span className="text-purple-400">+{weapon.stats.mAtk} MATK</span>
                                  <span className="text-yellow-400">{weapon.stats.energyCost} EN</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold">{weapon.buyPrice}💰</p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleBuyWeapon(weapon.id)}
                              disabled={!weapon.buyPrice || inventory.currency < (weapon.buyPrice || 0)}
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
