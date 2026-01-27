
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  return (
    <div className={`
      fixed top-6 right-6 z-[2000] min-w-[300px] p-4 rounded-xl shadow-2xl animate-slide-in-right flex items-center gap-3 text-white
      ${type === 'success' ? 'bg-secondary' : 'bg-danger'}
    `}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
      <span className="font-semibold">{message}</span>
    </div>
  );
};

export default Toast;
