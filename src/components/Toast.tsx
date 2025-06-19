import { useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`
        flex items-center p-4 rounded-xl shadow-lg max-w-sm
        ${type === 'success' 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
        }
      `}>
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none"
            onClick={onClose}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 