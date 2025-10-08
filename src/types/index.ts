
export type UserRole = 'admin' | 'agent' | 'customer';

export interface User {
  id: string;
  fullname: string;
  email: string;
  bio?: string;
  password: string
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'open' | 'inprogress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  title: string;
  userName: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedAgentId?: string;
  assignedAgentName: string;
  createdAt: Date;
  userId?: string
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  ticketId: string;
  customerId: string;
  ratingNumber: number;
  description: string;
  agentReply?: string;
  agentId?: string;
  repliedAt?: Date;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
