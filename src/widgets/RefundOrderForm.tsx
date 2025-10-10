import React, { useState } from "react";

interface RefundOrderFormProps {
  orderId: string;
  userId: string;
  onBackToDetails: () => void;
  onRefundSuccess?: () => void;
  onConfirmRefund: (data: {
    reason: string;
    otherReason?: string;
  }) => Promise<void>;
}

const refundReasons = [
  "Received a defective product",
  "Received the wrong product",
  "Product not as described",
  "Other (please specify)",
];

const RefundOrderForm: React.FC<RefundOrderFormProps> = ({
  orderId,
  userId,
  onBackToDetails,
  onRefundSuccess,
  onConfirmRefund,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleConfirmRefund = async () => {
    if (!selectedReason) {
      alert("Please select a reason for refund.");
      return;
    }
    setLoading(true);

    try {
      await onConfirmRefund({
        reason: selectedReason,
        otherReason:
          selectedReason === "Other (please specify)" ? otherReason : undefined,
      });
      if (onRefundSuccess) onRefundSuccess();
      onBackToDetails();
    } catch (err: any) {
      alert("Failed to submit refund request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Request Refund</h2>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Refund Request for Order #{orderId}
          </h3>
          <p className="text-sm text-gray-600">
            Please let us know the reason for requesting a refund.
          </p>
        </div>

        {/* Reason for Refund */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Reason for Refund</h4>
          <div className="space-y-2">
            {refundReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  selectedReason === reason
                    ? "bg-green-50 border-green-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="refundReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="mr-3"
                />
                <span>{reason}</span>
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

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onBackToDetails}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
            disabled={loading}
          >
            Back to Order Details
          </button>

          <button
            onClick={handleConfirmRefund}
            className="px-5 py-2 rounded-lg bg-green-800 text-white hover:bg-green-700 font-semibold transition"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Refund"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundOrderForm;
