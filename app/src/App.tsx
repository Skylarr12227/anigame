import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { LoginScreen } from '@/components/LoginScreen';
import { GameInterface } from '@/components/GameInterface';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const auth = useAuth();
  const { state: socketState, actions: socketActions, setEventHandlers } = useSocket();
  const {
    authenticate,
    getPets,
    getBattleTeams,
    getInventory,
  } = socketActions;

  // Set up socket event handlers
  useEffect(() => {
    setEventHandlers({
      onAuthenticated: () => {
        toast.success('Connected to game server!');
        // Request initial data
        getPets();
        getBattleTeams();
        getInventory();
      },
      onAuthError: (error) => {
        toast.error(`Connection failed: ${error}`);
        auth.logout();
      },
      onError: (error) => {
        toast.error(error);
      },
      onAnnouncement: (data) => {
        toast.info(data.message, { duration: 5000 });
      },
      onUserJoined: (data) => {
        toast.info(`${data.username} joined the game`, { duration: 2000 });
      },
      onUserLeft: (data) => {
        toast.info(`${data.username} left the game`, { duration: 2000 });
      },
    });
  }, [setEventHandlers, getPets, getBattleTeams, getInventory, auth.logout]);

  // Authenticate socket when token is available
  useEffect(() => {
    if (auth.token && socketState.connected && !socketState.authenticated) {
      authenticate(auth.token);
    }
  }, [auth.token, socketState.connected, socketState.authenticated, authenticate]);

  // Handle login success
  const handleLoginSuccess = useCallback(() => {
    if (auth.token) {
      authenticate(auth.token);
    }
  }, [auth.token, authenticate]);

  // Handle register success
  const handleRegisterSuccess = useCallback(() => {
    if (auth.token) {
      authenticate(auth.token);
    }
  }, [auth.token, authenticate]);

  // Show loading while checking auth
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎮</div>
          <p className="text-white display-font text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <>
        <LoginScreen 
          onLogin={auth.login}
          onRegister={auth.register}
          error={auth.error}
          clearError={auth.clearError}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
        <Toaster />
      </>
    );
  }

  // Show game interface
  return (
    <>
      <GameInterface 
        user={socketState.user || auth.user}
        socketState={socketState}
        socketActions={socketActions}
        onLogout={auth.logout}
      />
      <Toaster />
    </>
  );
}

export default App;
