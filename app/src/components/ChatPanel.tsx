import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import type { ChatMessage } from '@/types/game';
import { Send, Users } from 'lucide-react';

interface ChatPanelProps {
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setEventHandlers } = useSocket();

  useEffect(() => {
    setEventHandlers({
      onChatMessage: (message) => {
        setMessages(prev => [...prev, message].slice(-100));
      },
      onAnnouncement: (data) => {
        const announcementMsg: ChatMessage = {
          username: 'System',
          content: data.message,
          timestamp: new Date().toISOString(),
          type: 'announcement',
        };
        setMessages(prev => [...prev, announcementMsg].slice(-100));
      },
      onUserJoined: () => {
        setOnlineCount(prev => prev + 1);
      },
      onUserLeft: () => {
        setOnlineCount(prev => Math.max(1, prev - 1));
      },
    });
  }, [setEventHandlers]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-purple-500/20 flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Global Chat
        </h3>
        <span className="text-gray-400 text-sm">{onlineCount} online</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center text-sm py-4">
              Welcome to the chat! Be respectful to other players.
            </p>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`text-sm ${
                msg.type === 'system' ? 'text-yellow-400 italic' :
                msg.type === 'announcement' ? 'text-purple-400 font-medium' :
                ''
              }`}
            >
              {msg.type !== 'system' && msg.type !== 'announcement' && (
                <span className="text-gray-500 text-xs">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {msg.username !== 'System' && (
                <span className="text-purple-400 font-medium ml-1">{msg.username}:</span>
              )}
              <span className="text-gray-300 ml-1">{msg.content}</span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-purple-500/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={500}
            className="bg-[#0b0f19] border-gray-700 flex-1"
          />
          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
