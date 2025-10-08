import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Plus, Search, Filter, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketStatus, TicketPriority, Ticket } from '@/types';

interface Review {
  id: string;
  ticketId: string;
  username: string;
  description: string;
  ratingNumber: number;
  ticketTitle: string;
  agentReply?: string;
  agentId?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchReviews();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = 'http://localhost:3000/api/tickets';
      const params = new URLSearchParams();

      // Add filters based on user role
      if (user?.role === 'customer') {
        params.append('userId', user.id);
      } else if (user?.role === 'agent') {
        params.append('assignedAgentId', user.id);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingTicketId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${deletingTicketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete ticket');
      }

      toast.success('Ticket deleted successfully');
      setTickets(tickets.filter(ticket => ticket.id !== deletingTicketId));
      setDeletingTicketId(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete ticket');
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter tickets based on UI filters
  const filteredTickets: Ticket[] = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Add review information to tickets
  const ticketsWithReviews = filteredTickets.map(ticket => {
    const review = reviews.find(r => r.ticketId === ticket.id);
    return {
      ...ticket,
      review: review || null
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <div className="text-destructive text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTickets}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
            <p className="text-muted-foreground">
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {user.role === 'customer' && (
            <Button asChild>
              <Link to="/tickets/new">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketsWithReviews.map((ticket) => (
            <div key={ticket.id} className="relative group">
              <TicketCard ticket={ticket} />
              {user.role === 'customer' && ticket.customerId === user.id && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeletingTicketId(ticket.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              {/* Review Section for Resolved/Closed Tickets */}
              {user.role === 'customer' &&
                (ticket.status === 'resolved' || ticket.status === 'closed') &&
                !ticket.review && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Rate & Review
                    </Button>
                  </Link>
                </div>
              )}

              {/* Show existing review if available */}
              {ticket.review && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < ticket.review!.ratingNumber
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {ticket.review.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tickets match your filters</p>
            {search || statusFilter !== 'all' || priorityFilter !== 'all' ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : user.role === 'customer' ? (
              <Button asChild className="mt-4">
                <Link to="/tickets/new">Create Your First Ticket</Link>
              </Button>
            ) : null}
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingTicketId} onOpenChange={(open) => !open && setDeletingTicketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ticket and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}