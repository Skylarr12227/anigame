import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gamepad2, UserPlus, LogIn, Trophy, Target, Zap } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<boolean>;
  onRegister: (credentials: { username: string; email: string; password: string }) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
}

export function LoginScreen({ 
  onLogin, 
  onRegister, 
  error, 
  clearError,
  onLoginSuccess,
  onRegisterSuccess 
}: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    const success = await onLogin({ username, password });
    if (success) {
      onLoginSuccess();
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    const success = await onRegister({ username, email, password });
    if (success) {
      onRegisterSuccess();
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] grid-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🐉</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🦁</div>
        <div className="absolute bottom-32 left-20 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🦅</div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🐺</div>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <Gamepad2 className="w-12 h-12 text-purple-500" />
            <h1 className="display-font text-4xl md:text-5xl font-bold text-white">
              CREATURE
              <span className="text-purple-500 block">COLLECTOR</span>
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg mb-8">
            Hunt, collect, and battle with creatures in this multiplayer text-based adventure!
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-white font-semibold">Hunt</p>
              <p className="text-gray-500 text-sm">Catch creatures</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-white font-semibold">Battle</p>
              <p className="text-gray-500 text-sm">PvP combat</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-white font-semibold">Collect</p>
              <p className="text-gray-500 text-sm">Build your zoo</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <Card className="bg-[#10182b] border-purple-500/20">
          <CardHeader>
            <CardTitle className="display-font text-2xl text-white text-center">
              Welcome Hunter
            </CardTitle>
            <CardDescription className="text-center">
              Enter the wilderness and start your adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#0b0f19] border-gray-700"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#0b0f19] border-gray-700"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Enter the Wild'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#0b0f19] border-gray-700"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#0b0f19] border-gray-700"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#0b0f19] border-gray-700"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Start Adventure'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
