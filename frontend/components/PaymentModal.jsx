'use client';

import { useState } from 'react';

export default function PaymentModal({ gig, onConfirm, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // TODO: Integrate payment gateway
    setTimeout(() => {
      onConfirm?.();
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800">Confirm Payment</h2>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>Worker Pay</span><span>₹{gig?.totalPay || 0}</span></div>
          <div className="flex justify-between"><span>Platform Fee (8%)</span><span>₹{gig?.platformFee || 0}</span></div>
          <hr />
          <div className="flex justify-between font-bold text-gray-800">
            <span>Total</span><span>₹{(gig?.totalPay || 0) + (gig?.platformFee || 0)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handlePayment} disabled={processing}
            className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
