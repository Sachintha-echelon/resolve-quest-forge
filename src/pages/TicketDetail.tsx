import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/tickets/ChatWidget';
import { ReviewFormCustomer } from '@/components/tickets/ReviewFormCustomer';
import { ArrowLeft, Calendar, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { TicketStatus } from '@/types';
import { toast } from 'sonner';

const statusColors = {
  open: 'bg-primary text-primary-foreground',
  'in-progress': 'bg-warning text-warning-foreground',
  resolved: 'bg-success text-success-foreground',
  closed: 'bg-muted text-muted-foreground',
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-secondary text-secondary-foreground',
  high: 'bg-warning text-warning-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
};

export default function TicketDetail() {
  const { id } = useParams();
  const { user, users } = useAuth();
  const { getTicketById, updateTicket } = useTickets();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const ticket = getTicketById(id!);

  if (!ticket) {
    return <Navigate to="/tickets" replace />;
  }

  const customer = users.find(u => u.id === ticket.customerId);
  const agent = ticket.assignedAgentId ? users.find(u => u.id === ticket.assignedAgentId) : null;

  const canUpdateStatus = user.role === 'admin' || user.role === 'support_agent';
  const canSeeReview = ticket.status === 'resolved' || ticket.status === 'closed';

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateTicket(ticket.id, { status: newStatus });
    toast.success('Ticket status updated');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{ticket.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority} priority
                      </Badge>
                    </div>
                  </div>
                  {canUpdateStatus && (
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{ticket.description}</p>
                </div>

                <div className="flex flex-wrap gap-6 pt-4 border-t text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{format(ticket.createdAt, 'PPp')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{customer?.name}</span>
                  </div>
                  {agent && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <ChatWidget ticketId={ticket.id} />
          </div>

          <div className="space-y-6">
            {canSeeReview && user.role === 'customer' && (
              <ReviewFormCustomer ticketId={ticket.id} />
            )}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ticket ID</p>
                  <p className="font-mono text-sm">{ticket.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">{format(ticket.updatedAt, 'PPp')}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Resolved At</p>
                    <p className="text-sm">{format(ticket.resolvedAt, 'PPp')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
