import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { authAPI } from '../lib/api';
import { Toast } from '../components';
import { useToast } from '../lib/useToast';

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
}

const Settings = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const { toasts, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.me();
      setUserInfo(response.data.data.user);
      setFullName(response.data.data.user.fullName);
    } catch (err: any) {
      console.error('Error fetching user info:', err);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      showError('Full name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fullName: fullName.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setUserInfo(prev => prev ? { ...prev, fullName: fullName.trim() } : null);
        setIsEditingName(false);
        showSuccess('Full name updated successfully');
      } else {
        showError(data.message || 'Failed to update full name');
      }
    } catch (error: any) {
      console.error('Error updating name:', error);
      showError('Failed to update full name');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(userInfo?.fullName || '');
    setIsEditingName(false);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      showError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      showError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showSuccess('Password changed successfully');
      } else {
        showError(data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showError('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const senderEmail = userInfo?.email || 'user@fluffly.com';

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Loading your account information...</p>
        </div>
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and email settings</p>
      </div>

      {/* Account Info Section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <UserCircleIcon className="w-6 h-6 mr-3 text-gray-600" />
          <h2 className="text-xl font-semibold">Account Info</h2>
        </div>
        
        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  id="fullName"
                  className="input flex-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={saving}
                  className="btn-primary px-4 py-2 flex items-center"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="btn-secondary px-4 py-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1 bg-gray-50 cursor-not-allowed"
                  value={userInfo?.fullName || ''}
                  readOnly
                />
                <button
                  onClick={() => setIsEditingName(true)}
                  className="btn-secondary px-4 py-2"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="form-hint">
              Your full name as it appears on your account
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input bg-gray-50 cursor-not-allowed"
              value={userInfo?.email || ''}
              disabled
              readOnly
            />
            <p className="form-hint">
              Your account email address used for login and notifications
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                className="input flex-1 bg-gray-50 cursor-not-allowed"
                value="••••••••"
                readOnly
              />
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <KeyIcon className="w-4 h-4" />
                Change Password
              </button>
            </div>
            <p className="form-hint">
              Click "Change Password" to update your account password
            </p>
          </div>
        </div>
      </div>

      {/* Sender Email Settings Section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <EnvelopeIcon className="w-6 h-6 mr-3 text-gray-600" />
          <h2 className="text-xl font-semibold">Sender Email Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              Default Sender Address
            </label>
            <div className="flex items-center p-3 bg-light border-2 border-dark/20 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-600" />
              <span className="font-medium text-dark">{senderEmail}</span>
            </div>
            <p className="form-hint">
              This email address will be used as the default sender for all your campaigns
            </p>
          </div>
          
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 mr-3 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-dark mb-2">About Sender Addresses</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your sender address is automatically configured and verified for optimal email delivery. 
                  This ensures your campaigns reach recipients' inboxes and maintain high deliverability rates. 
                  Contact support if you need to use a custom domain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="btn-primary flex-1 py-2 flex items-center justify-center"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={changingPassword}
                className="btn-secondary flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Settings; 