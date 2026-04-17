import { AlertCircle } from 'lucide-react';
import '../styles/components/Error.css';

export default function Error({ message, onRetry }) {
  return (
    <div className="error-container">
      <AlertCircle size={32} className="error-icon" />
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-retry">
          Try Again
        </button>
      )}
    </div>
  );
}
