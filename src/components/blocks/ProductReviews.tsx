import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Review } from '@/src/types';

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export const ProductReviews = ({ reviews: initialReviews, averageRating, reviewCount }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        reviewerName: name,
        rating,
        date: new Date().toISOString().split('T')[0],
        comment
      };
      
      setReviews([newReview, ...reviews]);
      setRating(0);
      setName('');
      setComment('');
      setIsSubmitting(false);
      toast.success("Review submitted successfully!");
    }, 600);
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = interactive 
            ? starValue <= (hoverRating || rating)
            : starValue <= ratingValue;
            
          const isHalf = !interactive && !isFilled && starValue - 0.5 <= ratingValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setRating(starValue)}
              className={cn(
                "focus:outline-none transition-colors",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
            >
              {isHalf ? (
                <StarHalf className="w-4 h-4 text-amber-500 fill-current" />
              ) : (
                <Star 
                  className={cn(
                    "w-4 h-4",
                    isFilled ? "text-amber-500 fill-current" : "text-muted-foreground/30"
                  )} 
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-24 mb-12" id="reviews">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Left side: Reviews List */}
        <div className="flex-1">
          <div className="flex items-end gap-4 mb-8">
            <h3 className="text-2xl font-serif">Customer Reviews</h3>
            <div className="flex items-center gap-2 mb-1">
              {renderStars(averageRating)}
              <span className="text-sm font-medium">{averageRating} out of 5</span>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-3 pb-8 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium">
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mt-2">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right side: Write a Review Form */}
        <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 sticky top-24">
            <h4 className="text-lg font-serif mb-6">Write a Review</h4>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Overall Rating</label>
                {renderStars(rating, true)}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="comment" className="text-sm font-medium">Review</label>
                <textarea 
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
