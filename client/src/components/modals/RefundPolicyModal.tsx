
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { jsPDF } from "jspdf";
import { X, FileText, Check, ArrowRight, Download } from "lucide-react";
import { RootState } from "@/store/store";
import { useCreateCheckoutSession } from "@/hooks/payment/useCreateCheckoutSession";
import { useUpgradeSubscription } from "@/hooks/payment/useUpgradeSubscription";
import { CreateCheckoutSessionData } from "@/services/client/clientService";
import { useToaster } from "@/hooks/ui/useToaster";

interface MembershipPaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planInterval: string;
  planId: string;
  trainerId: string | null;
  onConfirm: () => void;
  isUpgrade?: boolean;
  useWalletBalance?: boolean;
}

export function MembershipPaymentFlow({
  isOpen,
  onClose,
  planName,
  planPrice,
  planInterval,
  planId,
  trainerId,
  onConfirm,
  isUpgrade = false,
  useWalletBalance = false,
}: MembershipPaymentFlowProps) {
  const [step, setStep] = useState<"policy" | "payment" | "success">("policy");
  const [showPolicyPdf, setShowPolicyPdf] = useState(false);
  const client = useSelector((state: RootState) => state.client.client);
const {  errorToast } = useToaster();
  const { mutate: createCheckout, isPending: isCreatingCheckout, error: checkoutError } = useCreateCheckoutSession();
  const { mutate: upgradeSubscription, isPending: isUpgrading, error: upgradeError } = useUpgradeSubscription();

  useEffect(() => {
    if (isOpen) {
      setStep("policy");
      setShowPolicyPdf(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "payment") {
      if (!client?.id) {
        errorToast("Please log in to proceed with checkout");
        onClose();
        return;
      }

      const checkoutData: CreateCheckoutSessionData = {
        trainerId: trainerId || "default-trainer-id",
        planId,
        successUrl: `${window.location.origin}/checkout/success?planName=${encodeURIComponent(planName)}&isUpgrade=${isUpgrade}`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
        useWalletBalance,
      };

      const mutation = isUpgrade ? upgradeSubscription : createCheckout;

      mutation(checkoutData, {
        onSuccess: (data) => {
          console.log("Payment response:", data); // Debug log
          if (data.url) {
            window.location.href = data.url; // Redirect to Stripe
          } else if (data.success || (useWalletBalance && data.hasBalance)) {
            // Handle successful payment (Stripe or wallet)
            setStep("success");
            onConfirm();
          } else {
            // Handle unexpected response
            errorToast("Unexpected response from payment processing. Please try again.");
            onClose();
          }
        },
        onError: (error: any) => {
          console.error(`Failed to create ${isUpgrade ? "upgrade" : "checkout"} session:`, error.message);
          errorToast(error.message || `Failed to create ${isUpgrade ? "upgrade" : "checkout"} session`);
          onClose();
        },
      });
    }
  }, [step, planId, trainerId, client?.id, createCheckout, upgradeSubscription, isUpgrade, onClose, planName, useWalletBalance, onConfirm]);

  useEffect(() => {
    if (isOpen && window.location.pathname === "/checkout/success") {
      setStep("success");
      onConfirm();
    }
  }, [isOpen, onConfirm]);

  const handlePolicyAccepted = useCallback(() => {
    setStep("payment");
  }, []);

  const handleDownloadPolicy = useCallback(() => {
    setShowPolicyPdf(true);
    generatePolicyPDF();
  }, []);

  const generatePolicyPDF = useCallback(() => {
    const fullName = client ? `${client.firstName} ${client.lastName}` : "Unknown User";

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(88, 86, 214);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFillColor(144, 97, 249);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setFillColor(168, 130, 255);
      doc.rect(0, 0, pageWidth, 15, "F");

      doc.setDrawColor(255, 255, 255);
      doc.circle(20, 20, 10, "S");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("FIT", 16, 22);

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(
        isUpgrade ? "PLAN UPGRADE AGREEMENT" : "NO RETURN OR REFUND POLICY",
        pageWidth / 2,
        25,
        { align: "center" }
      );

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(20, 50, pageWidth - 20, 50);

      const today = new Date();
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.text("AGREEMENT DETAILS", 20, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date: ${today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, 70);
      doc.text(`Member Name: ${fullName}`, 20, 80);
      doc.text(`Selected Plan: ${planName}`, 20, 90);
      doc.text(`Plan Price: $${planPrice}/${planInterval}`, 20, 100);

      if (useWalletBalance) {
        doc.text(`Wallet Balance Used: Yes`, 20, 110);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(88, 86, 214);
      doc.text(
        isUpgrade ? "UPGRADE TERMS AND CONDITIONS" : "POLICY TERMS AND CONDITIONS",
        20,
        useWalletBalance ? 130 : 120
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const policyText = isUpgrade
        ? [
            "1. By agreeing to this policy, you acknowledge that you are upgrading your existing membership plan.",
            "",
            "2. The upgraded membership fees are non-refundable, except as required by applicable law.",
            "",
            "3. Any remaining value from your current plan will be prorated and applied as a credit toward the new plan.",
            "",
            useWalletBalance
              ? "4. A portion of the upgrade cost has been offset using your wallet balance."
              : "4. No wallet balance was used for this upgrade.",
            "",
            "5. The fitness center reserves the right to terminate memberships for violation of club rules without refund.",
            "",
            "6. This agreement constitutes the entire understanding between the member and the fitness center regarding the plan upgrade.",
          ]
        : [
            "1. By agreeing to this policy, you acknowledge that all membership fees paid to our fitness center are",
            "   non-refundable.",
            "",
            "2. Once payment has been processed, no refunds will be issued under any circumstances, including but",
            "   not limited to:",
            "     a. Change of mind",
            "     b. Inability to use the facilities due to personal circumstances",
            "     c. Relocation",
            "     d. Medical conditions arising after membership purchase",
            "",
            useWalletBalance
              ? "3. A portion of the membership cost has been offset using your wallet balance."
              : "3. No wallet balance was used for this membership.",
            "",
            "4. Membership fees cannot be transferred to another individual.",
            "",
            "5. The fitness center reserves the right to terminate memberships for violation of club rules without refund.",
            "",
            "6. This agreement constitutes the entire understanding between the member and the fitness center",
            "   regarding the refund policy.",
          ];

      let yPosition = useWalletBalance ? 140 : 130;
      policyText.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      doc.setDrawColor(88, 86, 214);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 60, pageWidth - 20, pageHeight - 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(88, 86, 214);
      doc.text(
        isUpgrade ? "UPGRADE CONFIRMATION" : "PAYMENT CONFIRMATION",
        20,
        pageHeight - 50
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(
        isUpgrade
          ? "Plan upgrade processed and membership updated on: "
          : "Payment processed and membership activated on: ",
        20,
        pageHeight - 40
      );
      doc.text(today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 20, pageHeight - 33);

      doc.setFont("helvetica", "bold");
      doc.text(`Member Name: ${fullName}`, 20, pageHeight - 23);
      doc.text(`Payment Status: CONFIRMED`, 20, pageHeight - 16);

      doc.setFillColor(88, 86, 214);
      doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("© 2025 Fitness Center. All Rights Reserved.", pageWidth / 2, pageHeight - 4, { align: "center" });

      const fileName = `Membership_${isUpgrade ? "Upgrade" : "Agreement"}_${fullName.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }, [client, planName, planPrice, planInterval, isUpgrade, useWalletBalance]);

  const renderStep = () => {
    switch (step) {
      case "policy":
        return (
          <RefundPolicyStep
            planName={planName}
            onAccept={handlePolicyAccepted}
            onClose={onClose}
            isUpgrade={isUpgrade}
            useWalletBalance={useWalletBalance}
          />
        );
      case "payment":
        return (
          <div className="py-10 text-center">
            {isCreatingCheckout || isUpgrading ? (
              <>
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>{useWalletBalance ? "Processing wallet payment..." : `Preparing ${isUpgrade ? "upgrade" : "checkout"}...`}</p>
              </>
            ) : checkoutError || upgradeError ? (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {(checkoutError || upgradeError)?.message ||
                  `Failed to create ${isUpgrade ? "upgrade" : "checkout"} session. Please try again.`}
              </div>
            ) : (
              <p>{useWalletBalance ? "Processing wallet payment..." : `Redirecting to secure ${isUpgrade ? "upgrade" : "checkout"}...`}</p>
            )}
          </div>
        );
      case "success":
        return (
          <SuccessStep
            planName={planName}
            onDownload={handleDownloadPolicy}
            showPolicyPdf={showPolicyPdf}
            onClose={onClose}
            isUpgrade={isUpgrade}
            useWalletBalance={useWalletBalance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {step === "policy" && (isUpgrade ? "Plan Upgrade Agreement" : "Membership Agreement")}
            {step === "payment" && (isUpgrade ? "Secure Upgrade" : "Secure Checkout")}
            {step === "success" && (isUpgrade ? "Upgrade Successful!" : "Payment Successful!")}
          </DialogTitle>
          {step !== "payment" && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

interface RefundPolicyStepProps {
  planName: string;
  onAccept: () => void;
  onClose: () => void;
  isUpgrade?: boolean;
  useWalletBalance?: boolean;
}

function RefundPolicyStep({ planName, onAccept, onClose, isUpgrade = false, useWalletBalance = false }: RefundPolicyStepProps) {
  const [agreed, setAgreed] = useState(false);
  const client = useSelector((state: RootState) => state.client.client);
  const fullName = client ? `${client.firstName} ${client.lastName}` : "Unknown User";

  return (
    <>
      <div className="max-h-[60vh] overflow-auto p-1">
        <div className="space-y-6 py-2 pb-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <h3 className="font-medium text-purple-800 mb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Member:</div>
              <div className="font-medium">{fullName}</div>
              <div className="text-gray-500">Plan:</div>
              <div className="font-medium">{planName}</div>
              <div className="text-gray-500">Date</div>
              <div className="font-medium">{new Date().toLocaleDateString()}</div>
              {useWalletBalance && (
                <>
                  <div className="text-gray-500">Wallet Balance:</div>
                  <div className="font-medium">Used</div>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-md p-5 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 text-indigo-700 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {isUpgrade ? "Plan Upgrade Policy" : "No Return or Refund Policy"}
            </h3>
            <div className="text-sm space-y-3 text-gray-700">
              {isUpgrade ? (
                <>
                  <p>By agreeing to this policy, you acknowledge that you are upgrading your existing membership plan.</p>
                  <p>The upgraded membership fees are non-refundable, except as required by applicable law.</p>
                  <p>Any remaining value from your current plan will be prorated and applied as a credit toward the new plan.</p>
                  {useWalletBalance ? (
                    <p>A portion of the upgrade cost has been offset using your wallet balance.</p>
                  ) : (
                    <p>No wallet balance was used for this upgrade.</p>
                  )}
                  <p>The fitness center reserves the right to terminate memberships for violation of club rules without refund.</p>
                  <p>This agreement constitutes the entire understanding between the member and the fitness center regarding the plan upgrade.</p>
                </>
              ) : (
                <>
                  <p>By agreeing to this policy, you acknowledge that all membership fees paid to our fitness center are non-refundable.</p>
                  <p>Once payment has been processed, no refunds will be issued under any circumstances, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Change of mind</li>
                    <li>Inability to use the facilities due to personal circumstances</li>
                    <li>Relocation</li>
                    <li>Medical conditions arising after membership purchase</li>
                  </ul>
                  {useWalletBalance ? (
                    <p>A portion of the membership cost has been offset using your wallet balance.</p>
                  ) : (
                    <p>No wallet balance was used for this membership.</p>
                  )}
                  <p>Membership fees cannot be transferred to another individual.</p>
                  <p>The fitness center reserves the right to terminate memberships for violation of club rules without refund.</p>
                  <p>This agreement constitutes the entire understanding between the member and the fitness center regarding the refund policy.</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the {isUpgrade ? "Plan Upgrade Policy" : "No Return or Refund Policy"}
            </label>
          </div>
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <Button variant="outline" onClick={onClose} className="border-gray-300">
          Cancel
        </Button>
        <Button
          onClick={onAccept}
          disabled={!agreed}
          className={`relative overflow-hidden ${
            agreed ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gray-300"
          } text-white transition-all duration-300`}
        >
          Proceed to {isUpgrade ? "Upgrade" : "Payment"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );
}

interface SuccessStepProps {
  planName: string;
  onDownload: () => void;
  showPolicyPdf: boolean;
  onClose: () => void;
  isUpgrade?: boolean;
  useWalletBalance?: boolean;
}

function SuccessStep({ planName, onDownload, showPolicyPdf, onClose, isUpgrade = false, useWalletBalance = false }: SuccessStepProps) {
  const client = useSelector((state: RootState) => state.client.client);
  const fullName = client ? `${client.firstName} ${client.lastName}` : "Unknown User";

  return (
    <>
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isUpgrade ? "Upgrade Successful!" : "Payment Successful!"}
        </h3>
        <p className="text-gray-600 mb-6">
          Your {planName} {isUpgrade ? "plan upgrade is now active" : "membership is now active"}
          {useWalletBalance && ". A portion of the cost was paid using your wallet balance."}
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 mx-auto max-w-md">
          <h4 className="font-medium text-gray-700 mb-3">Membership Details</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Member:</span>
              <span className="font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan:</span>
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Activation Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            {useWalletBalance && (
              <div className="flex justify-between">
                <span className="text-gray-500">Wallet Balance Used:</span>
                <span className="font-medium">Yes</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onDownload}
          disabled={showPolicyPdf}
          className={`flex items-center mx-auto ${
            showPolicyPdf ? "bg-gray-300" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white`}
        >
          {showPolicyPdf ? (
            <>Downloaded</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download {isUpgrade ? "Upgrade" : "Membership"} Agreement
            </>
          )}
        </Button>

        <p className="text-sm text-gray-500 mt-6">
          A confirmation email has been sent to {client?.email}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
