import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Mail, XCircle } from 'lucide-react';
import paymentsAPI from '../api/payments';

export default function PaymentResultPage({ status = 'success' }) {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  const cancelled = searchParams.get('cancelled') === 'true';
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(transactionId));

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    paymentsAPI.getPaymentByTransaction(transactionId)
      .then(setPayment)
      .catch((err) => setError(err.detail || 'Could not load payment details'))
      .finally(() => setLoading(false));
  }, [transactionId]);

  const handleDownload = async () => {
    if (!transactionId) return;
    try {
      setError('');
      const blob = await paymentsAPI.downloadPaymentReportByTransaction(transactionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-report-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.detail || 'Failed to download report');
    }
  };

  const handleEmail = async () => {
    if (!transactionId) return;
    try {
      setError('');
      const response = await paymentsAPI.emailPaymentReportByTransaction(transactionId);
      setMessage(response.detail || 'Report sent to your email');
    } catch (err) {
      setError(err.detail || 'Failed to send report email');
    }
  };

  const isSuccess = status === 'success';

  return (
    <div className="support-page" style={{ padding: '48px 16px' }}>
      <div className="support-content" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        {isSuccess ? (
          <CheckCircle size={56} color="#16a34a" />
        ) : (
          <XCircle size={56} color="#dc2626" />
        )}
        <h1>{isSuccess ? 'Payment Successful' : cancelled ? 'Payment Cancelled' : 'Payment Failed'}</h1>
        <p>
          {isSuccess
            ? 'Your SSLCommerz payment has been processed.'
            : 'Your payment was not completed. You can try again from the plan or service page.'}
        </p>

        {transactionId && <p><strong>Transaction ID:</strong> {transactionId}</p>}
        {loading && <p>Loading payment details...</p>}
        {payment && (
          <div style={{ marginTop: 16, lineHeight: 1.8 }}>
            <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
            <p><strong>Status:</strong> {payment.status_display || payment.status}</p>
            <p><strong>Gateway:</strong> {payment.gateway_display || payment.gateway}</p>
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}. You can still download or email the report using this transaction ID.
          </div>
        )}
        {message && <div className="success-message">{message}</div>}

        {isSuccess && transactionId && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            <button type="button" className="btn btn-primary" onClick={handleDownload}>
              <Download size={18} />
              Download Report
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleEmail}>
              <Mail size={18} />
              Email Report
            </button>
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">Back Home</Link>
        </div>
      </div>
    </div>
  );
}
