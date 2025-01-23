import React, { useState } from 'react';
import { Send, Wallet, CheckCircle } from 'lucide-react';
import '../styles/pages/paymentRequest.css';

const PaymentRequestPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverWallet] = useState('0x1234...5678');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const handleApprovePayment = () => {
    // Implement actual payment logic
    setPaymentStatus('approved');
  };

  return (
    <div className="payment-request-container">
      <div className="payment-card">
        <div className="payment-header">
          <Wallet size={32} color="var(--accent)" />
          <h2>Payment Request</h2>
        </div>

        <div className="receiver-info">
          <label>Receiver Wallet</label>
          <div className="wallet-display">{receiverWallet}</div>
        </div>

        <div className="payment-details">
          <div className="form-group">
            <label>Payment Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={paymentStatus !== 'pending'}
            />
          </div>

          <div className="form-group">
            <label>Payment Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe payment reason"
              disabled={paymentStatus !== 'pending'}
            />
          </div>

          {paymentStatus === 'pending' && (
            <button onClick={handleApprovePayment} className="approve-button">
              <Send size={20} />
              Approve Payment
            </button>
          )}

          {paymentStatus === 'approved' && (
            <div className="status-approved">
              <CheckCircle size={32} color="var(--accent)" />
              <p>Payment Approved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestPage;
