import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  sender: string;
  group: string;
  status: string;
  created: string;
  lastSent: string;
  recipients: number;
  openRate: string;
  createdAt: string;
}

interface CampaignRowProps {
  campaign: Campaign;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMore?: (id: string) => void;
  onViewAnalytics?: (id: string) => void;
}

const CampaignRow: React.FC<CampaignRowProps> = ({ 
  campaign, 
  onEdit, 
  onDelete, 
  onMore,
  onViewAnalytics 
}) => {
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-badge status-active';
      case 'draft':
        return 'status-badge status-draft';
      case 'sent':
        return 'status-badge status-sent';
      case 'scheduled':
        return 'status-badge status-scheduled';
      default:
        return 'status-badge status-draft';
    }
  };

  return (
    <tr className="table-row">
      <td className="p-4">
        <div>
          <div className="font-medium text-gray-900">{campaign.name}</div>
          <div className="text-sm text-gray-500">{campaign.subject}</div>
        </div>
      </td>
      <td className="p-4 text-gray-600">{new Date(campaign.createdAt).toLocaleDateString()}</td>
      <td className="p-4 text-gray-600">{campaign.group}</td>
      <td className="p-4">
        <span className={getStatusBadgeClass(campaign.status)}>
          {campaign.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          {campaign.status === 'sent' && (
            <button 
              className="action-button text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => onViewAnalytics?.(campaign.id)}
              title="View Analytics"
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
          )}
          <button 
            className="action-button-edit"
            onClick={() => onEdit?.(campaign.id)}
            title="Edit Campaign"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-delete"
            onClick={() => onDelete?.(campaign.id)}
            title="Delete Campaign"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-more"
            onClick={() => onMore?.(campaign.id)}
            title="More Actions"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CampaignRow; 