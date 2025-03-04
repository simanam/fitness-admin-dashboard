// src/pages/Profile.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordChangeForm from '../components/common/PasswordChangeForm';

function ProfilePage() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-black mb-6">Your Profile</h1>

      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-medium mb-4">Account Information</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{user?.email}</div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500">Role</div>
          <div className="font-medium capitalize">
            {user?.role?.toLowerCase()}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500">Last Login</div>
          <div className="font-medium">
            {user?.lastLogin
              ? new Date(user.lastLogin).toLocaleString()
              : 'N/A'}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
      </div>

      {showPasswordForm && (
        <PasswordChangeForm
          onSuccess={() => setShowPasswordForm(false)}
          onCancel={() => setShowPasswordForm(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
