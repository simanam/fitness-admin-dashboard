// src/pages/joints/CreateJointPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import JointForm from '../../components/joints/JointForm';

const CreateJointPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/joints')}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Joint</h1>
          <p className="text-sm text-gray-500">
            Add a new joint to the database with mobility ranges and movements
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <JointForm />
      </div>
    </div>
  );
};

export default CreateJointPage;
