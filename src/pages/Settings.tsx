import React from 'react';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  // Mock data
  const userInfo = {
    fullName: 'John Doe',
    email: 'john.doe@company.com'
  };

  const senderEmail = 'user@fluffly.com';

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
              value={userInfo.fullName}
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
              value={userInfo.email}
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