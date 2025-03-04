// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Layers,
  Box,
  Users,
  Database,
  TrendingUp,
} from 'lucide-react';

function HomePage() {
  // Example stats for the dashboard
  const stats = [
    {
      name: 'Total Exercises',
      value: '152',
      change: '+12',
      changeType: 'increase',
    },
    {
      name: 'Total Muscles',
      value: '57',
      change: '+3',
      changeType: 'increase',
    },
    {
      name: 'Total Equipment',
      value: '45',
      change: '+5',
      changeType: 'increase',
    },
    {
      name: 'Active Users',
      value: '1,258',
      change: '+8.1%',
      changeType: 'increase',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                  {stat.name.includes('Exercise') ? (
                    <Dumbbell className="h-6 w-6 text-gray-700" />
                  ) : stat.name.includes('Muscle') ? (
                    <Layers className="h-6 w-6 text-gray-700" />
                  ) : stat.name.includes('Equipment') ? (
                    <Box className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Users className="h-6 w-6 text-gray-700" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.changeType === 'increase' ? (
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-red-500 transform rotate-180" />
                      )}
                      <span className="ml-1">{stat.change}</span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-gray-700" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Exercises
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/exercises"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View all exercises
              </Link>
              <Link
                to="/exercises/new"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Add new exercise
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-gray-700" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Muscles
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/muscles"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View all muscles
              </Link>
              <Link
                to="/muscles/groups"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Manage muscle groups
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Box className="h-8 w-8 text-gray-700" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Equipment
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/equipment"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View all equipment
              </Link>
              <Link
                to="/equipment/new"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Add new equipment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Administration
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-gray-700" />
                <h4 className="ml-3 text-md font-medium text-gray-900">
                  Admin Users
                </h4>
              </div>
              <div className="mt-2 ml-9">
                <Link
                  to="/users"
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Manage admin users
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <Database className="h-6 w-6 text-gray-700" />
                <h4 className="ml-3 text-md font-medium text-gray-900">
                  API Clients
                </h4>
              </div>
              <div className="mt-2 ml-9">
                <Link
                  to="/clients"
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Manage API clients
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
