// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Layers,
  Box,
  Users,
  Database,
  Activity,
  Briefcase,
} from 'lucide-react';

import HomeStats from '../components/home/HomeStats';
import RecentExercises from '../components/home/RecentExercises';
import RecentActivity from '../components/home/RecentActivity';

function HomePage() {
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

      {/* Stats Section - Real-time data */}
      <HomeStats />

      {/* Recent Items Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentExercises />
        <RecentActivity />
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
              <Link
                to="/exercises?status=draft"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View draft exercises
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
              <Link
                to="/muscles/new"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Add new muscle
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
              <Link
                to="/equipment/categories"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Manage categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Shortcuts */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-gray-700" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Joints</h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/joints"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View all joints
              </Link>
              <Link
                to="/joints/new"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Add new joint
              </Link>
              <Link
                to="/movement-patterns"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Manage movement patterns
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-gray-700" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                API Clients
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/clients"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View all API clients
              </Link>
              <Link
                to="/clients/new"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Add new client
              </Link>
              <Link
                to="/clients/usage"
                className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View usage statistics
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
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-700" />
            <h4 className="ml-3 text-md font-medium text-gray-900">
              Admin Users
            </h4>
          </div>
          <div className="mt-2 ml-9 space-y-2">
            <Link
              to="/users"
              className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Manage admin users
            </Link>
            <Link
              to="/users/new"
              className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Add new admin user
            </Link>
            <Link
              to="/profile"
              className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Edit your profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
