import { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, Message, Review } from '@/types';
import { mockTickets, mockMessages, mockReviews } from '@/lib/mockData';

interface TicketContextType {
  tickets: Ticket[];
  messages: Message[];
  reviews: Review[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getTicketById: (id: string) => Ticket | undefined;
  getMessagesByTicket: (ticketId: string) => Message[];
  getReviewByTicket: (ticketId: string) => Review | undefined;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const createTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTickets([...tickets, newTicket]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date() }
        : ticket
    ));
  };

  const addMessage = (message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date(),
    };
    setReviews([...reviews, newReview]);
  };

  const getTicketById = (id: string) => tickets.find(t => t.id === id);
  const getMessagesByTicket = (ticketId: string) => messages.filter(m => m.ticketId === ticketId);
  const getReviewByTicket = (ticketId: string) => reviews.find(r => r.ticketId === ticketId);

  return (
    <TicketContext.Provider value={{
      tickets,
      messages,
      reviews,
      createTicket,
      updateTicket,
      addMessage,
      addReview,
      getTicketById,
      getMessagesByTicket,
      getReviewByTicket,
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
