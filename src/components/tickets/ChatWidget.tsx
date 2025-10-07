import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { format } from 'date-fns';
import { mockUsers } from '@/lib/mockData';

interface ChatWidgetProps {
  ticketId: string;
}

export function ChatWidget({ ticketId }: ChatWidgetProps) {
  const { user } = useAuth();
  const { messages: allMessages, addMessage } = useTickets();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const messages = allMessages.filter(m => m.ticketId === ticketId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate receiving messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && user?.role === 'customer') {
        const supportAgents = mockUsers.filter(u => u.role === 'support_agent');
        const randomAgent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
        
        const responses = [
          'We are looking into this issue.',
          'Can you provide more details?',
          'This should be resolved shortly.',
          'Thank you for your patience.',
        ];
        
        addMessage({
          ticketId,
          senderId: randomAgent.id,
          content: responses[Math.floor(Math.random() * responses.length)],
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [ticketId, user, addMessage]);

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;

    addMessage({
      ticketId,
      senderId: user.id,
      content: newMessage,
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Support Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map(message => {
              const sender = mockUsers.find(u => u.id === message.senderId);
              const isCurrentUser = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={sender?.avatar} />
                    <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{sender?.name}</span>
                      <span>{format(message.createdAt, 'HH:mm')}</span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-md ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSend} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
