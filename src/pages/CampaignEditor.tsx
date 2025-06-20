import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CheckIcon, 
  UserGroupIcon,
  XMarkIcon,
  PlusCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
  CubeIcon,
  ArrowUturnLeftIcon,
  Cog6ToothIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  PencilIcon,
  PaperAirplaneIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Stepper } from '../components';
import { campaignsAPI, contactsAPI, groupsAPI } from '../lib/api';
import { useToast } from '../lib/useToast';

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

// Helper function to convert email blocks to HTML
const convertBlocksToHTML = (blocks: CanvasBlock[]): string => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Email Campaign</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { font-size: 24px; font-weight: bold; text-align: center; padding: 20px 0; }
        .text { font-size: 16px; line-height: 1.5; margin: 20px 0; }
        .image { max-width: 100%; height: auto; margin: 20px 0; }
        .button { display: inline-block; background-color: #FEE440; color: #333; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .spacer { height: 20px; }
        .divider { border-top: 1px solid #ddd; margin: 20px 0; }
        .social { text-align: center; margin: 20px 0; }
        .social a { display: inline-block; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
  `;

  blocks.forEach(block => {
    switch (block.type) {
      case 'header':
        html += `<div class="header">${block.content.text}</div>`;
        break;
      case 'text':
        html += `<div class="text">${block.content.text}</div>`;
        break;
      case 'image':
        html += `<img class="image" src="${block.content.src || 'https://via.placeholder.com/600x200'}" alt="${block.content.alt || 'Email image'}">`;
        break;
      case 'button':
        html += `<div style="text-align: center;"><a href="${block.content.url || '#'}" class="button">${block.content.text}</a></div>`;
        break;
      case 'spacer':
        html += `<div class="spacer" style="height: ${block.content.height || 20}px;"></div>`;
        break;
      case 'divider':
        html += `<div class="divider"></div>`;
        break;
      case 'social':
        html += `
          <div class="social">
            <a href="#">F</a>
            <a href="#">T</a>
            <a href="#">I</a>
          </div>
        `;
        break;
    }
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
};

// Helper function to delay execution for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CampaignEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== 'new';
  const { showSuccess, showError } = useToast();
  
  // State
  const [campaignName, setCampaignName] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('');
  const [activeStep, setActiveStep] = useState(0); // Start from Step 1 (Info)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([
    { id: 'block-1', type: 'header', content: { text: 'Welcome to our newsletter' } },
    { id: 'block-2', type: 'image', content: { src: '', alt: 'Newsletter image' } },
    { id: 'block-3', type: 'text', content: { text: 'This is a text block. Click on any block to edit its content and style. Drag blocks to rearrange them.' } },
    { id: 'block-4', type: 'button', content: { text: 'Read More', url: '#' } }
  ]);
  const [selectedCanvasBlock, setSelectedCanvasBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendProgress, setSendProgress] = useState({ total: 0, sent: 0 });
  const [recipientGroups, setRecipientGroups] = useState<{ id: string; name: string; count?: number }[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // Fetch groups and campaign data
  useEffect(() => {
    const loadData = async () => {
      // Always load groups first
      await fetchGroups();
      
      // If editing, load campaign data after groups are loaded
      if (isEditing && id) {
        await fetchCampaignData();
      }
    };
    
    loadData();
  }, [id, isEditing]);

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await groupsAPI.getAll();
      const groups = response.data.data?.data || [];
      
      // Instead of making individual API calls for each group count,
      // we'll set the groups immediately and optionally load counts in background
      const groupsWithCounts = groups.map((group: any) => ({
        id: group.id, 
        name: group.name, 
        count: 0 // Default to 0, will be updated later if needed
      }));
      
      setRecipientGroups(groupsWithCounts);
      
      // Load contact counts in background (non-blocking)
      Promise.all(
        groups.map(async (group: any) => {
          try {
            const contactsResponse = await contactsAPI.getAll({ group: group.name });
            const count = contactsResponse.data.data?.data?.length || 0;
            return { id: group.id, count };
          } catch (err) {
            return { id: group.id, count: 0 };
          }
        })
      ).then(counts => {
        // Update groups with actual counts
        setRecipientGroups(prevGroups => 
          prevGroups.map(group => {
            const countData = counts.find(c => c.id === group.id);
            return countData ? { ...group, count: countData.count } : group;
          })
        );
      }).catch(err => {
        console.error('Error loading contact counts:', err);
      });
      
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      showError('Failed to load recipient groups');
      // Fallback to empty array
      setRecipientGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchCampaignData = async () => {
    try {
      console.log('🔍 Fetching campaign data for ID:', id);
      const response = await campaignsAPI.getById(id!);
      console.log('📨 Campaign response:', response.data);
      const campaign = response.data.data?.data || response.data.data;
      
      if (campaign) {
        console.log('✅ Campaign found:', campaign);
        
        // Pre-fill the form with existing campaign data
        setCampaignName(campaign.name || '');
        setSubjectLine(campaign.subject || '');
        setSenderName(campaign.sender || '');
        
        // Find the group ID from the group name
        const groupName = campaign.group?.name || campaign.group || '';
        console.log('🔍 Looking for group:', groupName);
        
        // Try to find matching group, but don't wait for groups to be fully loaded
        if (groupName) {
          // Check if groups are already loaded
          if (recipientGroups.length > 0) {
            const matchingGroup = recipientGroups.find(group => group.name === groupName);
            console.log('🎯 Matching group found:', matchingGroup);
            setRecipientGroup(matchingGroup ? matchingGroup.id : '');
          } else {
            // Groups not loaded yet, fetch them and then set the recipient group
            try {
              const groupsResponse = await groupsAPI.getAll();
              const groups = groupsResponse.data.data?.data || [];
              const matchingGroup = groups.find((group: any) => group.name === groupName);
              if (matchingGroup) {
                console.log('🎯 Matching group found from fresh fetch:', matchingGroup);
                setRecipientGroup(matchingGroup.id);
              }
            } catch (err) {
              console.error('Error fetching groups for campaign data:', err);
            }
          }
        }
        
        // Set the canvas blocks if they exist
        if (campaign.blocks && Array.isArray(campaign.blocks)) {
          console.log('📋 Setting canvas blocks:', campaign.blocks);
          setCanvasBlocks(campaign.blocks);
        }
      } else {
        console.warn('⚠️ No campaign data found');
      }
    } catch (err: any) {
      console.error('❌ Error fetching campaign data:', err);
      showError('Failed to load campaign data');
    }
  };

  // Steps for the stepper
  const steps = [
    { id: 0, name: 'Info' },
    { id: 1, name: 'Design' },
    { id: 2, name: 'Preview & Send' }
  ];

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

  // Handlers
  const handleExit = () => {
    navigate('/campaigns');
  };
  
  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlock(blockId);
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

  // Handle send campaign
  const handleSendCampaign = async () => {
    // Validate required fields
    if (!campaignName.trim() || !subjectLine.trim() || !senderName.trim() || !recipientGroup) {
      showError('Please fill in all required fields in Step 1');
      setActiveStep(0);
      return;
    }

    setIsSending(true);
    
    try {
      // Find the group name from the selected group ID
      const selectedGroup = recipientGroups.find(group => group.id === recipientGroup);
      const groupName = selectedGroup ? selectedGroup.name : recipientGroup;
      
      // Create the campaign
      const campaignData = {
        name: campaignName.trim(),
        subject: subjectLine.trim(),
        sender: senderName.trim(),
        group: groupName, // Use the actual group name, not the ID
        blocks: canvasBlocks,
        status: 'draft' as const
      };

      const campaignResponse = await campaignsAPI.create(campaignData);
      
      if (!campaignResponse.data.success) {
        throw new Error('Failed to create campaign');
      }
      
      const campaignId = campaignResponse.data.data.id;
      
      // Convert email blocks to HTML
      const htmlContent = convertBlocksToHTML(canvasBlocks);
      
      // Send campaign using the new integrated endpoint
      const sendResponse = await campaignsAPI.sendCampaign({
        campaignId,
        groupName: groupName, // Use the actual group name, not the ID
        subject: subjectLine.trim(),
        htmlContent,
        from: `${senderName.trim()} <noreply@fluffly.com>`
      });

      if (!sendResponse.data.success) {
        throw new Error(sendResponse.data.message || 'Failed to send campaign');
      }

      const results = sendResponse.data.data;
      
      // Show success state
      setSendSuccess(true);
      
      if (results.failed > 0) {
        showError(`Campaign sent with some issues: ${results.sent} successful, ${results.failed} failed. Check console for details.`);
        console.warn('Send errors:', results.errors);
      } else {
        showSuccess(`Campaign sent successfully to ${results.sent} contacts!`);
      }
        
      // Navigate to analytics page after a delay
      setTimeout(() => {
        navigate(`/campaigns/analytics/${campaignId}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      showError(error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  // Render email preview block
  const renderPreviewBlock = (block: CanvasBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="py-4 text-center">
            <h2 className="text-2xl font-bold text-dark">{block.content.text}</h2>
          </div>
        );
      case 'text':
        return (
          <div className="py-3">
            <p className="text-gray-700 leading-relaxed">{block.content.text}</p>
          </div>
        );
      case 'image':
        return (
          <div className="py-3">
            {block.content.src ? (
              <img 
                src={block.content.src} 
                alt={block.content.alt} 
                className="w-full max-w-md mx-auto rounded-lg" 
              />
            ) : (
              <div className="h-32 bg-light/80 rounded-lg flex items-center justify-center mx-auto max-w-md">
                <div className="flex flex-col items-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Image Placeholder</span>
                </div>
              </div>
            )}
          </div>
        );
      case 'button':
        return (
          <div className="flex justify-center py-4">
            <button className="bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg font-medium border-2 border-dark shadow-neo text-dark">
              {block.content.text}
            </button>
          </div>
        );
      case 'spacer':
        return <div style={{ height: `${block.content.height}px` }} />;
      case 'divider':
        return (
          <div className="py-4">
            <hr className="border-t-2 border-gray-300" />
          </div>
        );
      case 'social':
        return (
          <div className="flex justify-center space-x-4 py-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">F</div>
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">I</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Exit Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Create Campaign</h1>
        </div>
        <button 
          className="btn-secondary py-2 px-4 flex items-center"
          onClick={handleExit}
        >
          <XMarkIcon className="w-5 h-5 mr-2" />
          Exit
        </button>
      </div>

      {/* Stepper */}
      <Stepper 
        steps={steps} 
        currentStep={activeStep} 
        onStepClick={handleStepClick} 
      />

      {/* Step 1: Info Content */}
      {activeStep === 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Campaign Information</h2>
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="campaignName" className="form-label">
                Campaign Name
              </label>
              <input
                type="text"
                id="campaignName"
                className="input"
                placeholder="Enter campaign name..."
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <p className="form-hint">
                This is for your reference only. Recipients won't see this.
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="subjectLine" className="form-label">
                Subject Line
              </label>
              <input
                type="text"
                id="subjectLine"
                className="input"
                placeholder="Enter email subject line..."
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
              />
              <p className="form-hint">
                Keep it short and engaging. This is what recipients will see in their inbox.
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="senderName" className="form-label">
                Sender Name
              </label>
              <input
                type="text"
                id="senderName"
                className="input"
                placeholder="Enter sender name..."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
              <p className="form-hint">
                This name will appear as the sender in recipients' inboxes.
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientGroup" className="form-label">
                Recipient Group
              </label>
              <div className="relative">
                <select
                  id="recipientGroup"
                  className="input pr-10"
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                >
                  <option value="">Select a recipient group</option>
                  {recipientGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.count} contacts)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="form-hint">
                Choose the group of contacts who will receive this campaign.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              className="btn-primary py-2 px-6 flex items-center"
              onClick={() => handleStepClick(1)}
            >
              Continue to Design
              <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Design */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Panel: Block Library or Block Settings */}
          <div className="md:col-span-1">
            <div className="card">
              {!selectedCanvasBlock && selectedBlock === null ? (
                // Block Library Panel
                <>
                  <h2 className="text-xl font-semibold mb-6">Block Library</h2>
                  <p className="text-sm text-gray-500 mb-4">Drag blocks to add them to your email design</p>
                  <div className="space-y-3">
                    {blockLibrary.map((block) => (
                      <div
                        key={block.id}
                        className="w-full flex items-center p-3 border-2 border-dark/20 rounded-lg hover:bg-primary/10 hover:border-dark transition-all cursor-grab"
                        draggable
                        onDragStart={() => handleDragStart(block.id)}
                      >
                        <block.icon className="w-5 h-5 mr-3 text-gray-600" />
                        <span>{block.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Block Settings Panel
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Block Settings</h2>
                    <button 
                      className="p-2 hover:bg-light rounded-full"
                      onClick={handleBackToLibrary}
                    >
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {selectedCanvasBlock && (
                    <div className="space-y-4">
                      <div className="flex items-center p-3 border-2 border-primary rounded-lg bg-primary/10">
                        {(() => {
                          const block = getSelectedCanvasBlock();
                          if (!block) return null;
                          
                          const blockType = blockLibrary.find(b => b.id === block.type);
                          if (!blockType) return null;
                          
                          return (
                            <>
                              {React.createElement(blockType.icon, { className: "w-5 h-5 mr-3 text-gray-600" })}
                              <span className="font-medium">{blockType.name}</span>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Content</label>
                        {(() => {
                          const block = getSelectedCanvasBlock();
                          if (!block) return null;
                          
                          switch (block.type) {
                            case 'text':
                            case 'header':
                              return (
                                <textarea 
                                  className="input min-h-[100px]" 
                                  placeholder="Enter text content..."
                                  value={block.content.text || ''}
                                  onChange={(e) => handleContentChange(e.target.value, 'text')}
                                ></textarea>
                              );
                            case 'image':
                              return (
                                <>
                                  <input 
                                    type="text" 
                                    className="input mb-2" 
                                    placeholder="Image URL" 
                                    value={block.content.src || ''}
                                    onChange={(e) => handleContentChange(e.target.value, 'src')}
                                  />
                                  <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Alt text" 
                                    value={block.content.alt || ''}
                                    onChange={(e) => handleContentChange(e.target.value, 'alt')}
                                  />
                                </>
                              );
                            case 'button':
                              return (
                                <>
                                  <input 
                                    type="text" 
                                    className="input mb-2" 
                                    placeholder="Button Text" 
                                    value={block.content.text || ''}
                                    onChange={(e) => handleContentChange(e.target.value, 'text')}
                                  />
                                  <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Button URL" 
                                    value={block.content.url || ''}
                                    onChange={(e) => handleContentChange(e.target.value, 'url')}
                                  />
                                </>
                              );
                            case 'spacer':
                              return (
                                <input 
                                  type="number" 
                                  className="input" 
                                  placeholder="Height in pixels" 
                                  value={block.content.height || 20}
                                  onChange={(e) => handleContentChange(parseInt(e.target.value), 'height')}
                                />
                              );
                            default:
                              return (
                                <div className="p-4 bg-light/50 rounded-lg text-center text-gray-500">
                                  Settings for this block type
                                </div>
                              );
                          }
                        })()}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="p-2 border-2 border-dark/20 rounded-lg hover:bg-primary/10 hover:border-dark transition-all text-sm">
                            Alignment
                          </button>
                          <button className="p-2 border-2 border-dark/20 rounded-lg hover:bg-primary/10 hover:border-dark transition-all text-sm">
                            Colors
                          </button>
                          <button className="p-2 border-2 border-dark/20 rounded-lg hover:bg-primary/10 hover:border-dark transition-all text-sm">
                            Spacing
                          </button>
                          <button className="p-2 border-2 border-dark/20 rounded-lg hover:bg-primary/10 hover:border-dark transition-all text-sm">
                            Size
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4 mt-4 border-t-2 border-dark/10">
                        <button 
                          className="w-full flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          onClick={() => handleDeleteBlock(selectedCanvasBlock)}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete Block
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Center: Canvas */}
          <div className="md:col-span-3">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Email Canvas</h2>
                <div className="flex space-x-2">
                  <button className="btn-secondary py-1.5 px-3 text-sm flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-1" />
                    Canvas Settings
                  </button>
                </div>
              </div>
              
              <div className="border-2 border-dark/20 rounded-lg min-h-[600px] bg-white p-4 overflow-y-auto">
                {/* Drop zone at the beginning */}
                <div 
                  className={`h-8 mb-2 rounded-md flex items-center justify-center ${
                    dropTarget === 0 ? 'bg-primary/30 border-2 border-dashed border-dark' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, 0)}
                  onDrop={(e) => handleDrop(e, 0)}
                >
                  {dropTarget === 0 && (
                    <span className="text-xs text-dark/60">Drop here</span>
                  )}
                </div>
                
                {/* Canvas Blocks */}
                {canvasBlocks.map((block, index) => (
                  <React.Fragment key={block.id}>
                    <div 
                      className={`border-2 ${selectedCanvasBlock === block.id ? 'border-primary' : 'border-dark/10'} 
                        rounded-lg p-4 mb-4 hover:border-primary cursor-pointer transition-all`}
                      onClick={() => handleCanvasBlockClick(block.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="bg-light px-2 py-1 rounded-md">
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-light rounded-full">
                            <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-light rounded-full">
                            <PencilIcon className="w-4 h-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-1 hover:bg-red-100 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                          >
                            <TrashIcon className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Block content based on type */}
                      {block.type === 'header' && (
                        <div className="py-3">
                          <h3 className="text-xl font-bold">{block.content.text}</h3>
                        </div>
                      )}
                      
                      {block.type === 'text' && (
                        <div className="py-3">
                          <p className="text-gray-600">{block.content.text}</p>
                        </div>
                      )}
                      
                      {block.type === 'image' && (
                        <div className="h-24 bg-light/80 rounded-md flex items-center justify-center">
                          {block.content.src ? (
                            <img 
                              src={block.content.src} 
                              alt={block.content.alt} 
                              className="max-h-full object-contain" 
                            />
                          ) : (
                            <div className="flex flex-col items-center">
                              <PhotoIcon className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-500 mt-1">Image Placeholder</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {block.type === 'button' && (
                        <div className="flex justify-center py-3">
                          <button className="btn-primary py-1.5 px-4 text-sm">
                            {block.content.text}
                          </button>
                        </div>
                      )}
                      
                      {block.type === 'spacer' && (
                        <div style={{ height: `${block.content.height}px` }} className="bg-light/30 rounded-md">
                        </div>
                      )}
                      
                      {block.type === 'divider' && (
                        <div className="py-3">
                          <hr className="border-t-2 border-dark/20" />
                        </div>
                      )}
                      
                      {block.type === 'social' && (
                        <div className="flex justify-center space-x-4 py-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">F</div>
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">T</div>
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">I</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Drop zone after each block */}
                    <div 
                      className={`h-8 mb-2 rounded-md flex items-center justify-center ${
                        dropTarget === index + 1 ? 'bg-primary/30 border-2 border-dashed border-dark' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, index + 1)}
                      onDrop={(e) => handleDrop(e, index + 1)}
                    >
                      {dropTarget === index + 1 && (
                        <span className="text-xs text-dark/60">Drop here</span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
                
                {/* Empty state */}
                {canvasBlocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-dark/20 rounded-lg p-4">
                    <p className="text-gray-500 mb-2">Drag blocks from the library to build your email</p>
                    <PlusCircleIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                className="btn-secondary py-2 px-6 flex items-center"
                onClick={() => handleStepClick(0)}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Info
              </button>
              
              <button 
                className="btn-primary py-2 px-6 flex items-center"
                onClick={() => handleStepClick(2)}
              >
                Continue to Preview
                <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Send */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Preview */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <EyeIcon className="w-6 h-6 mr-2" />
                  Email Preview
                </h2>
                <div className="text-sm text-gray-500">
                  Preview how your email will look to recipients
                </div>
              </div>
              
              {/* Email Container */}
              <div className="border-2 border-dark/20 rounded-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-100 p-4 border-b-2 border-dark/20">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">From: {senderName || 'Your Company'}</div>
                      <div className="text-gray-600">To: Recipients</div>
                    </div>
                    <div className="text-gray-500">
                      Subject: {subjectLine || 'Your Email Subject'}
                    </div>
                  </div>
                </div>
                
                {/* Email Body */}
                <div className="bg-white p-6 max-h-[600px] overflow-y-auto">
                  {canvasBlocks.length > 0 ? (
                    canvasBlocks.map((block, index) => (
                      <div key={block.id}>
                        {renderPreviewBlock(block)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No content blocks added yet.</p>
                      <p className="text-sm">Go back to the Design step to add blocks.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Campaign Summary & Send */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-6">Campaign Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="summary-item">
                  <span className="summary-label">Campaign Name:</span>
                  <span className="summary-value">{campaignName || 'Untitled Campaign'}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Subject Line:</span>
                  <span className="summary-value">{subjectLine || 'No subject'}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Sender:</span>
                  <span className="summary-value">{senderName || 'Not specified'}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Recipients:</span>
                  <span className="summary-value">
                    {recipientGroup ? 
                      recipientGroups.find(g => g.id.toString() === recipientGroup)?.name || 'Unknown Group'
                      : 'No group selected'
                    }
                  </span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Blocks:</span>
                  <span className="summary-value">{canvasBlocks.length} content blocks</span>
                </div>
              </div>
              
              {/* Send Button */}
              <div className="space-y-4">
                {sendSuccess ? (
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
                    <CheckIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Campaign Sent Successfully!</p>
                    <p className="text-green-600 text-sm mt-1">
                      Your email has been sent to all recipients.
                    </p>
                  </div>
                ) : (
                  <button
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium border-2 border-dark transition-all ${
                      isSending 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary-hover shadow-neo hover:shadow-neo-hover hover:-translate-y-0.5 active:translate-y-0.5'
                    }`}
                    onClick={handleSendCampaign}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                        {sendProgress.sent > 0 ? 
                          `Sending... ${sendProgress.sent}/${sendProgress.total}` : 
                          'Sending...'
                        }
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Send Now
                      </>
                    )}
                  </button>
                )}
                
                <div className="bg-light/50 border-2 border-dashed border-dark/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Using Resend API:</strong> Emails will be sent through the Resend API service.
                    Rate limited to 2 emails per second.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <button 
                className="btn-secondary py-2 px-6 flex items-center"
                onClick={() => handleStepClick(1)}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Design
              </button>
              
              <button 
                className="btn-secondary py-2 px-4 flex items-center"
                onClick={handleExit}
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignEditor; 