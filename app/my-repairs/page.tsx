'use client'
import { useState, useEffect } from "react";
import { Download, Clock, Wrench, Star, X } from "lucide-react";
import { Button } from "@/components/Button";
import { OrderTracker } from "@/components/OrderTracker";
import { getCustomerRepairs, cancelRepairRequest } from "@/actions/repairRequest";
import { submitReview } from "@/actions/review";
import { cancelRepairOrder } from "@/actions/repairOrder";
import { toast } from "sonner";
import { HashLoader } from "react-spinners";

const BuyerDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review & Rating Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const openReviewModal = (orderId: string) => {
    setActiveReviewOrderId(orderId);
    setRating(0);
    setComment("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setActiveReviewOrderId(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewOrderId || rating === 0) return;

    setIsSubmittingReview(true);
    try {
      const res = await submitReview({
        orderId: activeReviewOrderId,
        rating,
        comment,
      });

      if (res.success) {
        toast.success("Review submitted successfully!");
        setOrders((current) =>
          current.map((order) =>
            order.id === activeReviewOrderId ? { ...order, hasReview: true } : order
          )
        );
        closeReviewModal();
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error submitting review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    getCustomerRepairs()
      .then((res) => {
        if (res.success) {
          setRequests(res.requests || []);
          setOrders(res.orders || []);
        } else {
          toast.error(res.message || "Failed to load repairs.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading repairs.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this repair request?")) return;
    const res = await cancelRepairRequest(requestId);
    if (res.success) {
      toast.success("Repair request cancelled.");
      setRequests((current) => current.filter((r) => r.id !== requestId));
    } else {
      toast.error(res.message || "Failed to cancel request.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    const res = await cancelRepairOrder(orderId);
    if (res.success) {
      toast.success("Order cancelled successfully.");
      setOrders((current) => current.filter((o) => o.id !== orderId));
    } else {
      toast.error(res.message || "Failed to cancel order.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-softGray gap-4 min-h-screen bg-deepCarbon">
        <HashLoader color="#26fff2" size={50} />
        <span className="text-sm font-medium tracking-wide">Loading repairs database...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-screen">
      <h2 className="text-3xl font-display font-bold text-white mb-8">My Repairs</h2>

      <div className="space-y-10">
        {/* Requests Awaiting Acceptance */}
        {requests.length > 0 && (
          <div>
            <h3 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warningYellow" /> Requests Awaiting Acceptance
            </h3>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-gunmetal border border-slateSteel rounded-lg overflow-hidden p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{request.deviceModel}</h4>
                      <p className="text-sm text-softGray mt-1 font-mono text-xs">
                        Requested: {new Date(request.requestedDate || request.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-softGray mt-2 line-clamp-2">
                        {request.issueDescription}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right shrink-0">
                      <div className="text-xs text-softGray">Technician</div>
                      <div className="text-sm font-medium text-electricAqua">{request.technicianName}</div>
                      <div className="mt-2">
                        <span className="px-3 py-1 text-xs rounded bg-deepCarbon border border-warningYellow/30 text-warningYellow capitalize">
                          {request.status}
                        </span>
                      </div>
                      <div className="text-sm text-softGray mt-1">
                        Budget Limit: <span className="text-white font-bold">${request.estimatedBudget}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(request.id)}
                        className="mt-2 text-xs font-semibold text-errorRed hover:underline transition-colors"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active & Completed Repair Orders */}
        <div>
          <h3 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-electricAqua" /> Active Repair Orders
          </h3>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gunmetal border border-slateSteel rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-deepCarbon p-4 border-b border-slateSteel flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{order.deviceModel}</h3>
                    <p className="text-sm text-softGray font-mono text-xs">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-softGray">Technician</div>
                      <div className="text-sm font-medium text-electricAqua">{order.technicianName}</div>
                    </div>
                    {order.repairReportUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" /> Report
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tracker */}
                <div className="p-6">
                  <OrderTracker status={order.status} />

                  <div className="mt-6 flex justify-between items-center text-sm border-t border-slateSteel/50 pt-4 text-softGray">
                    <div>
                      Agreed Price Quote:{" "}
                      <span className="text-cyberGreen font-bold font-display text-base">
                        ${order.totalPrice}
                      </span>
                    </div>
                    {order.estimatedCompletionDate && (
                      <div>
                        Est. Completion:{" "}
                        <span className="text-white font-medium">
                          {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {['placed', 'accepted', 'pickup_scheduled'].includes(order.status) && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-errorRed border-errorRed/30 hover:bg-errorRed/10 hover:text-errorRed"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}

                  {(order.status === 'delivered' || order.status === 'completed') && !order.hasReview && (
                    <div className="mt-8 p-4 bg-cyberGreen/10 border border-cyberGreen/20 rounded flex justify-between items-center">
                      <div className="text-cyberGreen text-sm">Device returned successfully. Please rate your experience.</div>
                      <Button size="sm" variant="secondary" onClick={() => openReviewModal(order.id)}>Write Review</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {orders.length === 0 && requests.length === 0 && (
              <div className="text-center py-20 bg-gunmetal rounded-lg border border-slateSteel border-dashed">
                <h3 className="text-xl text-white font-medium">No active repairs</h3>
                <p className="text-softGray mt-2">Start a new repair request to see it tracked here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slateSteel bg-gunmetal shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-electricAqua to-transparent"></div>
            <div className="flex items-center justify-between border-b border-slateSteel/50 px-6 py-4">
              <h3 className="font-display text-lg font-bold text-white">Write a Review</h3>
              <button onClick={closeReviewModal} className="text-softGray hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="space-y-2 text-center">
                <label className="text-sm font-medium text-softGray uppercase tracking-wider block">Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-softGray hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors duration-150 ${star <= (hoveredRating || rating)
                            ? "fill-warningYellow text-warningYellow"
                            : "text-softGray"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-softGray uppercase tracking-wider">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this technician (service quality, speed, pricing, communication etc.)..."
                  className="w-full bg-deepCarbon border border-slateSteel rounded py-2 px-3 text-white focus:border-electricAqua outline-none transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={closeReviewModal} disabled={isSubmittingReview}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" size="sm" disabled={isSubmittingReview || rating === 0}>
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;