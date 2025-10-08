import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormCustomerProps {
  ticketId: string;
}

export function ReviewFormCustomer({ ticketId }: ReviewFormCustomerProps) {
  const { user } = useAuth();
  const { addReview, updateReview, deleteReview, getReviewByTicket } = useTickets();
  const existingReview = getReviewByTicket(ticketId);
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (existingReview) {
      updateReview(existingReview.id, { rating, comment });
      toast.success('Review updated successfully!');
      setIsEditing(false);
    } else {
      addReview({
        ticketId,
        customerId: user!.id,
        rating,
        comment,
      });
      toast.success('Thank you for your review!');
    }
  };

  const handleDelete = () => {
    if (existingReview) {
      deleteReview(existingReview.id);
      toast.success('Review deleted successfully');
      setIsDeleting(false);
      setRating(0);
      setComment('');
      setIsEditing(true);
    }
  };

  if (!isEditing && existingReview) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Review</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsDeleting(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= existingReview.rating
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <p className="text-sm">{existingReview.comment}</p>
          {existingReview.agentReply && (
            <div className="mt-4 bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-semibold mb-1">Agent Response:</p>
              <p className="text-sm">{existingReview.agentReply}</p>
            </div>
          )}
        </CardContent>

        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Review?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? 'Edit Your Review' : 'Rate This Support Experience'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
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
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with our support team..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
            {existingReview && (
              <Button type="button" variant="outline" onClick={() => {
                setRating(existingReview.rating);
                setComment(existingReview.comment);
                setIsEditing(false);
              }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
