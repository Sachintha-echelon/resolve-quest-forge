import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@/types';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
}

const statusColors = {
  open: 'bg-primary text-primary-foreground',
  'inprogress': 'bg-warning text-warning-foreground',
  resolved: 'bg-success text-success-foreground',
  closed: 'bg-muted text-muted-foreground',
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-secondary text-secondary-foreground',
  high: 'bg-warning text-warning-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
};

export function TicketCard({ ticket }: TicketCardProps) {
  // Format dates from backend string format
  const formattedDate = ticket.createdAt
    ? format(new Date(ticket.createdAt), 'MMM d, yyyy')
    : 'N/A';

  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-card transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">{ticket.title}</CardTitle>
            <Badge className={priorityColors[ticket.priority]} variant="secondary">
              {ticket.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[ticket.status]} variant="outline">
              {ticket.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{ticket.userName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {ticket.assignedAgentName && (
            <div className="text-xs text-muted-foreground">
              Assigned to: <span className="font-medium text-foreground">{ticket.assignedAgentName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}