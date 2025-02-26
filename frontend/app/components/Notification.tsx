import { useState, useEffect } from "react";

interface NotificationProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type = "success",
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const typeStyles: Record<string, string> = {
    success: "text-green-700 border-2 border-green-500",
    error: "text-red-700 border-2 border-red-500",
    warning: "text-yellow-700 border-2 border-yellow-500",
    info: "text-blue-700 border-2 border-blue-500",
  };

  const icon: Record<string, string> = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 flex items-center p-4 border-l-4 rounded-lg shadow-md transition-transform duration-300 w-full ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} ${typeStyles[type]}`}
    >
      <span className="text-2xl">{icon[type]}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-600 hover:text-gray-800"
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
