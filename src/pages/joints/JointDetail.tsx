// src/pages/joints/JointDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import jointService, { Joint } from '../../api/jointService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import JointOverview from './tabs/JointOverview';
import JointMovements from './tabs/JointMovements';
import JointMobilityRange from './tabs/JointMobilityRange';
import TypeBadge from '../../components/joints/TypeBadge';

type TabKey = 'overview' | 'mobility' | 'movements';

const JointDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [joint, setJoint] = useState<Joint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch joint data
  useEffect(() => {
    if (!id) return;

    const fetchJoint = async () => {
      setIsLoading(true);
      try {
        const data = await jointService.getJoint(id);
        setJoint(data);
      } catch (error) {
        console.error('Error fetching joint:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load joint details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoint();
  }, [id, showToast]);

  // Handle joint deletion
  const handleDelete = async () => {
    if (!joint) return;

    setIsDeleting(true);
    try {
      await jointService.deleteJoint(joint.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint deleted successfully',
      });
      navigate('/joints');
    } catch (error) {
      console.error('Error deleting joint:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete joint',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'mobility', label: 'Mobility Range' },
    { key: 'movements', label: 'Movements' },
  ];

  // Render appropriate component based on active tab
  const renderTabContent = () => {
    if (!joint) return null;

    switch (activeTab) {
      case 'overview':
        return <JointOverview joint={joint} />;
      case 'mobility':
        return <JointMobilityRange joint={joint} setJoint={setJoint} />;
      case 'movements':
        return <JointMovements joint={joint} setJoint={setJoint} />;
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

  // Show error state if joint not found
  if (!joint) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Joint not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The joint you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/joints')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Joints
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
            onClick={() => navigate('/joints')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{joint.name}</h1>
            <div className="flex items-center mt-1">
              <TypeBadge type={joint.type} />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/joints/${id}/edit`)}
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

      {/* Joint definition info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            About {joint.type.replace(/_/g, ' ')} joints
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            {getJointTypeDescription(joint.type)}
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
        title="Delete Joint"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{joint.name}</span>? This action
            cannot be undone. This may affect exercises that reference this
            joint.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

// Helper function to get descriptions for different joint types
const getJointTypeDescription = (type: string): string => {
  switch (type) {
    case 'ball_and_socket':
      return 'Ball and socket joints allow movement in multiple planes and are the most mobile type of joint in the body. Examples include the shoulder and hip joints.';
    case 'hinge':
      return 'Hinge joints permit movement in one plane (like a door hinge). Examples include the elbow and knee joints.';
    case 'pivot':
      return 'Pivot joints allow rotational movement around a single axis. Examples include the joint between the first and second vertebrae of the neck.';
    case 'ellipsoidal':
      return 'Ellipsoidal joints (also called condyloid joints) permit movement in two planes. Examples include the wrist joint.';
    case 'saddle':
      return 'Saddle joints are shaped like a saddle, allowing movement in multiple directions. The thumb joint is a prime example of a saddle joint.';
    case 'gliding':
      return 'Gliding joints allow bones to glide past one another in various directions. Examples include joints between the carpal bones in the wrist.';
    default:
      return 'This joint type has specialized movement patterns and structural characteristics.';
  }
};

export default JointDetail;
