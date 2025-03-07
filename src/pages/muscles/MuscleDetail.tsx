// src/pages/muscles/MuscleDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import muscleService, { Muscle } from '../../api/muscleService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import MuscleOverview from './tabs/MuscleOverview';
import MuscleExercises from './tabs/MuscleExercises';

type TabKey = 'overview' | 'exercises';

const MuscleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMuscle = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await muscleService.getMuscle(id);
        setMuscle(data);
      } catch (error) {
        console.error('Error fetching muscle:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load muscle details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMuscle();
  }, [id]);

  const handleDelete = async () => {
    if (!muscle) return;

    setIsDeleting(true);
    try {
      await muscleService.deleteMuscle(muscle.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle deleted successfully',
      });
      navigate('/muscles');
    } catch (error) {
      console.error('Error deleting muscle:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete muscle',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'exercises', label: 'Related Exercises' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!muscle) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/muscles')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{muscle.name}</h1>
            {muscle.commonName && (
              <p className="text-sm text-gray-500">{muscle.commonName}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/muscles/${id}/edit`)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'overview' ? (
          <MuscleOverview muscle={muscle} />
        ) : (
          <MuscleExercises muscleId={muscle.id} />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Muscle"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{muscle.name}</span>? This action
            cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MuscleDetail;
