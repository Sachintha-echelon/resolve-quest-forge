/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Edit, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  edited?: boolean;
}

interface ChatWidgetProps {
  ticketId: string;
}

export function ChatWidget({ ticketId }: ChatWidgetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMsgId, setEditMsgId] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chats/ticket/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();

      // Handle MongoDB _id format
      const formattedMessages = data.messages.map((msg: any) => ({
        ...msg,
        _id: msg._id?.$oid || msg._id,
        timestamp: msg.timestamp?.$date?.$numberLong
          ? new Date(parseInt(msg.timestamp.$date.$numberLong)).toISOString()
          : msg.timestamp
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [ticketId]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;


    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chats/ticket/${ticketId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.fullname,
          senderRole: user.role,
          message: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const handleEdit = async (messageId: string) => {
    if (!editContent.trim()) return;
    setEditMsgId(messageId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chats/ticket/${ticketId}/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: editContent.trim(),
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to edit message');
      }

      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, message: editContent.trim(), edited: true } : msg
      ));
      setEditingMessageId(null);
      setEditContent('');
      toast.success('Message updated successfully');
    } catch (err) {
      console.error('Error editing message:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to edit message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chats/ticket/${ticketId}/message/${messageId}/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Support Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Support Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              const isEditable = isCurrentUser && message.senderRole === user?.role;

              return (
                <div
                  key={message._id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{message.senderName}</span>
                      <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                      {message.edited && (
                        <span className="text-xs italic">(edited)</span>
                      )}
                    </div>

                    {editingMessageId === message._id ? (
                      <div className="flex flex-col gap-2 w-full max-w-md">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMessageId(null);
                              setEditContent('');
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEdit(message._id)}
                            disabled={!editContent.trim()}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-lg px-4 py-2 max-w-md ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        {isEditable && (
                          <div className="flex gap-1 mt-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMessageId(message._id);
                                setEditContent(message.message);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(message._id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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