'use client'
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getTechnicianById, createRepairRequest } from "@/actions/repairRequest";
import { Technician } from "@/types/types";
import { Button } from "@/components/Button";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { HashLoader } from "react-spinners";

const BookingView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const techId = searchParams.get("techId") || "";

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [deviceModel, setDeviceModel] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState<string>("");

  useEffect(() => {
    if (techId) {
      getTechnicianById(techId).then((tech) => {
        if (tech) {
          setTechnician(tech as any);
          setEstimatedBudget(tech.basePrice.toString());
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [techId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-softGray gap-4 min-h-screen bg-deepCarbon">
        <HashLoader color="#26fff2" size={50} />
        <span className="text-sm font-medium tracking-wide">Loading technician profile...</span>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="text-center py-20 text-softGray">
        <p className="mb-4">Technician not found.</p>
        <Link href="/Browse/All">
          <Button variant="outline">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const handleNextStep = () => {
    if (!deviceModel.trim() || !issueDescription.trim() || !pickupAddress.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const fullDescription = `${issueDescription.trim()} (Pickup Address: ${pickupAddress.trim()})`;
      const result = await createRepairRequest({
        technicianId: technician.id || techId,
        deviceModel: deviceModel.trim(),
        issueDescription: fullDescription,
        estimatedBudget: Number(estimatedBudget) || technician.basePrice,
      });

      if (result.success) {
        toast.success(result.message || "Repair requested successfully!");
        router.push("/my-repairs");
      } else {
        toast.error(result.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/Browse/All" className="text-softGray hover:text-white mb-6 flex items-center gap-2 text-sm">
        &larr; Back to Browse
      </Link>

      <div className="bg-gunmetal border border-slateSteel rounded-lg overflow-hidden">
        <div className="bg-deepCarbon p-6 border-b border-slateSteel flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-white">Repair Request</h2>
          <div className="text-sm text-softGray">Order for <span className="text-electricAqua">{technician.businessName}</span></div>
        </div>

        <div className="p-8">
          {step === 'details' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-softGray mb-2">Device Model</label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro"
                  className="w-full bg-deepCarbon border border-slateSteel rounded p-3 text-white focus:border-electricAqua outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-softGray mb-2">Issue Description</label>
                <textarea
                  rows={4}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the problem..."
                  className="w-full bg-deepCarbon border border-slateSteel rounded p-3 text-white focus:border-electricAqua outline-none transition-colors"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-softGray mb-2">Pickup Address</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="123 Tech Street"
                  className="w-full bg-deepCarbon border border-slateSteel rounded p-3 text-white focus:border-electricAqua outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-softGray mb-2">Estimated Budget ($)</label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder={`Base price: $${technician.basePrice}`}
                  className="w-full bg-deepCarbon border border-slateSteel rounded p-3 text-white focus:border-electricAqua outline-none transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNextStep}>Proceed to Confirmation <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-deepCarbon p-4 rounded border border-slateSteel/50">
                <div className="flex justify-between mb-2">
                  <span className="text-softGray">Device Model</span>
                  <span className="text-white font-medium">{deviceModel}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-softGray">Estimated Budget</span>
                  <span className="text-white font-medium">${estimatedBudget}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-softGray">Technician Base Fee</span>
                  <span className="text-white font-medium">${technician.basePrice}</span>
                </div>
                <div className="h-px bg-slateSteel my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold font-display">Target Quote Range</span>
                  <span className="text-electricAqua font-display font-bold text-xl">${estimatedBudget}</span>
                </div>
              </div>

              <div className="bg-techBlue/10 border border-techBlue/30 p-4 rounded text-sm text-softGray flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-electricAqua" />
                <p>You will pay only after the device has been successfully repaired and returned to you.</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? 'Submitting Request...' : 'Confirm & Request Repair'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-softGray">Loading booking form...</div>}>
      <BookingView />
    </Suspense>
  );
}