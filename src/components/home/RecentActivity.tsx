// src/components/home/RecentActivity.tsx
import { useState, useEffect } from 'react';
import { Clock, User, Edit, Plus, Archive } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: 'create' | 'update' | 'publish' | 'archive';
  entityType: 'exercise' | 'muscle' | 'equipment';
  entityName: string;
  timestamp: string;
  userName: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data - in a real app, this would be fetched from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData: ActivityItem[] = [
        {
          id: '1',
          action: 'create',
          entityType: 'exercise',
          entityName: 'Barbell Squat',
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          userName: 'John Doe',
        },
        {
          id: '2',
          action: 'update',
          entityType: 'muscle',
          entityName: 'Quadriceps',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          userName: 'Jane Smith',
        },
        {
          id: '3',
          action: 'publish',
          entityType: 'exercise',
          entityName: 'Pull-up',
          timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          userName: 'John Doe',
        },
        {
          id: '4',
          action: 'archive',
          entityType: 'equipment',
          entityName: 'Smith Machine',
          timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
          userName: 'Admin User',
        },
      ];

      setActivities(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'publish':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'archive':
        return <Archive className="h-4 w-4 text-yellow-500" />;
      default:
        return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = (
    action: string,
    entityType: string,
    entityName: string
  ) => {
    switch (action) {
      case 'create':
        return `Created new ${entityType} "${entityName}"`;
      case 'update':
        return `Updated ${entityType} "${entityName}"`;
      case 'publish':
        return `Published ${entityType} "${entityName}"`;
      case 'archive':
        return `Archived ${entityType} "${entityName}"`;
      default:
        return `Modified ${entityType} "${entityName}"`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>

        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        {getActionIcon(activity.action)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm text-gray-800">
                          {getActionText(
                            activity.action,
                            activity.entityType,
                            activity.entityName
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500 flex">
                          <span className="flex items-center mr-3">
                            <User className="h-3.5 w-3.5 mr-1" />
                            {activity.userName}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
