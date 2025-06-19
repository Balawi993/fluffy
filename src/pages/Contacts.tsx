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
import { contactsAPI, groupsAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

interface Contact {
  id: string;
  name: string;
  email: string;
  tags: string;
  group: string;
  groupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Group {
  id: string;
  name: string;
}

const Contacts = () => {
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
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
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importGroup, setImportGroup] = useState('');
  const [isImportNewGroup, setIsImportNewGroup] = useState(false);
  const [importNewGroupName, setImportNewGroupName] = useState('');
  const [importing, setImporting] = useState(false);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
    fetchGroups();
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

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data.data?.data || []);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
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
    setIsNewGroup(false);
    setNewGroupName('');
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
    setIsNewGroup(false);
    setNewGroupName('');
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Please fill in name and email fields');
      return;
    }

    try {
      setSaving(true);
      
      // Determine final group name
      const finalGroupName = isNewGroup ? newGroupName.trim() : formData.group;

      if (editingContact) {
        // Update existing contact
        await contactsAPI.update(editingContact.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          tags: formData.tags.trim() || undefined,
          group: finalGroupName || undefined
        });
        showSuccess('Contact updated successfully');
      } else {
        // Create new contact
        await contactsAPI.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          tags: formData.tags.trim() || undefined,
          group: finalGroupName || undefined
        });
        showSuccess('Contact created successfully');
      }

      // Refresh the contacts list and groups
      await fetchContacts();
      await fetchGroups();
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

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsNewGroup(true);
      setNewGroupName('');
    } else {
      setIsNewGroup(false);
      setFormData(prev => ({
        ...prev,
        group: value
      }));
    }
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
      setIsNewGroup(false);
      setNewGroupName('');
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

  const handleOpenImportModal = () => {
    setCsvFile(null);
    setImportGroup('');
    setIsImportNewGroup(false);
    setImportNewGroupName('');
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setCsvFile(null);
    setImportGroup('');
    setIsImportNewGroup(false);
    setImportNewGroupName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      showError('Please select a valid CSV file');
      setCsvFile(null);
    }
  };

  const handleImportGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsImportNewGroup(true);
      setImportNewGroupName('');
    } else {
      setIsImportNewGroup(false);
      setImportGroup(value);
    }
  };

  const parseCSV = (csvText: string): { name: string; email: string; tags?: string }[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Assume first line is header
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const tagsIndex = headers.findIndex(h => h.includes('tag'));

    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain "name" and "email" columns');
    }

    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length > Math.max(nameIndex, emailIndex)) {
        const contact: { name: string; email: string; tags?: string } = {
          name: values[nameIndex],
          email: values[emailIndex]
        };
        if (tagsIndex !== -1 && values[tagsIndex]) {
          contact.tags = values[tagsIndex];
        }
        if (contact.name && contact.email) {
          contacts.push(contact);
        }
      }
    }

    return contacts;
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      showError('Please select a CSV file');
      return;
    }

    const finalGroupName = isImportNewGroup ? importNewGroupName.trim() : importGroup;
    if (!finalGroupName) {
      showError('Please select or enter a group name');
      return;
    }

    try {
      setImporting(true);
      
      // Read file
      const csvText = await csvFile.text();
      const contactsData = parseCSV(csvText);
      
      if (contactsData.length === 0) {
        showError('No valid contacts found in CSV file');
        return;
      }

      // Use bulk import API
      const response = await contactsAPI.import({
        contacts: contactsData,
        group: finalGroupName
      });

      const results = response.data.data;
      
      // Show results
      if (results.success > 0) {
        showSuccess(`${results.success} contacts imported to group "${finalGroupName}"`);
        await fetchContacts();
        await fetchGroups();
      }

      if (results.failed > 0) {
        console.warn('Import errors:', results.errors);
        if (results.success === 0) {
          showError('Failed to import any contacts. Check console for details.');
        } else {
          showError(`${results.failed} contacts failed to import. Check console for details.`);
        }
      }

      handleCloseImportModal();
    } catch (err: any) {
      console.error('Import error:', err);
      showError(err.message || 'Failed to import CSV file');
    } finally {
      setImporting(false);
    }
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
          <button 
            className="btn-secondary py-2 px-4 flex items-center"
            onClick={handleOpenImportModal}
          >
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

          <div className="relative">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 border rounded-lg"
          >
            <option value="All">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </select>
          <UserGroupIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <ChevronDownIcon className="absolute right-2 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Contacts Table */}
        <div className="card">
        {contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="w-10 px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedContacts.length > 0 && selectedContacts.length === contacts.length}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="w-20 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContacts.includes(contact.id)}
                    onSelect={() => handleSelectContact(contact.id)}
                    onEdit={() => handleEditContact(contact.id)}
                    onDelete={() => handleDeleteContact(contact.id)}
                    onMoreActions={() => handleMoreActions(contact.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">No contacts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedGroup !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first contact'}
            </p>
            <button 
              className="btn-primary py-2 px-4"
              onClick={handleOpenModal}
            >
              Add Contact
            </button>
        </div>
      )}
      </div>

      {/* Add/Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="John Doe"
                />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="john@example.com"
                />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  {isNewGroup ? (
                    <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-grow px-3 py-2 border rounded-md"
                        placeholder="New group name"
                      />
                      <button 
                        onClick={() => setIsNewGroup(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.group}
                      onChange={handleGroupChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">No Group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.name}>{group.name}</option>
                      ))}
                      <option value="new">+ Create New Group</option>
                    </select>
                  )}
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                <input 
                  type="text" 
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="customer, lead, etc."
                />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
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
                {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Import Contacts from CSV</h3>
              <button 
                onClick={handleCloseImportModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={importing}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV File
                  </label>
                  <input 
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded-md file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-gray-50"
                    disabled={importing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    CSV should have columns: name, email, tags (optional)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Group
                  </label>
                  {isImportNewGroup ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={importNewGroupName}
                        onChange={(e) => setImportNewGroupName(e.target.value)}
                        className="flex-grow px-3 py-2 border rounded-md"
                        placeholder="New group name"
                        disabled={importing}
                      />
                      <button 
                        onClick={() => setIsImportNewGroup(false)}
                        className="text-gray-400 hover:text-gray-500"
                        disabled={importing}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={importGroup}
                      onChange={handleImportGroupChange}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={importing}
                    >
                      <option value="">Select Group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.name}>{group.name}</option>
                      ))}
                      <option value="new">+ Create New Group</option>
                    </select>
                  )}
                </div>

                {csvFile && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-700">
                      Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={handleCloseImportModal}
                className="btn-secondary py-2 px-4"
                disabled={importing}
              >
                Cancel
              </button>
              <button 
                onClick={handleImportCSV}
                className="btn-primary py-2 px-4 flex items-center"
                disabled={importing || !csvFile || (!importGroup && !isImportNewGroup) || (isImportNewGroup && !importNewGroupName.trim())}
              >
                {importing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {importing ? 'Importing...' : 'Import Contacts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
            type={toast.type}
          message={toast.message}
          onClose={() => hideToast(toast.id)}
        />
      ))}
      </div>
    </div>
  );
};

export default Contacts; 