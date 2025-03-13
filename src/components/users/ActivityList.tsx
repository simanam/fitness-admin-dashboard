// src/components/users/ActivityList.tsx
import React from 'react';
import { ClipboardList, RotateCw } from 'lucide-react';
import ActivityItem from './ActivityItem';
import { AdminUserActivity } from '../../api/adminUserService';

interface ActivityListProps {
  activities: AdminUserActivity[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  isLoading,
  onRefresh,
}) => {
  // Render loading state
  if (isLoading) {
    return (
      <div className="py-4 space-y-3">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="animate-pulse flex items-start">
            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state if no activities
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p>No activity records found</p>
        <button
          onClick={onRefresh}
          className="mt-3 inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <RotateCw className="h-3 w-3 mr-1" />
          Refresh
        </button>
      </div>
    );
  }

  // Render activity list
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <RotateCw className="h-3 w-3 mr-1" />
          Refresh
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityList;
