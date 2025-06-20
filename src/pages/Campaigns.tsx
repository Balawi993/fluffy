import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  ChevronDownIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { CampaignRow, Toast } from '../components';
import { campaignsAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  sender: string;
  group: string;
  blocks: any[];
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  updatedAt: string;
  // UI properties
  created: string;
  lastSent: string;
  recipients: number;
  openRate: string;
}

const Campaigns = () => {
  const navigate = useNavigate();
  
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [groups, setGroups] = useState<string[]>([]);

  // Status options
  const statusOptions = ['All', 'draft', 'scheduled', 'sent'];

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Refetch when status filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campaignsAPI.getAll({
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      console.log('Campaigns API response:', response.data);
      const campaignsData = response.data.data?.data || response.data.data || [];
      
      // Add UI properties for display
      const campaignsWithUI = campaignsData.map((campaign: any) => ({
        ...campaign,
        // Fix group display - use group.name if available, otherwise fallback to group field or "No group"
        group: campaign.group?.name || campaign.group || 'No group',
        created: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Unknown',
        lastSent: campaign.status === 'sent' 
          ? (campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleDateString() : 'Unknown')
          : campaign.status === 'scheduled' 
            ? 'Scheduled'
            : '-',
        recipients: Math.floor(Math.random() * 5000), // Mock data for now
        openRate: campaign.status === 'sent' ? `${Math.floor(Math.random() * 50 + 20)}%` : '-'
      }));
      
      setCampaigns(campaignsWithUI);
      
      // Extract unique groups for filter
      const uniqueGroups = [...new Set(campaignsWithUI.map((c: Campaign) => c.group).filter(Boolean))] as string[];
      setGroups(uniqueGroups);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleEditCampaign = (id: string) => {
    navigate(`/campaigns/edit/${id}`);
  };

  const handleDeleteCampaign = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await campaignsAPI.delete(id);
      // Refresh the campaigns list
      await fetchCampaigns();
      showSuccess('Campaign deleted successfully');
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      showError(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/campaigns/analytics/${id}`);
  };

  const handleMoreActions = (id: string) => {
    // In a real app, this would show a dropdown menu with more actions
    console.log(`More actions for campaign ${id}`);
  };

  // Filter campaigns by status and group
  const filteredCampaigns = campaigns.filter(campaign => {
    const statusMatch = statusFilter === 'All' || campaign.status === statusFilter;
    const groupMatch = groupFilter === 'All' || campaign.group === groupFilter;
    return statusMatch && groupMatch;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <button className="btn-primary py-2 px-4 flex items-center" disabled>
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Create Campaign
          </button>
        </div>
        <div className="card">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <button 
          className="btn-primary py-2 px-4 flex items-center"
          onClick={handleCreateCampaign}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchCampaigns}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Status:</span>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="btn-secondary py-2 px-4 pr-8 appearance-none bg-white border-2 border-dark/20 rounded-xl"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Group:</span>
            <div className="relative">
              <select 
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="btn-secondary py-2 px-4 pr-8 appearance-none bg-white border-2 border-dark/20 rounded-xl"
              >
                <option value="All">All Groups</option>
                {groups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Table or Empty State */}
      {filteredCampaigns.length === 0 && !loading ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MegaphoneIcon className="w-24 h-24 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {statusFilter === 'All' ? 'No campaigns yet' : `No ${statusFilter} campaigns`}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {statusFilter === 'All' 
                ? 'Start a new campaign to reach your audience. Create engaging email campaigns to connect with your subscribers.'
                : `No campaigns found with status "${statusFilter}". Try changing the filter or create a new campaign.`
              }
            </p>
            <button 
              className="btn-primary py-2 px-4 flex items-center"
              onClick={handleCreateCampaign}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="p-4 text-left">Campaign</th>
                <th className="p-4 text-left">Date Created</th>
                <th className="p-4 text-left">Group</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dark/10">
              {filteredCampaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={handleEditCampaign}
                  onDelete={handleDeleteCampaign}
                  onMore={handleMoreActions}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))}
            </tbody>
          </table>
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

export default Campaigns; 