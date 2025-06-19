import { useState, useEffect } from 'react';
import { 
  PlusCircleIcon, 
  ArrowUpTrayIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { ContactRow, Toast } from '../components';
import { contactsAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

interface Contact {
  id: string;
  name: string;
  email: string;
  tags: string;
  group: string;
  createdAt?: string;
  updatedAt?: string;
}

const Contacts = () => {
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tags: '',
    group: ''
  });

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.getAll({
        search: searchQuery || undefined,
        group: selectedGroup !== 'All' ? selectedGroup : undefined
      });
      console.log('Contacts API response:', response.data);
      setContacts(response.data.data?.data || response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when search or group filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGroup]);

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleOpenModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      tags: '',
      group: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      tags: '',
      group: ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Please fill in name and email fields');
      return;
    }

    try {
      setSaving(true);

      if (editingContact) {
        // Update existing contact
        await contactsAPI.update(editingContact.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          tags: formData.tags.trim() || undefined,
          group: formData.group.trim() || undefined
        });
        showSuccess('Contact updated successfully');
      } else {
        // Create new contact
        await contactsAPI.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          tags: formData.tags.trim() || undefined,
          group: formData.group.trim() || undefined
        });
        showSuccess('Contact created successfully');
      }

      // Refresh the contacts list
      await fetchContacts();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving contact:', err);
      showError(err.response?.data?.message || `Failed to ${editingContact ? 'update' : 'create'} contact`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        tags: contact.tags || '',
        group: contact.group || ''
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteContact = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${contact.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await contactsAPI.delete(id);
      // Refresh the contacts list
      await fetchContacts();
      // Remove from selected contacts if it was selected
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
      showSuccess('Contact deleted successfully');
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      showError(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleMoreActions = (id: string) => {
    // In a real app, this would show a dropdown menu with more actions
    console.log(`More actions for contact ${id}`);
  };

  // Show loading state
  if (loading && contacts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contacts</h1>
          <button className="btn-primary py-2 px-4 flex items-center" disabled>
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Add Contact
          </button>
        </div>
        <div className="card">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading contacts...</p>
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
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex space-x-3">
          <button 
            className="btn-primary py-2 px-4 flex items-center"
            onClick={handleOpenModal}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Add Contact
          </button>
          <button className="btn-secondary py-2 px-4 flex items-center">
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchContacts}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="input pl-10" 
            placeholder="Search contacts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <button className="btn-secondary py-2 px-4 flex items-center">
              <span>Group: {selectedGroup}</span>
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>
          </div>

          {selectedContacts.length > 0 && (
            <div className="relative">
              <button className="btn-secondary py-2 px-4 flex items-center">
                <span>Bulk Actions ({selectedContacts.length})</span>
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table or Empty State */}
      {contacts.length === 0 && !loading ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserGroupIcon className="w-24 h-24 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchQuery || selectedGroup !== 'All' 
                ? 'No contacts match your current filters. Try adjusting your search or group filter.'
                : 'Add your first contact to get started! You can import contacts from a CSV file or add them individually.'
              }
            </p>
            <div className="flex space-x-3">
              <button 
                className="btn-primary py-2 px-4 flex items-center"
                onClick={handleOpenModal}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Add Contact
              </button>
              <button className="btn-secondary py-2 px-4 flex items-center">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Import CSV
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="p-4 text-left">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    />
                  </th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Tags</th>
                  <th className="p-4 text-left font-semibold">Group</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-dark/10">
                {contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContacts.includes(contact.id)}
                    onSelect={handleSelectContact}
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                    onMore={handleMoreActions}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b-2 border-dark/10">
              <h2 className="text-xl font-bold">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
                disabled={saving}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter contact name"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input 
                  type="email" 
                  className="input" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags separated by commas"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Group</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  placeholder="Enter group name"
                  disabled={saving}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t-2 border-dark/10">
              <button 
                onClick={handleCloseModal}
                className="btn-secondary py-2 px-4"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="btn-primary py-2 px-4 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  editingContact ? 'Update Contact' : 'Save Contact'
                )}
              </button>
            </div>
          </div>
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

export default Contacts; 