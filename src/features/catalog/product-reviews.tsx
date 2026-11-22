"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useCreateReview, useProductReviews } from "@/features/catalog/queries";
import { useSessionStore } from "@/lib/auth/session-store";
import { formatDateTime, cn } from "@/lib/utils";

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= value ? "fill-amber-400 text-amber-400" : "text-border",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

/** Product review list plus a form for signed-in shoppers. */
export function ProductReviews({ productId }: { productId: number }) {
  const status = useSessionStore((s) => s.status);
  const [page] = useState(0);
  const { data, isLoading } = useProductReviews(productId, page);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Reviews</h2>

      {status === "authenticated" ? <ReviewForm productId={productId} /> : null}

      {isLoading ? (
        <Spinner />
      ) : !data || data.content.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {data.content.map((review) => (
            <li key={review.id} className="flex flex-col gap-1.5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Stars value={review.rating} />
                  <span className="text-sm font-medium">{review.title ?? "Review"}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatDateTime(review.createdAt)}
                </span>
              </div>
              {review.body ? <p className="text-sm">{review.body}</p> : null}
              <span className="text-muted-foreground text-xs">— {review.authorName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewForm({ productId }: { productId: number }) {
  const create = useCreateReview(productId);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    create.mutate(
      { rating, title: title || null, body: body || null },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setRating(5);
        },
        onError: (err: unknown) => setError(err instanceof Error ? err.message : "Failed to submit"),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  n <= rating ? "fill-amber-400 text-amber-400" : "text-border",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-body">Review</Label>
        <Textarea
          id="review-body"
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" disabled={create.isPending} className="self-start">
        {create.isPending ? <Spinner className="h-4 w-4" /> : null}
        Submit review
      </Button>
    </form>
  );
}
