import React, { useState } from 'react';
import { 
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { canShowAnalytics, getStatusBadgeClass, formatDate } from '../lib/utils';

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
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewAnalytics = async () => {
    if (onViewAnalytics) {
      setIsNavigating(true);
      // Add a small delay to show the loading state
      setTimeout(() => {
        onViewAnalytics(campaign.id);
        setIsNavigating(false);
      }, 150);
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
      <td className="p-4 text-gray-600">{formatDate(campaign.createdAt)}</td>
      <td className="p-4 text-gray-600">{campaign.group}</td>
      <td className="p-4">
        <span className={getStatusBadgeClass(campaign.status)}>
          {campaign.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          {canShowAnalytics(campaign as any) && (
            <button 
              className="action-button-analytics group"
              onClick={handleViewAnalytics}
              disabled={isNavigating}
              title="View detailed campaign analytics and performance metrics"
            >
              {isNavigating ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <ChartBarIcon className="w-4 h-4" />
              )}
              {/* Enhanced tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                View Analytics
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
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