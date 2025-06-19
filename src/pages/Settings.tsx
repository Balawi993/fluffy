import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { authAPI } from '../lib/api';

interface UserInfo {
  name: string;
  email: string;
}

const Settings = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.me();
      setUserInfo(response.data.user);
    } catch (err: any) {
      console.error('Error fetching user info:', err);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
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
            <input
              type="text"
              id="fullName"
              className="input bg-gray-50 cursor-not-allowed"
              value={userInfo?.name || ''}
              disabled
              readOnly
            />
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

      {/* Additional Settings Placeholder */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">More Settings</h2>
        <div className="bg-light/50 border-2 border-dashed border-dark/20 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">Additional settings will be available here</p>
          <p className="text-sm text-gray-400">
            Features like notifications, integrations, and billing settings coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 