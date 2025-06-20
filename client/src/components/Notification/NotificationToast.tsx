import { INotification } from "@/types/notification";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X 
} from "lucide-react";

export const NotificationToast: React.FC<{
  notification: INotification;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}> = ({ notification, onMarkAsRead }) => {
  
  const getIconAndColors = (type: INotification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          accentColor: 'bg-green-500'
        };
      case 'ERROR':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          accentColor: 'bg-red-500'
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          accentColor: 'bg-yellow-500'
        };
      case 'INFO':
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          accentColor: 'bg-blue-500'
        };
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onMarkAsRead(notification.id);
      toast.dismiss(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.dismiss(notification.id);
  };

  const { icon: Icon, iconColor, accentColor } = getIconAndColors(notification.type);

  return (
    <div 
      className={`
        relative flex items-start gap-3 p-4 rounded-lg shadow-lg
        bg-white
        hover:shadow-xl transition-all duration-300 ease-in-out
        cursor-pointer min-w-80 max-w-md w-auto
        transform hover:scale-[1.02]
      `}
      onClick={handleMarkAsRead}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${accentColor}`} />
      
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {notification.title}
            </p>
            <p className="text-gray-700 text-sm mt-1 leading-relaxed">
              {notification.message}
            </p>
            {!notification.isRead && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs text-gray-500">New</span>
              </div>
            )}
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};