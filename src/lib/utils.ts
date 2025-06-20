/**
 * Utility functions for the application
 */

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  sender: string;
  group: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if a campaign can show analytics
 * Only sent campaigns have analytics data available
 */
export const canShowAnalytics = (campaign: Campaign): boolean => {
  return campaign.status === 'sent';
};

/**
 * Format date to a readable string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Unknown';
  }
};

/**
 * Get status badge class for campaigns
 */
export const getStatusBadgeClass = (status: string): string => {
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