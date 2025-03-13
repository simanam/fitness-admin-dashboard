// src/components/users/ActivityItem.tsx
import React from 'react';
import {
  LogIn,
  LogOut,
  Key,
  UserPlus,
  Edit,
  Trash2,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdminUserActivity } from '../../api/adminUserService';

interface ActivityItemProps {
  activity: AdminUserActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  // Get icon based on activity action
  const getActivityIcon = () => {
    switch (activity.action) {
      case 'LOGIN':
        return <LogIn className="h-5 w-5 text-green-500" />;
      case 'LOGOUT':
        return <LogOut className="h-5 w-5 text-orange-500" />;
      case 'PASSWORD_CHANGE':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'CREATE':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'UPDATE':
        return <Edit className="h-5 w-5 text-yellow-500" />;
      case 'DELETE':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format activity text
  const getActivityText = () => {
    switch (activity.action) {
      case 'LOGIN':
        return 'Logged in';
      case 'LOGOUT':
        return 'Logged out';
      case 'PASSWORD_CHANGE':
        return 'Changed password';
      case 'CREATE':
        return `Created ${activity.details?.resource || 'resource'}`;
      case 'UPDATE':
        return `Updated ${activity.details?.resource || 'resource'}`;
      case 'DELETE':
        return `Deleted ${activity.details?.resource || 'resource'}`;
      default:
        return `Performed ${activity.action.toLowerCase().replace('_', ' ')}`;
    }
  };

  // Format time ago
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(activity.timestamp), {
        addSuffix: true,
      });
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <div className="flex items-start py-3 border-b border-gray-200 last:border-0">
      <div className="flex-shrink-0 mt-1">{getActivityIcon()}</div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {getActivityText()}
          </p>
          <p className="text-xs text-gray-500">{getTimeAgo()}</p>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          <p>IP: {activity.ipAddress}</p>
          <p className="truncate max-w-xs" title={activity.userAgent}>
            {activity.userAgent.split(' ')[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
