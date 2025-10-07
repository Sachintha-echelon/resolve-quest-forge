import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { Navbar } from '@/components/Navbar';
import { mockUsers } from '@/lib/mockData';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const { tickets, reviews } = useTickets();

  if (!user || (user.role !== 'admin' && user.role !== 'support_agent')) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
  const closedTickets = tickets.filter((t) => t.status === 'closed').length;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const ticketsByPriority = {
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    high: tickets.filter((t) => t.priority === 'high').length,
    medium: tickets.filter((t) => t.priority === 'medium').length,
    low: tickets.filter((t) => t.priority === 'low').length,
  };

  const totalCustomers = mockUsers.filter((u) => u.role === 'customer').length;
  const totalAgents = mockUsers.filter((u) => u.role === 'support_agent').length;

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
                        style={{ width: `${(openTickets / totalTickets) * 100}%` }}
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
                        style={{ width: `${(inProgressTickets / totalTickets) * 100}%` }}
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
                        style={{ width: `${(resolvedTickets / totalTickets) * 100}%` }}
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
                        style={{ width: `${(closedTickets / totalTickets) * 100}%` }}
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
