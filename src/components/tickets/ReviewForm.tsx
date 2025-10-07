import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { toast } from 'sonner';

interface ReviewFormProps {
  ticketId: string;
}

export function ReviewForm({ ticketId }: ReviewFormProps) {
  const { user } = useAuth();
  const { addReview, getReviewByTicket } = useTickets();
  const existingReview = getReviewByTicket(ticketId);

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');

  if (!user || existingReview) {
    return existingReview ? (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= existingReview.rating
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
        </CardContent>
      </Card>
    ) : null;
  }

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    addReview({
      ticketId,
      customerId: user.id,
      rating,
      comment,
    });

    toast.success('Review submitted successfully!');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Rate Your Support Experience</CardTitle>
        <CardDescription>Help us improve our service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <Button onClick={handleSubmit} className="w-full">
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );
}
