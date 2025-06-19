import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { campaignsAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  sender: string;
  group: string;
  status: string;
  createdAt: string;
}

interface SentEmail {
  id: string;
  messageId: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

interface EmailEvent {
  id: string;
  eventType: string;
  contactEmail: string;
  timestamp: string;
  metadata?: any;
}

const CampaignAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show a placeholder since we need to implement these endpoints
      // In a real implementation, you'd fetch:
      // - Campaign details
      // - Sent emails for this campaign
      // - Email events for this campaign
      
      // Placeholder data
      setCampaign({
        id: id!,
        name: 'Sample Campaign',
        subject: 'Welcome to Fluffly!',
        sender: 'Team Fluffly',
        group: 'Newsletter Subscribers',
        status: 'sent',
        createdAt: new Date().toISOString()
      });
      
      setSentEmails([
        {
          id: '1',
          messageId: 'msg_123',
          contactEmail: 'user1@example.com',
          status: 'delivered',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          messageId: 'msg_124',
          contactEmail: 'user2@example.com',
          status: 'opened',
          createdAt: new Date().toISOString()
        }
      ]);
      
      setEmailEvents([
        {
          id: '1',
          eventType: 'delivered',
          contactEmail: 'user1@example.com',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          eventType: 'opened',
          contactEmail: 'user2@example.com',
          timestamp: new Date().toISOString()
        }
      ]);
      
    } catch (error: any) {
      console.error('Error fetching campaign data:', error);
      showError('Failed to load campaign analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'opened': return 'text-purple-600 bg-purple-100';
      case 'clicked': return 'text-orange-600 bg-orange-100';
      case 'bounced': return 'text-red-600 bg-red-100';
      case 'complained': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent': return <EnvelopeIcon className="w-5 h-5" />;
      case 'delivered': return <EnvelopeIcon className="w-5 h-5" />;
      case 'opened': return <EyeIcon className="w-5 h-5" />;
      case 'clicked': return <CursorArrowRaysIcon className="w-5 h-5" />;
      case 'bounced': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'complained': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <EnvelopeIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign analytics...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
        <p className="mt-2 text-gray-600">The campaign you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/campaigns')}
          className="mt-4 btn-primary"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalSent = sentEmails.length;
  const totalDelivered = sentEmails.filter(email => ['delivered', 'opened', 'clicked'].includes(email.status)).length;
  const totalOpened = emailEvents.filter(event => event.eventType === 'opened').length;
  const totalClicked = emailEvents.filter(event => event.eventType === 'clicked').length;
  const totalBounced = emailEvents.filter(event => event.eventType === 'bounced').length;

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Campaigns
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600">Campaign Analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-6 h-6 text-primary" />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium">{campaign.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sender</p>
            <p className="font-medium">{campaign.sender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Target Group</p>
            <p className="font-medium">{campaign.group}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sent Date</p>
            <p className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{totalDelivered}</p>
              <p className="text-sm text-green-600">{deliveryRate}% delivery rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Opened</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpened}</p>
              <p className="text-sm text-purple-600">{openRate}% open rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CursorArrowRaysIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clicked</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicked}</p>
              <p className="text-sm text-orange-600">{clickRate}% click rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Email Events</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {emailEvents.length > 0 ? (
            emailEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="px-6 py-4 flex items-center space-x-4">
                <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(event.eventType)}`}>
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500">{event.contactEmail}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No email events recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics; 