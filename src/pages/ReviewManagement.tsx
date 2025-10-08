import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { Navbar } from '@/components/Navbar';
import { Star, MessageSquare, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewManagement() {
  const { user, users } = useAuth();
  const { reviews, getTicketById, addReviewReply } = useTickets();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!user || (user.role !== 'admin' && user.role !== 'support_agent')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleReply = (reviewId: string) => {
    if (replyText.trim()) {
      addReviewReply(reviewId, replyText, user.id);
      toast.success('Reply added successfully');
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review & Feedback Management</h1>
          <p className="text-muted-foreground">Customer feedback and ratings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const customer = users.find((u) => u.id === review.customerId);
                  const agent = review.agentId ? users.find((u) => u.id === review.agentId) : null;
                  const ticket = getTicketById(review.ticketId);

                  return (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer?.avatar} />
                            <AvatarFallback>{customer?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{customer?.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(review.createdAt, 'PPp')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm mb-3">{review.comment}</p>

                      {ticket && (
                        <Badge variant="outline" className="text-xs mb-3">
                          Ticket: {ticket.title}
                        </Badge>
                      )}

                      {review.agentReply && (
                        <div className="mt-3 bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">{agent?.name || 'Agent'} replied:</span>
                            <span className="text-xs text-muted-foreground">
                              {review.repliedAt && format(review.repliedAt, 'PPp')}
                            </span>
                          </div>
                          <p className="text-sm">{review.agentReply}</p>
                        </div>
                      )}

                      {!review.agentReply && (
                        <div className="mt-3">
                          {replyingTo === review.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button onClick={() => handleReply(review.id)}>Send Reply</Button>
                                <Button variant="outline" onClick={() => setReplyingTo(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(review.id)}>
                              <Reply className="w-4 h-4 mr-2" />
                              Reply
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
