import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

interface Contact {
  id: string;
  name: string;
  email: string;
  tags: string;
  group: string;
}

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMore?: (id: string) => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ 
  contact, 
  isSelected,
  onSelect,
  onEdit, 
  onDelete, 
  onMore 
}) => {
  return (
    <tr className="table-row">
      <td className="p-4">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(contact.id)}
        />
      </td>
      <td className="p-4 font-medium">{contact.name}</td>
      <td className="p-4 text-gray-600">{contact.email}</td>
      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {contact.tags && contact.tags.split(',').map((tag, index) => (
            <span key={index} className="tag">{tag.trim()}</span>
          ))}
        </div>
      </td>
      <td className="p-4">
        <span className="group-badge">{contact.group}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button 
            className="action-button-edit"
            onClick={() => onEdit?.(contact.id)}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-delete"
            onClick={() => onDelete?.(contact.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-button-more"
            onClick={() => onMore?.(contact.id)}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ContactRow; 