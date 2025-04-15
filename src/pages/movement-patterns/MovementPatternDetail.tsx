// src/pages/movement-patterns/MovementPatternDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import movementPatternService, {
  MovementPattern,
} from '../../api/movementPatternService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import CategoryBadge from '../../components/movement-patterns/CategoryBadge';
import TypeBadge from '../../components/movement-patterns/TypeBadge';
import RelatedPatternsSection from './sections/RelatedPatternsSection';
import RelatedExercisesSection from './sections/RelatedExercisesSection';

type TabKey = 'overview' | 'related-patterns' | 'exercises';

const MovementPatternDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pattern, setPattern] = useState<MovementPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [patternSummary, setPatternSummary] = useState<any>(null);

  // Fetch pattern data
  useEffect(() => {
    if (!id) return;

    const fetchPatternData = async () => {
      setIsLoading(true);
      try {
        const [patternData, summaryData] = await Promise.all([
          movementPatternService.getMovementPattern(id),
          movementPatternService.getPatternSummary(id),
        ]);

        setPattern(patternData);
        setPatternSummary(summaryData);
      } catch (error) {
        console.error('Error fetching movement pattern:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load movement pattern details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatternData();
  }, [id, showToast]);

  // Handle pattern deletion
  const handleDelete = async () => {
    if (!pattern) return;

    setIsDeleting(true);
    try {
      await movementPatternService.deleteMovementPattern(pattern.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Movement pattern deleted successfully',
      });
      navigate('/movement-patterns');
    } catch (error) {
      console.error('Error deleting movement pattern:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete movement pattern',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'related-patterns', label: 'Related Patterns' },
    { key: 'exercises', label: 'Related Exercises' },
  ];

  // Render the content based on the active tab
  const renderTabContent = () => {
    if (!pattern) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Description
              </h3>
              {pattern.description ? (
                <p className="text-gray-700">{pattern.description}</p>
              ) : (
                <p className="text-gray-500 italic">
                  No description available.
                </p>
              )}
            </div>

            {patternSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Related Patterns
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {patternSummary.relatedPatternsCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Same Category
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {patternSummary.sameCategoryCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Same Type
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {patternSummary.sameTypeCount || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'related-patterns':
        return <RelatedPatternsSection patternId={pattern.id} />;

      case 'exercises':
        return <RelatedExercisesSection patternId={pattern.id} />;

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

  // Show error state if pattern not found
  if (!pattern) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Movement pattern not found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The movement pattern you're looking for doesn't exist or has been
          removed.
        </p>
        <button
          onClick={() => navigate('/movement-patterns')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movement Patterns
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button, actions and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/movement-patterns')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pattern.name}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <TypeBadge type={pattern.patternType} />
              <CategoryBadge category={pattern.category} />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/movement-patterns/${id}/edit`)}
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

      {/* Movement Pattern info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            About {pattern.patternType.replace(/_/g, ' ')} movement patterns
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            {getPatternTypeDescription(pattern.patternType)}
          </p>
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
        title="Delete Movement Pattern"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{pattern.name}</span>? This action
            cannot be undone. This may affect exercises that use this movement
            pattern.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

// Helper function to get descriptions for different pattern types
const getPatternTypeDescription = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'push':
      return 'Push patterns involve moving a weight away from your body. Examples include push-ups, bench presses, and overhead presses.';
    case 'pull':
      return 'Pull patterns involve drawing a weight toward your body. Examples include pull-ups, rows, and bicep curls.';
    case 'squat':
      return 'Squat patterns involve bending at the hips and knees to lower the body. Examples include bodyweight squats, goblet squats, and front squats.';
    case 'hinge':
      return 'Hinge patterns involve bending at the hips while keeping the spine neutral. Examples include deadlifts, kettlebell swings, and good mornings.';
    case 'lunge':
      return 'Lunge patterns involve stepping one foot forward or backward into a split stance. Examples include forward lunges, reverse lunges, and split squats.';
    case 'rotation':
      return 'Rotation patterns involve twisting movements around the spine. Examples include Russian twists, medicine ball rotational throws, and cable rotations.';
    case 'gait':
      return "Gait patterns involve walking, running, or sprinting movements. Examples include sled pushes, farmer's carries, and prowler drags.";
    case 'carry':
      return "Carry patterns involve holding weight while walking. Examples include farmer's carries, suitcase carries, and waiter's walks.";
    default:
      return 'This movement pattern involves specific mechanical principles and muscular actions that form a foundation for various exercises.';
  }
};

export default MovementPatternDetail;
