import React from 'react';
import { Joint } from '../../../api/jointService';
import JointMovementManager from '../../../components/joints/JointMovementManager';

interface JointMovementsProps {
  joint: Joint;
  setJoint: React.Dispatch<React.SetStateAction<Joint | null>>;
}

const JointMovements: React.FC<JointMovementsProps> = ({ joint, setJoint }) => {
  // Handle joint update
  const handleJointUpdate = (updatedJoint: Joint) => {
    setJoint(updatedJoint);
  };

  return (
    <div className="space-y-6">
      {/* Use the JointMovementManager component for consistency */}
      <JointMovementManager joint={joint} onUpdate={handleJointUpdate} />
    </div>
  );
};

export default JointMovements;
