import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  status: string;
  created: string;
  lastSent: string;
  recipients: number;
  openRate: string;
}

interface CampaignRowProps {
  campaign: Campaign;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onMore?: (id: number) => void;
}

const CampaignRow: React.FC<CampaignRowProps> = ({ 
  campaign, 
  onEdit, 
  onDelete, 
  onMore 
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
      <td className="p-4 font-medium">{campaign.name}</td>
      <td className="p-4">
        <span className={getStatusBadgeClass(campaign.status)}>
          {campaign.status}
        </span>
      </td>
      <td className="p-4 text-gray-600">{campaign.created}</td>
      <td className="p-4 text-gray-600">{campaign.lastSent}</td>
      <td className="p-4 text-gray-600">{campaign.recipients}</td>
      <td className="p-4 text-gray-600">{campaign.openRate}</td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button 
            className="action-button-edit"
            onClick={() => onEdit?.(campaign.id)}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-delete"
            onClick={() => onDelete?.(campaign.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-more"
            onClick={() => onMore?.(campaign.id)}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CampaignRow; 