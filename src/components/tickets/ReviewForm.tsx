/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  ticketId: string;
}

interface Review {
  id: string;
  ticketId: string;
  customerId: string;
  ratingNumber: number;
  description: string;
  agentReply?: string;
  agentId?: string;
  repliedAt?: string;
  createdAt: string;
}

export function ReviewForm({ ticketId }: ReviewFormProps) {
  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [ticketId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews?ticketTitle=${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch review');

      const data = await response.json();
      if (data.reviews && data.reviews.length > 0) {
        const userReview = data.reviews.find((r: any) => r.username === user?.fullname);
        if (userReview) {
          setReview(userReview);
          setRating(userReview.ratingNumber);
          setComment(userReview.description);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error('Error fetching review:', err);
      toast.error('Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
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
        ? `http://localhost:3000/api/reviews/${review.id}`
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
          ticketTitle: ticketId,
          ratingNumber: rating
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

  const handleDelete = async () => {
    if (!review) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews/${review.id}`, {
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

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  if (!isEditing && review) {
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
          {review ? 'Edit Your Review' : 'Rate This Support Experience'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
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
              {review ? 'Update Review' : 'Submit Review'}
            </Button>
            {review && (
              <Button
                type="button"
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
        </form>
      </CardContent>
    </Card>
  );
}