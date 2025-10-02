/**
 * Notification Center Component
 *
 * Dropdown panel displaying in-app notifications with filtering and actions.
 * Glassmorphic design with smooth animations.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import type { Notification, NotificationType } from '@/types/alerts';
import { Button } from '@/components/ui/Button';

/**
 * Notification icon based on type
 */
function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'price_alert':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
    case 'transaction':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      );
    case 'system':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
}

/**
 * Individual notification item
 */
function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${notification.read
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
        }
      `}
    >
      <div className="flex gap-3">
        <NotificationIcon type={notification.type} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Delete notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-2">{notification.message}</p>

          {notification.metadata?.currentPrice && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Current: ${notification.metadata.currentPrice.toFixed(4)}</span>
              {notification.metadata.targetPrice && (
                <span>Target: ${notification.metadata.targetPrice.toFixed(4)}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{timeAgo}</span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const notifDate = new Date(timestamp);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notifDate.toLocaleDateString();
}

/**
 * NotificationCenter Component
 */
export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
    preferences,
    updatePreferences,
    browserPermission,
    requestBrowserPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Filter notifications
   */
  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl glass border border-white/10 hover:bg-white/10 transition-all duration-200"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown"
          style={{ maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 sticky top-0 glass-strong z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'price_alert', 'transaction', 'system'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                    ${filter === f
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Notification Permission */}
          {browserPermission === 'default' && (
            <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 mb-2">
                    Enable browser notifications to get alerts even when the app is in the background.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={requestBrowserPermission}
                  >
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-400 text-sm">No notifications</p>
                <p className="text-gray-500 text-xs mt-1">
                  {filter === 'all'
                    ? 'Your notifications will appear here'
                    : `No ${filter.replace('_', ' ')} notifications`}
                </p>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>

          {/* Settings Toggle */}
          <div className="p-4 border-t border-white/10 glass-strong">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Sound</span>
              <button
                onClick={() => updatePreferences({ sound: !preferences.sound })}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${preferences.sound ? 'bg-blue-500' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                    ${preferences.sound ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
