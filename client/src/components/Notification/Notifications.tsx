
import{ useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Info, AlertTriangle, XCircle, CheckCircle, Search, ChevronDown, Filter } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { INotification } from '@/types/notification';


// NotificationCard Component
const NotificationCard = ({ notification, onMarkAsRead }: { notification: INotification; onMarkAsRead: (id: string) => void }) => {
  console.log('NotificationCard rendered with notification:', notification);
  const { id, title, message, type, isRead, createdAt } = notification;

  const getIcon = () => {
    switch (type) {
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    if (isRead) return 'bg-white hover:bg-gray-50 border-gray-200';

    switch (type) {
      case 'INFO':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'WARNING':
        return 'bg-amber-50 hover:bg-amber-100 border-amber-200';
      case 'ERROR':
        return 'bg-red-50 hover:bg-red-100 border-red-200';
      case 'SUCCESS':
        return 'bg-green-50 hover:bg-green-100 border-green-200';
      default:
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 p-4 ${getBackgroundColor()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 rounded-full bg-white shadow-sm border">{getIcon()}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>

            {!isRead && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">New</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>

            {!isRead && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => id && onMarkAsRead(id)}
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown Component
const FilterDropdown = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'ALL', label: 'All Types' },
    { value: 'INFO', label: 'Info' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'ERROR', label: 'Error' },
    { value: 'SUCCESS', label: 'Success' },
  ];

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
      >
        <span className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          {selectedOption?.label}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                  value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  console.log('Notifications component rendered with notifications:', notifications);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('unread');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications on page change
useEffect(() => {
  fetchNotifications(page, limit);
}, [page, fetchNotifications, limit]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter !== 'ALL' && notif.type !== filter) return false;

    if (
      searchTerm &&
      !notif.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !notif.message.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const unreadNotifications = filteredNotifications.filter((notif) => !notif.isRead);
  const readNotifications = filteredNotifications.filter((notif) => notif.isRead);

  const markAllAsRead = async () => {
    for (const notif of unreadNotifications) {
      if (notif.id) {
        await markAsRead(notif.id);
      }
    }
  };

  const clearAllRead = () => {
    // Note: This feature would require a backend API to delete read notifications
    console.warn('[Notifications] Clear all read not implemented. Requires backend API.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Back link */}
      <div className="mb-6">
        <button className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notifications"
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter dropdown */}
          <FilterDropdown value={filter} onChange={setFilter} />

          {/* Action buttons */}
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>

          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={clearAllRead}
            disabled={readNotifications.length === 0}
          >
            Clear All Read
          </button>
        </div>
      </div>

      {/* Mobile: Tabs View */}
      {isMobile && (
        <div className="w-full">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Unread
              {unreadNotifications.length > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'read' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('read')}
            >
              Read
              {readNotifications.length > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {readNotifications.length}
                </span>
              )}
            </button>
          </div>

          <div className="mt-0">
            {activeTab === 'unread' && (
              <>
                {unreadNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {unreadNotifications.map((notif) => (
                      <NotificationCard key={notif.id} notification={notif} onMarkAsRead={markAsRead} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10 bg-white rounded-xl border">
                    <p className="text-gray-500">No unread notifications</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'read' && (
              <>
                {readNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {readNotifications.map((notif) => (
                      <NotificationCard key={notif.id} notification={notif} onMarkAsRead={markAsRead} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10 bg-white rounded-xl border">
                    <p className="text-gray-500">No read notifications</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop: Two Column Layout */}
      {!isMobile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unread column */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Unread</h2>
              {unreadNotifications.length > 0 && (
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {unreadNotifications.length}
                </span>
              )}
            </div>

            {unreadNotifications.length > 0 ? (
              <div className="space-y-4">
                {unreadNotifications.map((notif) => (
                  <NotificationCard key={notif.id} notification={notif} onMarkAsRead={markAsRead} />
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-white rounded-xl border">
                <p className="text-gray-500">No unread notifications</p>
              </div>
            )}
          </div>

          {/* Read column */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Read</h2>
              {readNotifications.length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                  {readNotifications.length}
                </span>
              )}
            </div>

            {readNotifications.length > 0 ? (
              <div className="space-y-4">
                {readNotifications.map((notif) => (
                  <NotificationCard key={notif.id} notification={notif} onMarkAsRead={markAsRead} />
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-white rounded-xl border">
                <p className="text-gray-500">No read notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;
