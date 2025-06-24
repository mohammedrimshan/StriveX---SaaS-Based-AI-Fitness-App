// D:\StriveX\client\src\components\Success.tsx
"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Download, Home } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { jsPDF } from "jspdf";

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Success Page Component
export default function PaymentSuccessPage() {
  const [showPolicyPdf, setShowPolicyPdf] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const client = useSelector((state: RootState) => state.client.client);
  const planName = query.get("planName");
  const isUpgrade = query.get("isUpgrade") === "true"; // Read isUpgrade from query params

  const handleDownloadPolicy = () => {
    setShowPolicyPdf(true);
    generatePolicyPDF();
  };

  const navigateToNext = () => {
    if (isUpgrade) {
      navigate("/home"); // Navigate to home for upgrades
    } else {
      navigate("/trainer-selection-prompt"); // Navigate to trainer selection for new subscriptions
    }
  };

  const fullName = client ? `${client.firstName} ${client.lastName}` : "Unknown User";

  const generatePolicyPDF = () => {
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
      doc.text(`Selected Plan: ${planName || "Premium Membership"}`, 20, 90);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(88, 86, 214);
      doc.text(
        isUpgrade ? "UPGRADE TERMS AND CONDITIONS" : "POLICY TERMS AND CONDITIONS",
        20,
        120
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
            "4. The fitness center reserves the right to terminate memberships for violation of club rules without refund.",
            "",
            "5. This agreement constitutes the entire understanding between the member and the fitness center regarding the plan upgrade.",
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
            "3. Membership fees cannot be transferred to another individual.",
            "",
            "4. The fitness center reserves the right to terminate memberships for violation of club rules without refund.",
            "",
            "5. This agreement constitutes the entire understanding between the member and the fitness center",
            "   regarding the refund policy.",
          ];

      let yPosition = 130;
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
        isUpgrade ? "UPGRADE CONFENT" : "PAYMENT CONFIRMATION",
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
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-5 sm:px-6">
          <h2 className="text-xl font-bold text-white text-center">
            {isUpgrade ? "Upgrade Successful!" : "Payment Successful!"}
          </h2>
        </div>

        <div className="px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h3 className="text-xl font-medium text-gray-900">
              {isUpgrade ? "Plan Upgraded" : "Membership Activated"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your {planName || "Premium"} {isUpgrade ? "plan upgrade is now active" : "membership is now active"}
            </p>

            <div className="mt-8 w-full bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-700 mb-3">Membership Details</h4>
              <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member:</span>
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-medium">{planName || "Premium Membership"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Activation Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 w-full">
              <Button
                onClick={handleDownloadPolicy}
                disabled={showPolicyPdf}
                className={`flex items-center justify-center ${
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

              <Button
                onClick={navigateToNext}
                variant="outline"
                className="flex items-center justify-center border-gray-300"
              >
                <Home className="mr-2 h-4 w-4" />
                {isUpgrade ? "Return to Dashboard" : "Continue to Trainer Selection"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              A confirmation email has been sent to {client?.email || "your email address"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}