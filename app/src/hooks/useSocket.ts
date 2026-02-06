import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  User, Pet, BattleTeam, BattleResult, HuntResult, 
  Item, Inventory, ChatMessage, 
  LeaderboardEntry, BattleLeaderboardEntry, PetLeaderboardEntry 
} from '@/types/game';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketState {
  connected: boolean;
  authenticated: boolean;
  user: User | null;
}

interface SocketEvents {
  // Auth
  onAuthenticated: (data: { userId: string; username: string }) => void;
  onAuthError: (error: string) => void;
  
  // User data
  onUserData: (user: User & { pets: Pet[]; battleTeams: BattleTeam[] }) => void;
  
  // Hunting
  onHuntResult: (result: HuntResult) => void;
  onMultiHuntResult: (result: { success: boolean; message: string; hunts: HuntResult[]; totalCurrencySpent: number; totalZooPointsGained: number; remainingCurrency: number }) => void;
  
  // Pets
  onPetsData: (pets: Pet[]) => void;
  onSellResult: (result: { success: boolean; message: string; currencyGained: number; newCurrency: number }) => void;
  onNicknameResult: (result: { success: boolean; message: string }) => void;
  
  // Zoo
  onZooData: (zoo: { totalSpecies: number; uniqueSpecies: number; totalZooPoints: number; byRarity: Record<string, { count: number; species: string[] }> }) => void;
  
  // Battle
  onBattleTeamsData: (teams: BattleTeam[]) => void;
  onTeamUpdated: (result: { success: boolean }) => void;
  onBattleFound: (data: { opponent: string }) => void;
  onBattleError: (error: string) => void;
  onBattleResult: (result: BattleResult & { isPlayer1?: boolean; isNpc?: boolean }) => void;
  onBattleHistory: (history: { battles: Array<{ id: string; opponent: string; result: 'win' | 'loss' | 'draw'; turns: number; date: string }> }) => void;
  
  // Economy
  onDailyResult: (result: { success: boolean; message: string; currencyReceived: number; streak: number; nextDaily: string }) => void;
  onShopData: (shop: { items: Item[]; weapons: Array<Item & { stats: { pAtk: number; mAtk: number; energyCost: number } }> }) => void;
  onInventoryData: (inventory: Inventory) => void;
  onBuyResult: (result: { success: boolean; message: string; remainingCurrency: number }) => void;
  onSellItemResult: (result: { success: boolean; message: string; currencyGained: number; newCurrency: number }) => void;
  onUseResult: (result: { success: boolean; message: string; effect?: unknown }) => void;
  onBuyWeaponResult: (result: { success: boolean; message: string; remainingCurrency: number }) => void;
  onEquipResult: (result: { success: boolean; message: string }) => void;
  onUnequipResult: (result: { success: boolean; message: string }) => void;
  
  // Chat
  onChatMessage: (message: ChatMessage) => void;
  onAnnouncement: (data: { type: string; message: string }) => void;
  
  // Leaderboards
  onLeaderboardsData: (data: { 
    zoo: LeaderboardEntry[]; 
    battle: BattleLeaderboardEntry[]; 
    pets: PetLeaderboardEntry[];
  }) => void;
  
  // Hunt stats
  onHuntStats: (stats: { totalAnimals: number; byRarity: Record<string, number>; rarityChances: Record<string, string> }) => void;
  
  // Users
  onUserJoined: (data: { username: string }) => void;
  onUserLeft: (data: { username: string }) => void;
  
  // Error
  onError: (error: string) => void;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    authenticated: false,
    user: null,
  });
  
  const [events, setEvents] = useState<Partial<SocketEvents>>({});

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setState(prev => ({ ...prev, connected: true }));
      
      // Try to authenticate if token exists
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('authenticate', token);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setState(prev => ({ ...prev, connected: false, authenticated: false }));
    });

    socket.on('authenticated', (data) => {
      setState(prev => ({ ...prev, authenticated: true }));
      events.onAuthenticated?.(data);
    });

    socket.on('auth_error', (error) => {
      localStorage.removeItem('token');
      setState(prev => ({ ...prev, authenticated: false }));
      events.onAuthError?.(error);
    });

    // User data
    socket.on('user_data', (data) => {
      setState(prev => ({ ...prev, user: data }));
      events.onUserData?.(data);
    });

    // Hunting
    socket.on('hunt_result', (result) => events.onHuntResult?.(result));
    socket.on('multi_hunt_result', (result) => events.onMultiHuntResult?.(result));

    // Pets
    socket.on('pets_data', (pets) => events.onPetsData?.(pets));
    socket.on('sell_result', (result) => events.onSellResult?.(result));
    socket.on('nickname_result', (result) => events.onNicknameResult?.(result));

    // Zoo
    socket.on('zoo_data', (zoo) => events.onZooData?.(zoo));

    // Battle
    socket.on('battle_teams_data', (teams) => events.onBattleTeamsData?.(teams));
    socket.on('team_updated', (result) => events.onTeamUpdated?.(result));
    socket.on('battle_found', (data) => events.onBattleFound?.(data));
    socket.on('battle_error', (error) => events.onBattleError?.(error));
    socket.on('battle_result', (result) => events.onBattleResult?.(result));
    socket.on('battle_history', (history) => events.onBattleHistory?.(history));

    // Economy
    socket.on('daily_result', (result) => events.onDailyResult?.(result));
    socket.on('shop_data', (shop) => events.onShopData?.(shop));
    socket.on('inventory_data', (inventory) => events.onInventoryData?.(inventory));
    socket.on('buy_result', (result) => events.onBuyResult?.(result));
    socket.on('sell_item_result', (result) => events.onSellItemResult?.(result));
    socket.on('use_result', (result) => events.onUseResult?.(result));
    socket.on('buy_weapon_result', (result) => events.onBuyWeaponResult?.(result));
    socket.on('equip_result', (result) => events.onEquipResult?.(result));
    socket.on('unequip_result', (result) => events.onUnequipResult?.(result));

    // Chat
    socket.on('chat_message', (message) => events.onChatMessage?.(message));
    socket.on('announcement', (data) => events.onAnnouncement?.(data));

    // Leaderboards
    socket.on('leaderboards_data', (data) => events.onLeaderboardsData?.(data));

    // Hunt stats
    socket.on('hunt_stats', (stats) => events.onHuntStats?.(stats));

    // Users
    socket.on('user_joined', (data) => events.onUserJoined?.(data));
    socket.on('user_left', (data) => events.onUserLeft?.(data));

    // Error
    socket.on('error', (error) => events.onError?.(error));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update event handlers when they change
  useEffect(() => {
    if (!socketRef.current) return;
    
    const socket = socketRef.current;
    
    // Re-bind all event handlers
    socket.off('authenticated').on('authenticated', (data) => {
      setState(prev => ({ ...prev, authenticated: true }));
      events.onAuthenticated?.(data);
    });
    
    socket.off('auth_error').on('auth_error', (error) => {
      localStorage.removeItem('token');
      setState(prev => ({ ...prev, authenticated: false }));
      events.onAuthError?.(error);
    });
    
    socket.off('hunt_result').on('hunt_result', (result) => events.onHuntResult?.(result));
    socket.off('multi_hunt_result').on('multi_hunt_result', (result) => events.onMultiHuntResult?.(result));
    socket.off('pets_data').on('pets_data', (pets) => events.onPetsData?.(pets));
    socket.off('sell_result').on('sell_result', (result) => events.onSellResult?.(result));
    socket.off('nickname_result').on('nickname_result', (result) => events.onNicknameResult?.(result));
    socket.off('zoo_data').on('zoo_data', (zoo) => events.onZooData?.(zoo));
    socket.off('battle_teams_data').on('battle_teams_data', (teams) => events.onBattleTeamsData?.(teams));
    socket.off('team_updated').on('team_updated', (result) => events.onTeamUpdated?.(result));
    socket.off('battle_found').on('battle_found', (data) => events.onBattleFound?.(data));
    socket.off('battle_error').on('battle_error', (error) => events.onBattleError?.(error));
    socket.off('battle_result').on('battle_result', (result) => events.onBattleResult?.(result));
    socket.off('battle_history').on('battle_history', (history) => events.onBattleHistory?.(history));
    socket.off('daily_result').on('daily_result', (result) => events.onDailyResult?.(result));
    socket.off('shop_data').on('shop_data', (shop) => events.onShopData?.(shop));
    socket.off('inventory_data').on('inventory_data', (inventory) => events.onInventoryData?.(inventory));
    socket.off('buy_result').on('buy_result', (result) => events.onBuyResult?.(result));
    socket.off('sell_item_result').on('sell_item_result', (result) => events.onSellItemResult?.(result));
    socket.off('use_result').on('use_result', (result) => events.onUseResult?.(result));
    socket.off('buy_weapon_result').on('buy_weapon_result', (result) => events.onBuyWeaponResult?.(result));
    socket.off('equip_result').on('equip_result', (result) => events.onEquipResult?.(result));
    socket.off('unequip_result').on('unequip_result', (result) => events.onUnequipResult?.(result));
    socket.off('chat_message').on('chat_message', (message) => events.onChatMessage?.(message));
    socket.off('announcement').on('announcement', (data) => events.onAnnouncement?.(data));
    socket.off('leaderboards_data').on('leaderboards_data', (data) => events.onLeaderboardsData?.(data));
    socket.off('hunt_stats').on('hunt_stats', (stats) => events.onHuntStats?.(stats));
    socket.off('user_joined').on('user_joined', (data) => events.onUserJoined?.(data));
    socket.off('user_left').on('user_left', (data) => events.onUserLeft?.(data));
    socket.off('error').on('error', (error) => events.onError?.(error));
  }, [events]);

  // Actions
  const authenticate = useCallback((token: string) => {
    socketRef.current?.emit('authenticate', token);
  }, []);

  const hunt = useCallback(() => {
    socketRef.current?.emit('hunt');
  }, []);

  const multiHunt = useCallback(() => {
    socketRef.current?.emit('multi_hunt');
  }, []);

  const getPets = useCallback(() => {
    socketRef.current?.emit('get_pets');
  }, []);

  const sellPet = useCallback((petId: string) => {
    socketRef.current?.emit('sell_pet', petId);
  }, []);

  const nicknamePet = useCallback((petId: string, nickname: string) => {
    socketRef.current?.emit('nickname_pet', { petId, nickname });
  }, []);

  const getZoo = useCallback(() => {
    socketRef.current?.emit('get_zoo');
  }, []);

  const getBattleTeams = useCallback(() => {
    socketRef.current?.emit('get_battle_teams');
  }, []);

  const updateTeam = useCallback((teamId: string, petIds: string[]) => {
    socketRef.current?.emit('update_team', { teamId, petIds });
  }, []);

  const findBattle = useCallback(() => {
    socketRef.current?.emit('find_battle');
  }, []);

  const battleNpc = useCallback((difficulty: number) => {
    socketRef.current?.emit('battle_npc', difficulty);
  }, []);

  const getBattleHistory = useCallback(() => {
    socketRef.current?.emit('get_battle_history');
  }, []);

  const claimDaily = useCallback(() => {
    socketRef.current?.emit('daily');
  }, []);

  const getShop = useCallback(() => {
    socketRef.current?.emit('get_shop');
  }, []);

  const getInventory = useCallback(() => {
    socketRef.current?.emit('get_inventory');
  }, []);

  const buyItem = useCallback((itemId: string, quantity: number = 1) => {
    socketRef.current?.emit('buy_item', { itemId, quantity });
  }, []);

  const sellItem = useCallback((itemId: string, quantity: number = 1) => {
    socketRef.current?.emit('sell_item', { itemId, quantity });
  }, []);

  const useItem = useCallback((itemId: string) => {
    socketRef.current?.emit('use_item', itemId);
  }, []);

  const buyWeapon = useCallback((weaponId: string) => {
    socketRef.current?.emit('buy_weapon', weaponId);
  }, []);

  const equipWeapon = useCallback((petId: string, weaponId: string) => {
    socketRef.current?.emit('equip_weapon', { petId, weaponId });
  }, []);

  const unequipWeapon = useCallback((petId: string) => {
    socketRef.current?.emit('unequip_weapon', petId);
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    socketRef.current?.emit('chat_message', content);
  }, []);

  const getLeaderboards = useCallback(() => {
    socketRef.current?.emit('get_leaderboards');
  }, []);

  const getHuntStats = useCallback(() => {
    socketRef.current?.emit('get_hunt_stats');
  }, []);

  const setEventHandlers = useCallback((handlers: Partial<SocketEvents>) => {
    setEvents(handlers);
  }, []);

  return {
    socket: socketRef.current,
    state,
    actions: {
      authenticate,
      hunt,
      multiHunt,
      getPets,
      sellPet,
      nicknamePet,
      getZoo,
      getBattleTeams,
      updateTeam,
      findBattle,
      battleNpc,
      getBattleHistory,
      claimDaily,
      getShop,
      getInventory,
      buyItem,
      sellItem,
      useItem,
      buyWeapon,
      equipWeapon,
      unequipWeapon,
      sendChatMessage,
      getLeaderboards,
      getHuntStats,
    },
    setEventHandlers,
  };
}
