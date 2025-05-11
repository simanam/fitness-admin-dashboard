// src/pages/equipment/EquipmentDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import equipmentService, { Equipment } from '../../api/equipmentService';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EquipmentOverview from './tabs/EquipmentOverview';
import EquipmentExercises from './tabs/EquipmentExercises';
import EquipmentAlternatives from './tabs/EquipmentAlternatives';
import { useEquipmentDeletion } from '../../hooks/useEquipmentDeletion';

type TabKey = 'overview' | 'exercises' | 'alternatives';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Use our equipment deletion hook
  const {
    isDeleting,
    showDeleteDialog,
    equipmentToDelete,
    confirmDelete,
    cancelDelete,
    deleteEquipment,
  } = useEquipmentDeletion();

  // Fetch equipment data
  useEffect(() => {
    if (!id) return;

    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const data = await equipmentService.getEquipmentById(id);
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load equipment details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [id, showToast]);

  // Handle equipment deletion trigger
  const handleDeleteClick = () => {
    if (equipment) {
      confirmDelete(equipment.id, equipment.name);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'exercises', label: 'Related Exercises' },
    { key: 'alternatives', label: 'Alternatives' },
  ];

  // Get category class for styling
  const getCategoryClass = (category: string) => {
    const categoryColors = {
      FREE_WEIGHTS: 'bg-blue-100 text-blue-800',
      MACHINES: 'bg-green-100 text-green-800',
      CABLES: 'bg-purple-100 text-purple-800',
      BODYWEIGHT: 'bg-yellow-100 text-yellow-800',
      CARDIO: 'bg-red-100 text-red-800',
      ACCESSORIES: 'bg-indigo-100 text-indigo-800',
      BENCHES: 'bg-gray-100 text-gray-800',
      RACKS: 'bg-gray-100 text-gray-800',
    };

    return (
      categoryColors[category as keyof typeof categoryColors] ||
      'bg-gray-100 text-gray-800'
    );
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Render appropriate component based on active tab
  const renderTabContent = () => {
    if (!equipment) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <EquipmentOverview
            equipment={equipment}
            setEquipment={setEquipment}
          />
        );
      case 'exercises':
        return <EquipmentExercises equipmentId={equipment.id} />;
      case 'alternatives':
        return (
          <EquipmentAlternatives
            equipment={equipment}
            setEquipment={setEquipment}
          />
        );
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

  // Show error state if equipment not found
  if (!equipment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Equipment not found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The equipment you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/equipment')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment
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
            onClick={() => navigate('/equipment')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {equipment.name}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getCategoryClass(equipment.category)}`}
              >
                {formatCategoryName(equipment.category)}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${equipment.isCommon ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {equipment.isCommon ? 'Common' : 'Specialized'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/equipment/${id}/edit`)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>

          <button
            onClick={handleDeleteClick}
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
        onClose={cancelDelete}
        onConfirm={deleteEquipment}
        title="Delete Equipment"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{equipmentToDelete?.name}</span>? This
            action cannot be undone. This may affect exercises that use this
            equipment.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EquipmentDetail;
