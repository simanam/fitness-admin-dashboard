// src/pages/joints/EditJointPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import jointService from '../../api/jointService';
import JointForm from '../../components/joints/JointForm';

const EditJointPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [jointData, setJointData] = useState<any>(null);

  useEffect(() => {
    const fetchJoint = async () => {
      try {
        if (!id) return;

        setIsLoading(true);
        const joint = await jointService.getJoint(id);
        setJointData(joint);
      } catch (error) {
        console.error('Error fetching joint:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load joint data',
        });
        navigate('/joints');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoint();
  }, [id, navigate, showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!jointData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(`/joints/${id}`)}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Joint</h1>
          <p className="text-sm text-gray-500">{jointData.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <JointForm jointId={id} initialData={jointData} />
      </div>
    </div>
  );
};

export default EditJointPage;
