import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckIcon,
  PlusCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
  CubeIcon,
  ArrowUturnLeftIcon,
  Cog6ToothIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { templatesAPI } from '../lib/api';

// Define types for blocks
interface BlockType {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

interface CanvasBlock {
  id: string;
  type: string;
  content: any;
}

const TemplateEditor = () => {
  const navigate = useNavigate();
  
  // State
  const [templateName, setTemplateName] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [selectedCanvasBlock, setSelectedCanvasBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Mock blocks for the design library
  const blockLibrary: BlockType[] = [
    { id: 'header', name: 'Header', icon: RectangleGroupIcon },
    { id: 'text', name: 'Text Block', icon: DocumentTextIcon },
    { id: 'image', name: 'Image', icon: PhotoIcon },
    { id: 'button', name: 'Button', icon: CubeIcon },
    { id: 'spacer', name: 'Spacer', icon: ArrowsUpDownIcon },
    { id: 'divider', name: 'Divider', icon: ArrowLeftIcon },
    { id: 'social', name: 'Social Links', icon: ArrowLeftIcon },
  ];
  
  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (canvasBlocks.length === 0) {
      alert('Please add at least one block to your template');
      return;
    }

    setSaving(true);
    
    try {
      const templateData = {
        name: templateName.trim(),
        blocks: canvasBlocks
      };

      await templatesAPI.create(templateData);
      
      // Navigate back to templates on success
      navigate('/templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/templates');
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlock(blockId);
    setSelectedCanvasBlock(null);
  };

  const handleBackToLibrary = () => {
    setSelectedBlock(null);
    setSelectedCanvasBlock(null);
  };

  // Helper function to find block by ID
  const getSelectedBlock = (): BlockType | undefined => {
    return blockLibrary.find(block => block.id === selectedBlock);
  };

  // Drag and drop handlers
  const handleDragStart = (blockType: string) => {
    setIsDragging(true);
    setDraggedBlockType(blockType);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropTarget(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedBlockType) {
      const newBlock: CanvasBlock = {
        id: `block-${Date.now()}`,
        type: draggedBlockType,
        content: getDefaultContentForType(draggedBlockType)
      };
      
      const newBlocks = [...canvasBlocks];
      newBlocks.splice(index, 0, newBlock);
      setCanvasBlocks(newBlocks);
      
      // Select the newly added block
      setSelectedCanvasBlock(newBlock.id);
      setSelectedBlock(null);
    }
    
    setIsDragging(false);
    setDraggedBlockType(null);
    setDropTarget(null);
  };

  const getDefaultContentForType = (blockType: string) => {
    switch (blockType) {
      case 'header':
        return { text: 'New Header' };
      case 'text':
        return { text: 'New text block' };
      case 'image':
        return { src: '', alt: 'Image description' };
      case 'button':
        return { text: 'Click Me', url: '#' };
      case 'spacer':
        return { height: 20 };
      case 'divider':
        return { style: 'solid' };
      case 'social':
        return { networks: ['facebook', 'twitter', 'instagram'] };
      default:
        return {};
    }
  };

  const handleCanvasBlockClick = (blockId: string) => {
    const block = canvasBlocks.find(b => b.id === blockId);
    if (block) {
      setSelectedCanvasBlock(blockId);
      setSelectedBlock(null);
    }
  };

  const handleContentChange = (value: any, property: string) => {
    if (!selectedCanvasBlock) return;
    
    const updatedBlocks = canvasBlocks.map(block => {
      if (block.id === selectedCanvasBlock) {
        return {
          ...block,
          content: {
            ...block.content,
            [property]: value
          }
        };
      }
      return block;
    });
    
    setCanvasBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (blockId: string) => {
    setCanvasBlocks(canvasBlocks.filter(block => block.id !== blockId));
    if (selectedCanvasBlock === blockId) {
      setSelectedCanvasBlock(null);
    }
  };

  // Get the currently selected canvas block
  const getSelectedCanvasBlock = () => {
    return canvasBlocks.find(block => block.id === selectedCanvasBlock);
  };

  // Render canvas block
  const renderCanvasBlock = (block: CanvasBlock, index: number) => {
    const isSelected = selectedCanvasBlock === block.id;
    
    return (
      <div
        key={block.id}
        className={`relative group cursor-pointer border-2 rounded-lg p-4 transition-all ${
          isSelected 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleCanvasBlockClick(block.id)}
      >
        {/* Block Content */}
        <div className="pointer-events-none">
          {block.type === 'header' && (
            <h2 className="text-xl font-bold text-center">{block.content.text}</h2>
          )}
          {block.type === 'text' && (
            <p className="text-gray-700">{block.content.text}</p>
          )}
          {block.type === 'image' && (
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {block.type === 'button' && (
            <div className="text-center">
              <button className="btn-primary py-2 px-4 pointer-events-none">
                {block.content.text}
              </button>
            </div>
          )}
          {block.type === 'spacer' && (
            <div 
              className="bg-gray-100 rounded" 
              style={{ height: `${block.content.height}px` }}
            />
          )}
          {block.type === 'divider' && (
            <hr className="border-gray-300" />
          )}
          {block.type === 'social' && (
            <div className="flex justify-center space-x-2">
              {block.content.networks.map((network: string, i: number) => (
                <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          )}
        </div>

        {/* Block Controls */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <button
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBlock(block.id);
              }}
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Drop zones */}
        <div
          className={`absolute -top-1 left-0 right-0 h-2 ${
            dropTarget === index ? 'bg-primary/30' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={handleCancel}
            className="mr-4 p-2 hover:bg-light rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Create Template</h1>
        </div>
        <button 
          className="btn-primary py-2 px-4 flex items-center"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              Save Template
            </>
          )}
        </button>
      </div>

      {/* Template Name */}
      <div className="card">
        <div className="mb-6">
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            id="templateName"
            className="input"
            placeholder="Enter template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
      </div>

      {/* Template Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Block Library or Block Settings */}
        <div className="lg:col-span-1">
          <div className="card h-fit">
            {!selectedBlock && !selectedCanvasBlock ? (
              // Block Library
              <>
                <div className="flex items-center mb-4">
                  <CubeIcon className="w-5 h-5 mr-2 text-gray-600" />
                  <h3 className="font-semibold">Block Library</h3>
                </div>
                <div className="space-y-2">
                  {blockLibrary.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
                      draggable
                      onDragStart={() => handleDragStart(block.id)}
                      onClick={() => handleBlockClick(block.id)}
                    >
                      <block.icon className="w-5 h-5 mr-3 text-gray-600" />
                      <span className="font-medium">{block.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : selectedBlock ? (
              // Block Library Item Details
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Add Block</h3>
                  <button
                    className="p-1 hover:bg-light rounded"
                    onClick={handleBackToLibrary}
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {getSelectedBlock() && (
                  <div className="space-y-4">
                                         <div className="flex items-center p-3 border-2 border-primary rounded-lg bg-primary/10">
                       {React.createElement(getSelectedBlock()!.icon, {
                         className: "w-5 h-5 mr-3 text-gray-600"
                       })}
                       <span className="font-medium">{getSelectedBlock()!.name}</span>
                     </div>
                    
                    <p className="text-sm text-gray-600">
                      Drag this block to the canvas or click on the canvas where you want to add it.
                    </p>
                    
                    <button
                      className="w-full btn-primary py-2 text-sm"
                      onClick={() => {
                        const newBlock: CanvasBlock = {
                          id: `block-${Date.now()}`,
                          type: selectedBlock,
                          content: getDefaultContentForType(selectedBlock)
                        };
                        setCanvasBlocks([...canvasBlocks, newBlock]);
                        setSelectedCanvasBlock(newBlock.id);
                        setSelectedBlock(null);
                      }}
                    >
                      <PlusCircleIcon className="w-4 h-4 mr-2 inline" />
                      Add to Canvas
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Block Settings Panel
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Block Settings</h3>
                  <button
                    className="p-1 hover:bg-light rounded"
                    onClick={handleBackToLibrary}
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {getSelectedCanvasBlock() && (
                  <div className="space-y-4">
                    <div className="flex items-center p-3 border-2 border-primary rounded-lg bg-primary/10">
                      {blockLibrary.find(block => block.id === getSelectedCanvasBlock()!.type)?.icon && (
                        React.createElement(blockLibrary.find(block => block.id === getSelectedCanvasBlock()!.type)!.icon, {
                          className: "w-5 h-5 mr-3 text-gray-600"
                        })
                      )}
                      <span className="font-medium">{blockLibrary.find(block => block.id === getSelectedCanvasBlock()!.type)?.name}</span>
                    </div>

                    <div className="form-group">
                      {getSelectedCanvasBlock()!.type === 'header' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                          <input
                            type="text"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.text}
                            onChange={(e) => handleContentChange(e.target.value, 'text')}
                            placeholder="Enter header text..."
                          />
                        </>
                      )}
                      
                      {getSelectedCanvasBlock()!.type === 'text' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                          <textarea
                            className="input"
                            rows={4}
                            value={getSelectedCanvasBlock()!.content.text}
                            onChange={(e) => handleContentChange(e.target.value, 'text')}
                            placeholder="Enter text content..."
                          />
                        </>
                      )}
                      
                      {getSelectedCanvasBlock()!.type === 'image' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.src}
                            onChange={(e) => handleContentChange(e.target.value, 'src')}
                            placeholder="Enter image URL..."
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Alt Text</label>
                          <input
                            type="text"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.alt}
                            onChange={(e) => handleContentChange(e.target.value, 'alt')}
                            placeholder="Enter alt text..."
                          />
                        </>
                      )}
                      
                      {getSelectedCanvasBlock()!.type === 'button' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                          <input
                            type="text"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.text}
                            onChange={(e) => handleContentChange(e.target.value, 'text')}
                            placeholder="Enter button text..."
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Button URL</label>
                          <input
                            type="url"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.url}
                            onChange={(e) => handleContentChange(e.target.value, 'url')}
                            placeholder="Enter button URL..."
                          />
                        </>
                      )}
                      
                      {getSelectedCanvasBlock()!.type === 'spacer' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                          <input
                            type="number"
                            className="input"
                            value={getSelectedCanvasBlock()!.content.height}
                            onChange={(e) => handleContentChange(parseInt(e.target.value), 'height')}
                            placeholder="Enter height in pixels..."
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: Canvas Area */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Template Canvas</h3>
              <div className="text-sm text-gray-500">
                {canvasBlocks.length} block{canvasBlocks.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
              {canvasBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <CubeIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">Start Building Your Template</h4>
                  <p className="text-gray-500 max-w-sm">
                    Drag blocks from the library or click on a block type to add it to your template.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Drop zone at the top */}
                  <div
                    className={`h-2 ${dropTarget === 0 ? 'bg-primary/30' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 0)}
                    onDrop={(e) => handleDrop(e, 0)}
                  />
                  
                  {canvasBlocks.map((block, index) => (
                    <React.Fragment key={block.id}>
                      {renderCanvasBlock(block, index)}
                      {/* Drop zone after each block */}
                      <div
                        className={`h-2 ${dropTarget === index + 1 ? 'bg-primary/30' : ''}`}
                        onDragOver={(e) => handleDragOver(e, index + 1)}
                        onDrop={(e) => handleDrop(e, index + 1)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor; 