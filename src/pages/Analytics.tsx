import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'inprogress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userEmail: string;
  userName: string;
  userId: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  username: string;
  description: string;
  ratingNumber: number;
  ticketTitle: string;
  agentReply?: string;
  agentId?: string;
  repliedAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  fullname: string;
  email: string;
  bio?: string;
  role: 'admin' | 'agent' | 'customer';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Analytics() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // Fetch all required data in parallel
      const [ticketsRes, reviewsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/api/tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/users/profiles', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Check responses
      if (!ticketsRes.ok || !reviewsRes.ok || !usersRes.ok) {
        const [ticketsErr, reviewsErr, usersErr] = await Promise.all([
          ticketsRes.json().catch(() => ({})),
          reviewsRes.json().catch(() => ({})),
          usersRes.json().catch(() => ({}))
        ]);

        const errorMsg = ticketsRes.status !== 200
          ? ticketsErr.message
          : reviewsRes.status !== 200
            ? reviewsErr.message
            : usersErr.message;

        throw new Error(errorMsg || 'Failed to fetch data');
      }

      const [ticketsData, reviewsData, usersData] = await Promise.all([
        ticketsRes.json(),
        reviewsRes.json(),
        usersRes.json()
      ]);

      setTickets(ticketsData.tickets || []);
      setReviews(reviewsData.reviews || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
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
          <h3 className="text-xl font-bold mb-2">Error Loading Analytics</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchAllData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'inprogress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
  const closedTickets = tickets.filter((t) => t.status === 'closed').length;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.ratingNumber, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const ticketsByPriority = {
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    high: tickets.filter((t) => t.priority === 'high').length,
    medium: tickets.filter((t) => t.priority === 'medium').length,
    low: tickets.filter((t) => t.priority === 'low').length,
  };

  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalAgents = users.filter((u) => u.role === 'agent').length;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">System performance and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTickets}</p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openTickets + inProgressTickets}</p>
                  <p className="text-sm text-muted-foreground">Active Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resolvedTickets + closedTickets}</p>
                  <p className="text-sm text-muted-foreground">Resolved Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tickets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Open</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${totalTickets ? (openTickets / totalTickets) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{openTickets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full"
                        style={{ width: `${totalTickets ? (inProgressTickets / totalTickets) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{inProgressTickets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolved</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${totalTickets ? (resolvedTickets / totalTickets) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{resolvedTickets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Closed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-muted-foreground h-2 rounded-full"
                        style={{ width: `${totalTickets ? (closedTickets / totalTickets) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{closedTickets}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tickets by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm">Urgent</span>
                  </div>
                  <span className="text-sm font-medium">{ticketsByPriority.urgent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-sm">High</span>
                  </div>
                  <span className="text-sm font-medium">{ticketsByPriority.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Medium</span>
                  </div>
                  <span className="text-sm font-medium">{ticketsByPriority.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Low</span>
                  </div>
                  <span className="text-sm font-medium">{ticketsByPriority.low}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAgents}</p>
                  <p className="text-sm text-muted-foreground">Support Agents</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}