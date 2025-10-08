/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
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
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/tickets/ChatWidget';
import { ArrowLeft, Calendar, User, AlertCircle, Star, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { TicketStatus } from '@/types';
import { toast } from 'sonner';

interface Review {
  [x: string]: any;
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

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  userEmail: string;
  userName: string;
  userId: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  open: 'bg-primary text-primary-foreground',
  inprogress: 'bg-warning text-warning-foreground',
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchTicket();
      fetchReview();
    }
  }, [id, user]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch ticket');
      }

      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews/c/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch review');
      }

      const data = await response.json();
      console.log(data)
      const userReview = data.review?.find(
        (r: any) => r.username === user?.fullname
      );

      console.log('fuck')
      if (userReview) {
        console.log('fuck you'+userReview)
        setReview(userReview);
        setRating(userReview.ratingNumber);
        setComment(userReview.description);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error fetching review:', err);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update ticket status');
      }

      const data = await response.json();
      setTicket(data.ticket);
      toast.success('Ticket status updated');
    } catch (err) {
      console.error('Error updating ticket status:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = review ? 'PUT' : 'POST';
      const url = review
        ? `http://localhost:3000/api/reviews/${review._id}`
        : 'http://localhost:3000/api/reviews';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: user?.fullname,
          description: comment,
          ticketTitle: ticket?.title,
          ratingNumber: rating,
          ticketId: ticket.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save review');

      if (review) {
        setReview(data.review);
        toast.success('Review updated successfully!');
      } else {
        setReview(data.review);
        toast.success('Thank you for your review!');
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving review:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save review');
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews/${review._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete review');

      setReview(null);
      setRating(0);
      setComment('');
      setIsEditing(true);
      setIsDeleting(false);
      toast.success('Review deleted successfully');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticket.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete ticket');

      toast.success('Ticket deleted successfully');
      navigate('/tickets');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete ticket');
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
          <p className="mt-4 text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <div className="text-destructive text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Ticket Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || 'The requested ticket does not exist'}</p>
          <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
        </div>
      </div>
    );
  }

  const canUpdateStatus = user.role === 'admin' || user.role === 'agent';
  const canSeeReview = ticket.status === 'resolved' || ticket.status === 'closed';
  const canDeleteTicket =
    user.role === 'admin' ||
    (user.role === 'customer' && ticket.userId === user.id) ||
    (user.role === 'agent' && ticket.assignedAgentId === user.id);

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
                        <SelectItem value="inprogress">In Progress</SelectItem>
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
                    <span className="font-medium">{format(new Date(ticket.createdAt), 'PPp')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{ticket.userName}</span>
                  </div>
                  {ticket.assignedAgentName && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{ticket.assignedAgentName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <ChatWidget ticketId={ticket.id} />
          </div>

          <div className="space-y-6">
            {canSeeReview && user.role === 'customer' && (
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {review ? 'Your Review' : 'Rate This Support Experience'}
                    </CardTitle>
                    {review && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsDeleting(true)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditing && review ? (
                    <div className="space-y-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= review.ratingNumber
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm">{review.description}</p>
                      {review.agentReply && (
                        <div className="mt-4 bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Agent Response:</p>
                          <p className="text-sm">{review.agentReply}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= (hoveredStar || rating)
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          placeholder="Share your experience with our support team..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleReviewSubmit} className="flex-1">
                          {review ? 'Update Review' : 'Submit Review'}
                        </Button>
                        {review && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRating(review.ratingNumber);
                              setComment(review.description);
                              setIsEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  <p className="text-sm">{format(new Date(ticket.updatedAt), 'PPp')}</p>
                </div>
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

                {canDeleteTicket && (
                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setDeletingTicket(true)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Review Dialog */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Review?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. This will permanently delete your review.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteReview}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ticket Dialog */}
      {deletingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Ticket?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. This will permanently delete the ticket and all its messages.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletingTicket(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTicket}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}