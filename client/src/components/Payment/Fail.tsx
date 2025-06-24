// D:\StriveX\client\src\components\Fail.tsx
"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X as XIcon, Home, RefreshCcw, AlertCircle } from "lucide-react";

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Failed Payment Page Component
export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const error = query.get("error") || query.get("error");
  const isUpgrade = query.get("isUpgrade") === "true";

  const handleTryAgain = () => {
    navigate("/premium");
  };

  const navigateHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-4 py-5 sm:px-6">
          <h2 className="text-xl font-bold text-white text-center">
            {isUpgrade ? "Plan Upgrade Failed" : "Payment Failed"}
          </h2>
        </div>

        <div className="px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XIcon className="h-8 w-8 text-red-600" />
            </div>

            <h3 className="text-xl font-medium text-gray-900">
              {isUpgrade ? "Unable to Process Plan Upgrade" : "Unable to Process Payment"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-center">
              {error || `We couldn't process your ${isUpgrade ? "plan upgrade" : "payment"}. Please try again.`}
            </p>

            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-lg p-4 w-full">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Common issues</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Insufficient funds in your account</li>
                      <li>Card has expired</li>
                      <li>Security code was entered incorrectly</li>
                      <li>Your bank declined the transaction</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 w-full">
              <Button
                onClick={handleTryAgain}
                className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={navigateHome}
                variant="outline"
                className="flex items-center justify-center border-gray-300"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6 w-full">
              <p className="text-xs text-center text-gray-500">
                Need help? <a href="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}