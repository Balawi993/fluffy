import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { TemplateCard, Toast } from '../components';
import { templatesAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

interface Template {
  id: number;
  name: string;
  blocks: any[];
  createdAt?: string;
  updatedAt?: string;
  description: string;
  lastEdited: string;
  thumbnail: string;
}

const Templates = () => {
  const navigate = useNavigate();
  
  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showSuccess, showError, hideToast } = useToast();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await templatesAPI.getAll();
      console.log('Templates API response:', response.data);
      const templatesData = response.data.data?.data || response.data.data || [];
      
      // Add UI properties for display
      const templatesWithUI = templatesData.map((template: any, index: number) => ({
        ...template,
        description: `Template with ${template.blocks?.length || 0} blocks`,
        lastEdited: template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Unknown',
        thumbnail: `bg-gradient-to-br from-${['primary', 'accent', 'blue-200', 'green-200', 'red-200', 'purple-200'][index % 6]}/30 to-${['primary', 'accent', 'blue-400', 'green-400', 'red-400', 'purple-400'][index % 6]}/70`
      }));
      
      setTemplates(templatesWithUI);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateTemplate = () => {
    // In a real app, this would navigate to a template editor
    navigate('/templates/create');
  };

  const handleEditTemplate = (id: number) => {
    // In a real app, this would navigate to template editor with the template id
    navigate(`/templates/edit/${id}`);
  };

  const handleUseTemplate = (id: number) => {
    // In a real app, this would create a new campaign from this template
    navigate(`/campaigns/new?template=${id}`);
  };

  const handleDeleteTemplate = async (id: number) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await templatesAPI.delete(id.toString());
      // Refresh the templates list
      await fetchTemplates();
      showSuccess('Template deleted successfully');
    } catch (err: any) {
      console.error('Error deleting template:', err);
      showError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Templates</h1>
          <button className="btn-primary py-2 px-4 flex items-center" disabled>
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Create Template
          </button>
        </div>
        <div className="card">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading templates...</p>
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
        <h1 className="text-3xl font-bold">Templates</h1>
        <button 
          className="btn-primary py-2 px-4 flex items-center"
          onClick={handleCreateTemplate}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Create Template
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchTemplates}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Templates Grid or Empty State */}
      {templates.length === 0 && !loading ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <DocumentTextIcon className="w-24 h-24 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates available</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Create your first email template to get started. Templates help you maintain consistent branding and save time.
            </p>
            <button 
              className="btn-primary py-2 px-4 flex items-center"
              onClick={handleCreateTemplate}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onUse={handleUseTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
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

export default Templates; 