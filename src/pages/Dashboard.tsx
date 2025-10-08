import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketIcon, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/types';

// interface Ticket {
//   id: string;
//   title: string;
//   description: string;
//   status: 'open' | 'inprogress' | 'resolved' | 'closed';
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   userEmail: string;
//   userName: string;
//   userId: string;
//   assignedAgentId?: string;
//   assignedAgentName?: string;
//   createdAt: string;
//   updatedAt: string;
// }

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      let url = 'http://localhost:3000/api/tickets';

      // Add role-based filtering
      if (user?.role === 'customer') {
        url += `?userId=${user.id}`;
      } else if (user?.role === 'agent') {
        url += `?assignedAgentId=${user.id}`;
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
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTickets}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Filter tickets based on user role
  const userTickets = user.role === 'customer'
    ? tickets.filter(t => t.userId === user.id)
    : user.role === 'agent'
    ? tickets.filter(t => t.assignedAgentId === user.id)
    : tickets;

  const openTickets = userTickets.filter(t => t.status === 'open').length;
  const inProgressTickets = userTickets.filter(t => t.status === 'inprogress').length;
  const resolvedTickets = userTickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = userTickets.filter(t => t.priority === 'urgent').length;

  const stats = [
    {
      title: 'Open Tickets',
      value: openTickets,
      icon: TicketIcon,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'In Progress',
      value: inProgressTickets,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Resolved',
      value: resolvedTickets,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Urgent',
      value: urgentTickets,
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  const recentTickets = userTickets.slice(0, 6);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.fullname}!
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'admin' && 'Manage all support tickets and monitor performance'}
            {user.role === 'agent' && 'View and respond to assigned tickets'}
            {user.role === 'customer' && 'Track your support requests'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user.role === 'admin' && (
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Stats
              </CardTitle>
              <CardDescription>System-wide metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
                  <p className="text-2xl font-bold">
                    {tickets.length > 0 ? Math.round((resolvedTickets / tickets.length) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                  <p className="text-2xl font-bold">2.5h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Tickets</h2>
          </div>

          {recentTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTickets.map((ticket: Ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <TicketIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tickets found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}