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
  group: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
}

interface AnalyticsData {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  message?: string;
}

const CampaignAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaign details and analytics in parallel
      const [campaignResponse, analyticsResponse] = await Promise.all([
        campaignsAPI.getById(id!),
        campaignsAPI.getAnalytics(id!)
      ]);
      
      // Set campaign data
      const campaignData = campaignResponse.data.data?.data || campaignResponse.data.data;
      setCampaign(campaignData);
      
      // Set analytics data
      const analyticsData = analyticsResponse.data.data;
      setAnalytics(analyticsData);
      
    } catch (error: any) {
      console.error('Error fetching campaign data:', error);
      showError('Failed to load campaign analytics');
    } finally {
      setLoading(false);
      setAnalyticsLoading(false);
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

  // Calculate statistics from real analytics data
  const totalSent = analytics?.totalSent || 0;
  const totalDelivered = analytics?.delivered || 0;
  const totalOpened = analytics?.opened || 0;
  const totalClicked = analytics?.clicked || 0;
  const totalBounced = analytics?.bounced || 0;
  const totalComplained = analytics?.complained || 0;

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  // Check if we have analytics data or if campaign hasn't been sent
  const hasAnalyticsData = analytics && totalSent > 0;
  const showEmptyState = campaign.status !== 'sent' || (analytics?.message && analytics.message.includes('not been sent'));

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
            <p className="font-medium">{campaign.group.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sent Date</p>
            <p className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {showEmptyState ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <EnvelopeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-600">
            {campaign.status !== 'sent' 
              ? 'This campaign has not been sent yet. Send the campaign to see analytics data.'
              : 'Waiting for email activity. Analytics will appear once emails are sent and events are tracked.'
            }
          </p>
        </div>
      ) : analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalDelivered.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalOpened.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalClicked.toLocaleString()}</p>
                <p className="text-sm text-orange-600">{clickRate}% click rate</p>
              </div>
            </div>
          </div>

          {/* Additional stats for bounced and complained */}
          {(totalBounced > 0 || totalComplained > 0) && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Bounced</p>
                    <p className="text-2xl font-bold text-gray-900">{totalBounced.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Complained</p>
                    <p className="text-2xl font-bold text-gray-900">{totalComplained.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignAnalytics; 