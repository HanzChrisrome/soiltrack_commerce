//widgets/CancelOrderForm.tsx
import React, { useState } from "react";
import { Check } from "lucide-react";

interface CancelOrderFormProps {
  orderId: string;
  onBackToDetails: () => void;
  onConfirmCancellation: (data: {
    reason: string;
    otherReason?: string;
    name?: string;
    email?: string;
  }) => void;
}

const CancelOrderForm: React.FC<CancelOrderFormProps> = ({
  orderId,
  onBackToDetails,
  onConfirmCancellation,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const reasons = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Other (please specify)",
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      alert("Please select a reason for cancellation.");
      return;
    }

    onConfirmCancellation({
      reason: selectedReason,
      otherReason:
        selectedReason === "Other (please specify)" ? otherReason : undefined,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
    });
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Cancel Order</h2>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Cancellation Request for Order #{orderId}
          </h3>
          <p className="text-sm text-gray-600">
            Please let us know the reason for cancelling your order.
          </p>
        </div>

        {/* Reason for Cancellation */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Reason for Cancellation</h4>
          <div className="space-y-2">
            {reasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  selectedReason === reason
                    ? "bg-green-50 border-green-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-5 h-5 mr-3 rounded border flex items-center justify-center ${
                    selectedReason === reason
                      ? "bg-green-700 border-green-700"
                      : "border-gray-400"
                  }`}
                >
                  {selectedReason === reason && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={`text-gray-800 ${
                    selectedReason === reason ? "font-medium" : ""
                  }`}
                >
                  {reason}
                </span>
                <input
                  type="checkbox"
                  checked={selectedReason === reason}
                  onChange={() =>
                    setSelectedReason(selectedReason === reason ? "" : reason)
                  }
                  className="hidden"
                />
              </label>
            ))}
          </div>

          {/* Other Reason Textarea */}
          {selectedReason === "Other (please specify)" && (
            <textarea
              className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700"
              rows={3}
              placeholder="Please provide a brief explanation..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
        </div>

        {/* Optional Contact Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">
            Contact Information (Optional)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onBackToDetails}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
          >
            Back to Order Details
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderForm;
