// src/components/home/HomeStats.tsx
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Layers,
  Box,
  Key,
  Briefcase,
  Activity,
} from 'lucide-react';
import exerciseService from '../../api/exerciseService';
import muscleService from '../../api/muscleService';
import equipmentService from '../../api/equipmentService';
import clientService from '../../api/clientService';
import jointService from '../../api/jointService';
import apiKeyService from '../../api/apiKeyService';

interface StatItem {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
}

const HomeStats = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch stats in parallel
        const [
          exercisesResponse,
          musclesResponse,
          equipmentResponse,
          clientsResponse,
          jointsResponse,
        ] = await Promise.all([
          exerciseService.getExercises({ page: 1, per_page: 1 }),
          muscleService.getMuscles(),
          equipmentService.getEquipment({ page: 1, per_page: 1 }),
          clientService.getClients({ page: 1, per_page: 1 }),
          jointService.getJoints({ page: 1, limit: 1 }),
        ]);

        // Get the first client to fetch its API keys
        let activeApiKeys = 0;
        if (
          clientsResponse.meta?.total > 0 &&
          clientsResponse.data?.length > 0
        ) {
          const firstClientId = clientsResponse.data[0].id;
          const apiKeys = await apiKeyService.getApiKeys(firstClientId, {
            active: true,
          });
          activeApiKeys = apiKeys.length;
        }

        // Extract counts
        const totalExercises = exercisesResponse.meta?.total || 0;
        const totalMuscles = musclesResponse?.length || 0;
        const totalEquipment = equipmentResponse.meta?.total || 0;
        const totalClients = clientsResponse.meta?.total || 0;
        const totalJoints = jointsResponse.meta?.total || 0;

        // In a real app, we'd get the change from the API
        // For this demo, we'll generate some fake changes
        const generateChange = () => {
          const change = Math.floor(Math.random() * 20) - 5;
          return {
            value: change > 0 ? `+${change}` : `${change}`,
            type: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
          };
        };

        // Construct stats array
        const statsData: StatItem[] = [
          {
            name: 'Total Exercises',
            value: totalExercises.toString(),
            change: generateChange().value,
            changeType: generateChange().type as
              | 'increase'
              | 'decrease'
              | 'neutral',
            icon: <Dumbbell className="h-6 w-6 text-gray-700" />,
          },
          {
            name: 'Total Muscles',
            value: totalMuscles.toString(),
            change: generateChange().value,
            changeType: generateChange().type as
              | 'increase'
              | 'decrease'
              | 'neutral',
            icon: <Layers className="h-6 w-6 text-gray-700" />,
          },
          {
            name: 'Total Equipment',
            value: totalEquipment.toString(),
            change: generateChange().value,
            changeType: generateChange().type as
              | 'increase'
              | 'decrease'
              | 'neutral',
            icon: <Box className="h-6 w-6 text-gray-700" />,
          },
          {
            name: 'Total Joints',
            value: totalJoints.toString(),
            change: generateChange().value,
            changeType: generateChange().type as
              | 'increase'
              | 'decrease'
              | 'neutral',
            icon: <Activity className="h-6 w-6 text-gray-700" />,
          },
          {
            name: 'API Clients',
            value: totalClients.toString(),
            change: generateChange().value,
            changeType: generateChange().type as
              | 'increase'
              | 'decrease'
              | 'neutral',
            icon: <Briefcase className="h-6 w-6 text-gray-700" />,
          },
          {
            name: 'Active API Keys',
            value: activeApiKeys.toString(),
            change: '+3',
            changeType: 'increase',
            icon: <Key className="h-6 w-6 text-gray-700" />,
          },
        ];

        setStats(statsData);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-200 rounded-md p-3 h-12 w-12" />
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-3 h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                {stat.icon}
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
                        : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : stat.changeType === 'decrease' ? (
                      <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    ) : null}
                    <span className="ml-1">{stat.change}</span>
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;
