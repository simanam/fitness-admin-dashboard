// src/components/home/RecentExercises.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import exerciseService from '../../api/exerciseService';

interface Exercise {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

const RecentExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentExercises = async () => {
      try {
        setIsLoading(true);
        const response = await exerciseService.getExercises({
          page: 1,
          pageSize: 5,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });

        // Handle response
        const exerciseList = response?.data || [];
        setExercises(exerciseList);
      } catch (err) {
        console.error('Error fetching recent exercises:', err);
        setError('Failed to load recent exercises');
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentExercises();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Exercises
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Exercises
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Exercises
          </h3>
          <Link
            to="/exercises"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {exercises && exercises.length > 0 ? (
            exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <Link
                    to={`/exercises/${exercise.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {exercise.name}
                  </Link>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        exercise.status.toLowerCase() === 'published'
                          ? 'bg-green-100 text-green-800'
                          : exercise.status.toLowerCase() === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {exercise.status.toLowerCase()}
                    </span>

                    <span className="flex items-center text-xs text-gray-500 ml-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(exercise.created_at)}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/exercises/${exercise.id}`}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-5 w-5" />
                </Link>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              No exercises available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentExercises;
