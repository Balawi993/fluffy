import React from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: number;
  name: string;
  description: string;
  lastEdited: string;
  thumbnail: string;
}

interface TemplateCardProps {
  template: Template;
  onEdit?: (id: number) => void;
  onUse?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onEdit, 
  onUse, 
  onDelete 
}) => {
  return (
    <div className="template-card">
      {/* Template Preview */}
      <div className={`template-preview ${template.thumbnail}`}>
        <span className="text-dark/70 font-semibold">{template.name}</span>
      </div>
      
      {/* Template Info */}
      <div className="template-info">
        <div>
          <h3 className="font-semibold text-lg">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>
      </div>
      
      {/* Last Edited */}
      <div className="text-xs text-gray-500 mb-4">
        Last edited: {template.lastEdited}
      </div>
      
      {/* Actions */}
      <div className="template-actions">
        <button 
          className="btn-secondary template-action-button"
          onClick={() => onEdit?.(template.id)}
        >
          <PencilIcon className="template-action-icon" />
          Edit
        </button>
        <button 
          className="btn-primary template-action-button"
          onClick={() => onUse?.(template.id)}
        >
          <DocumentDuplicateIcon className="template-action-icon" />
          Use
        </button>
        <button 
          className="btn-secondary template-action-button text-red-500 hover:bg-red-50"
          onClick={() => onDelete?.(template.id)}
        >
          <TrashIcon className="template-action-icon" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TemplateCard; 