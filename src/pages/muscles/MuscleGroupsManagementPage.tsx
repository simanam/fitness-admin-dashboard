// src/pages/muscles/MuscleGroupsManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Plus, Layers } from 'lucide-react';
import MuscleGroupHierarchyView from '../../components/muscles/MuscleGroupHierarchyView';
import MuscleGroupDetail from '../../components/muscles/MuscleGroupDetail';
import MuscleGroupReorder from '../../components/muscles/MuscleGroupReorder';
import MuscleGroupForm from '../../components/muscles/MuscleGroupForm';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import Modal from '../../components/ui/modal';
import { useMuscleGroupHierarchy } from '../../hooks/useMuscleGroupHierarchy';
import { useMuscleGroupWithAncestors } from '../../hooks/useMuscleGroupWithAncestors';
import { MuscleGroup } from '../../api/muscleService';
import { MuscleGroupHierarchyItem } from '../../api/muscleGroupService';

const MuscleGroupsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedGroupId = queryParams.get('group');

  const {
    hierarchy,
    isLoading: isHierarchyLoading,
    createMuscleGroup,
    updateMuscleGroup,
    deleteMuscleGroup,
    moveMuscleGroup,
    reorderMuscleGroups,
  } = useMuscleGroupHierarchy();

  const { group: selectedGroup, ancestors } =
    useMuscleGroupWithAncestors(selectedGroupId);

  // State for filter options and tabs
  const [flatGroups, setFlatGroups] = useState<MuscleGroup[]>([]);
  const [childGroups, setChildGroups] = useState<MuscleGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'structure' | 'reorder'>(
    'structure'
  );

  // State for modal and dialog controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentGroup, setCurrentGroup] =
    useState<MuscleGroupHierarchyItem | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // Flatten hierarchy for form selection and other operations
  useEffect(() => {
    const getAllGroups = (
      items: MuscleGroupHierarchyItem[],
      result: MuscleGroup[] = []
    ): MuscleGroup[] => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          getAllGroups(item.children, result);
        }
      });
      return result;
    };

    setFlatGroups(getAllGroups(hierarchy));

    // Get child groups of selected group
    if (selectedGroupId) {
      const findChildren = (
        items: MuscleGroupHierarchyItem[],
        parentId: string
      ): MuscleGroup[] => {
        for (const item of items) {
          if (item.id === parentId) {
            return item.children || [];
          }
          if (item.children && item.children.length > 0) {
            const children = findChildren(item.children, parentId);
            if (children.length > 0) return children;
          }
        }
        return [];
      };

      setChildGroups(findChildren(hierarchy, selectedGroupId));
    } else {
      setChildGroups([]);
    }
  }, [hierarchy, selectedGroupId]);

  // Handler for adding a root group
  const handleAddRoot = () => {
    setCurrentGroup(null);
    setParentId(null);
    setShowAddModal(true);
  };

  // Handler for adding a child group
  const handleAddChild = (parentId: string) => {
    setCurrentGroup(null);
    setParentId(parentId);
    setShowAddModal(true);
  };

  // Handler for editing a group
  const handleEditGroup = (group: MuscleGroupHierarchyItem) => {
    setCurrentGroup(group);
    setShowEditModal(true);
  };

  // Handler for deleting a group
  const handleDeleteGroup = (group: MuscleGroupHierarchyItem) => {
    setCurrentGroup(group);
    setShowDeleteDialog(true);
  };

  // Handler for moving a group
  const handleMoveGroup = async (groupId: string, targetId: string | null) => {
    await moveMuscleGroup(groupId, targetId);

    // If the moved group was selected, update the URL
    if (selectedGroupId === groupId) {
      navigate(`/muscles/groups${targetId ? `?group=${targetId}` : ''}`);
    }
  };

  // Handler for creating a new group
  const handleCreateGroup = async (data: any) => {
    try {
      // Convert empty string to null for parentGroupId
      const formattedData = {
        ...data,
        parentGroupId: data.parentGroupId || parentId || null,
      };

      const newGroup = await createMuscleGroup(formattedData);
      setShowAddModal(false);

      // Navigate to the new group if created as a child
      if (formattedData.parentGroupId) {
        navigate(`/muscles/groups?group=${newGroup.id}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Handler for updating a group
  const handleUpdateGroup = async (data: any) => {
    if (!currentGroup) return;

    try {
      // Convert empty string to null for parentGroupId
      const formattedData = {
        ...data,
        parentGroupId: data.parentGroupId || null,
      };

      await updateMuscleGroup(currentGroup.id, formattedData);
      setShowEditModal(false);

      // Update URL if parent changed
      if (
        selectedGroupId === currentGroup.id &&
        currentGroup.parentGroupId !== formattedData.parentGroupId
      ) {
        navigate(`/muscles/groups?group=${currentGroup.id}`);
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async () => {
    if (!currentGroup) return;

    const success = await deleteMuscleGroup(currentGroup.id);
    if (success) {
      setShowDeleteDialog(false);
      setCurrentGroup(null);

      // If deleted group was selected, go back to main groups page
      if (selectedGroupId === currentGroup.id) {
        navigate('/muscles/groups');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/muscles')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Muscle Groups</h1>
        </div>

        <button
          onClick={handleAddRoot}
          className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          <Plus size={16} className="mr-1" />
          Add Group
        </button>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('structure')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'structure'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers className="inline-block h-5 w-5 mr-2" />
            Group Structure
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reorder'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers className="inline-block h-5 w-5 mr-2" />
            Reorder Groups
          </button>
        </nav>
      </div>

      {/* Main content area */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left sidebar - Hierarchy visualization */}
          <div className="lg:col-span-2">
            <MuscleGroupHierarchyView
              hierarchy={hierarchy}
              isLoading={isHierarchyLoading}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onAddRoot={handleAddRoot}
              onAddChild={handleAddChild}
              onMove={handleMoveGroup}
            />
          </div>

          {/* Right content - Group details or info message */}
          <div className="lg:col-span-3">
            {selectedGroup ? (
              <MuscleGroupDetail
                group={selectedGroup}
                ancestors={ancestors}
                children={childGroups}
              />
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <div className="flex">
                  <Info className="h-6 w-6 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-blue-800">
                      About Muscle Groups
                    </h3>
                    <div className="mt-2 text-blue-700 space-y-4">
                      <p>
                        Muscle groups are used to organize muscles in a
                        hierarchical structure. Select a group from the
                        hierarchy on the left to view its details.
                      </p>
                      <p>
                        You can create top-level groups (like "Upper Body") and
                        then add child groups (like "Arms", "Shoulders") to
                        build a complete organization.
                      </p>
                      <p>
                        <strong>Tips:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Drag and drop groups to move them in the hierarchy
                        </li>
                        <li>
                          Use the "Reorder Groups" tab to change the display
                          order
                        </li>
                        <li>Groups can have both muscles and child groups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reorder tab content */}
      {activeTab === 'reorder' && (
        <MuscleGroupReorder
          groups={flatGroups}
          isLoading={isHierarchyLoading}
          onReorder={reorderMuscleGroups}
        />
      )}

      {/* Add group modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={parentId ? 'Add Child Group' : 'Add Muscle Group'}
        size="md"
      >
        <MuscleGroupForm
          groups={flatGroups}
          initialData={parentId ? { parentGroupId: parentId } : undefined}
          isLoading={isHierarchyLoading}
          onSubmit={handleCreateGroup}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit group modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Muscle Group"
        size="md"
      >
        <MuscleGroupForm
          groups={flatGroups}
          initialData={currentGroup || undefined}
          isLoading={isHierarchyLoading}
          onSubmit={handleUpdateGroup}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Muscle Group"
        message={
          <div>
            <p>
              Are you sure you want to delete{' '}
              <strong>{currentGroup?.name}</strong>?
            </p>
            {currentGroup?.children && currentGroup.children.length > 0 && (
              <p className="mt-2 text-yellow-600">
                Warning: This will also delete all child groups (
                {currentGroup.children.length}) and may affect muscles assigned
                to these groups.
              </p>
            )}
          </div>
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default MuscleGroupsManagementPage;
