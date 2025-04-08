// src/pages/exercises/ExerciseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit,
  ArrowLeft,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import exerciseService, { Exercise } from '../../api/exerciseService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import ExerciseOverview from './tabs/ExerciseOverview';
import ExerciseMuscles from './tabs/ExerciseMuscles';
import ExerciseEquipment from './tabs/ExerciseEquipment';
import ExerciseMedia from './tabs/ExerciseMedia';
import ExerciseRelationships from './tabs/ExerciseRelationships';
import ExerciseJoints from './tabs/ExerciseJoints';

type TabKey =
  | 'overview'
  | 'muscles'
  | 'equipment'
  | 'media'
  | 'relationships'
  | 'joints';

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch exercise data
  useEffect(() => {
    if (!id) return;

    const fetchExercise = async () => {
      setIsLoading(true);
      try {
        const data = await exerciseService.getExercise(id);

        setExercise(data);
      } catch (error) {
        console.error('Error fetching exercise:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load exercise details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  // Handle exercise deletion
  const handleDelete = async () => {
    if (!exercise) return;

    setIsDeleting(true);
    try {
      await exerciseService.deleteExercise(exercise.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise deleted successfully',
      });
      navigate('/exercises');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercise',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle exercise publishing
  const handlePublish = async () => {
    if (!exercise) return;

    setIsPublishing(true);
    try {
      const updatedExercise = await exerciseService.updateExerciseStatus(
        exercise.id,
        'PUBLISHED'
      );
      setExercise(updatedExercise);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise published successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to publish exercise',
      });
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  // Handle exercise duplication
  const handleDuplicate = async () => {
    if (!exercise) return;

    try {
      // Create a copy without ID and with "Copy of" prefixed to name
      const { id, created_at, updated_at, ...exerciseData } = exercise;
      const newExercise = {
        ...exerciseData,
        name: `Copy of ${exercise.name}`,
        status: 'DRAFT',
      };

      const createdExercise = await exerciseService.createExercise(newExercise);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise duplicated successfully',
      });

      // Navigate to the new exercise
      navigate(`/exercises/${createdExercise.id}`);
    } catch (error) {
      console.error('Error duplicating exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to duplicate exercise',
      });
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'muscles', label: 'Muscles' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'media', label: 'Media' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'joints', label: 'Joints' }, // Add this line
  ];

  // Render appropriate component based on active tab
  const renderTabContent = () => {
    if (!exercise) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <ExerciseOverview exercise={exercise} setExercise={setExercise} />
        );
      case 'muscles':
        return <ExerciseMuscles exerciseId={exercise.id} />;
      case 'equipment':
        return <ExerciseEquipment exerciseId={exercise.id} />;
      case 'media':
        return <ExerciseMedia exerciseId={exercise.id} />;
      case 'relationships':
        return (
          <ExerciseRelationships exerciseId={exercise.id} exercise={exercise} />
        );
      case 'joints':
        return <ExerciseJoints exerciseId={exercise.id} />;
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if exercise not found
  if (!exercise) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Exercise not found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The exercise you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/exercises')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exercises
        </button>
      </div>
    );
  }

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button, actions and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/exercises')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {exercise.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exercise.status)}`}
              >
                {exercise.status.toLowerCase()}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(exercise.difficulty)}`}
              >
                {exercise.difficulty.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {exercise.status === 'DRAFT' && (
            <button
              onClick={() => setShowPublishDialog(true)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <CheckCircle size={16} className="mr-1 text-green-600" />
              Publish
            </button>
          )}

          <button
            onClick={handleDuplicate}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Copy size={16} className="mr-1" />
            Duplicate
          </button>

          <button
            onClick={() => navigate(`/exercises/${id}/edit`)}
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

      {/* Tabs navigation */}
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
        {renderTabContent()}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Exercise"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{exercise.name}</span>? This action
            cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Publish confirmation dialog */}
      <ConfirmationDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublish}
        title="Publish Exercise"
        message={
          <p>
            Are you sure you want to publish{' '}
            <span className="font-medium">{exercise.name}</span>? Published
            exercises will be visible to API clients.
          </p>
        }
        confirmText="Publish"
        type="info"
        isLoading={isPublishing}
      />
    </div>
  );
};

export default ExerciseDetail;
