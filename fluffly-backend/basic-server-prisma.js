require('dotenv').config();
const http = require('http');
const url = require('url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('./generated/prisma');
const { Webhook } = require('svix');

// Initialize Prisma Client with clean settings
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty'
});

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-here',
    { expiresIn: '7d' }
  );
};

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    console.log('🔍 Verifying token with JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Using fallback');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
    console.log('✅ Token verified successfully:', { userId: decoded.userId });
    return decoded;
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('🔑 Invalid token signature');
    }
    return null;
  }
};

// Helper function to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // Handle empty body
        if (!body.trim()) {
          resolve({});
          return;
        }
        resolve(JSON.parse(body));
      } catch (error) {
        console.error('JSON Parse error:', error.message, 'Body:', body);
        reject(new Error('Invalid JSON format'));
      }
    });
  });
};

// Helper function to send JSON response
const sendJSON = (res, statusCode, data, origin = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Set CORS origin dynamically
  const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
    'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181',
    'http://localhost:5182', 'http://localhost:5183', 'http://localhost:5184'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'; // default
  }
  
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
};

// Add this function to read raw body data for webhook signature validation
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      resolve(rawBody);
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Helper function to get or create a group
const getOrCreateGroup = async (userId, groupName) => {
  if (!groupName) return null;
  
  // Try to find existing group
  let group = await prisma.group.findFirst({
    where: {
      userId,
      name: groupName
    }
  });
  
  // Create new group if it doesn't exist
  if (!group) {
    group = await prisma.group.create({
      data: {
        name: groupName,
        userId
      }
    });
  }
  
  return group;
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  const origin = req.headers.origin;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    sendJSON(res, 200, {}, origin);
    return;
  }

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      sendJSON(res, 200, { status: 'OK', message: 'Fluffly API is running with Prisma' }, origin);
      return;
    }

    // =========================
    // AUTH ENDPOINTS WITH PRISMA
    // =========================

    // Signup
    if (path === '/api/auth/signup' && method === 'POST') {
      const body = await parseBody(req);
      const { fullName, email, password } = body;

      // Validation
      if (!fullName || !email || !password) {
        sendJSON(res, 400, {
          success: false,
          message: 'All fields are required'
        }, origin);
        return;
      }

      if (password.length < 6) {
        sendJSON(res, 400, {
          success: false,
          message: 'Password must be at least 6 characters long'
        }, origin);
        return;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          sendJSON(res, 400, {
            success: false,
            message: 'User with this email already exists'
          }, origin);
          return;
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: {
            fullName,
            email,
            password: hashedPassword
          }
        });

        // Generate token
        const token = generateToken(user.id);

        sendJSON(res, 201, {
          success: true,
          message: 'User created successfully',
          data: {
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email
            },
            token
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Signup error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Login
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      // Validation
      if (!email || !password) {
        sendJSON(res, 400, {
          success: false,
          message: 'Email and password are required'
        }, origin);
        return;
      }

      try {
        // Find user
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          sendJSON(res, 401, {
            success: false,
            message: 'Invalid email or password'
          }, origin);
          return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          sendJSON(res, 401, {
            success: false,
            message: 'Invalid email or password'
          }, origin);
          return;
        }

        // Generate token
        const token = generateToken(user.id);

        sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email
            },
            token
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Login error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Get current user
    if (path === '/api/auth/me' && method === 'GET') {
      console.log('🔍 GET /api/auth/me - Request received');
      
      const authHeader = req.headers.authorization;
      console.log('🔑 Authorization header:', authHeader ? 'Present' : 'Missing');
      console.log('🔍 Full Authorization header:', authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No valid Authorization header');
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      console.log('🎫 Token extracted:', token ? 'Success' : 'Failed');
      console.log('🎫 Token length:', token ? token.length : 'N/A');
      if (token) {
        console.log('🎫 Token (first 20 chars):', token.substring(0, 20) + '...');
      }
      console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
      
      const decoded = verifyToken(token);
      console.log('🔓 Token decoded:', decoded ? 'Success' : 'Failed');
      
      if (!decoded) {
        console.log('❌ Invalid token - verification failed');
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!user) {
          sendJSON(res, 401, {
            success: false,
            message: 'User not found'
          }, origin);
          return;
        }

        sendJSON(res, 200, {
          success: true,
          data: {
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email
            }
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get user error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // CONTACTS ENDPOINTS WITH PRISMA
    // =========================

    // Get all contacts
    if (path === '/api/contacts' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const groupName = url.searchParams.get('group');
        
        // Build where clause
        let whereClause = { userId: decoded.userId };
        
        // If group filter is specified, find the group and filter by groupId
        if (groupName) {
          const group = await prisma.group.findFirst({
            where: {
              name: groupName,
              userId: decoded.userId
            }
          });
          
          if (group) {
            whereClause.groupId = group.id;
          } else {
            // If group doesn't exist, return empty results
            sendJSON(res, 200, {
              success: true,
              data: {
                data: []
              }
            }, origin);
            return;
          }
        }

        const contacts = await prisma.contact.findMany({
          where: whereClause,
          include: { group: true },
          orderBy: { createdAt: 'desc' }
        });

        // Transform the response to include group name
        const transformedContacts = contacts.map(contact => ({
          ...contact,
          group: contact.group?.name || null,
          groupId: contact.groupId
        }));

        sendJSON(res, 200, {
          success: true,
          data: {
            data: transformedContacts
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get contacts error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Bulk import contacts
    if (path === '/api/contacts/import' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const body = await parseBody(req);
      const { contacts, group: groupName } = body;

      // Validation
      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        sendJSON(res, 400, {
          success: false,
          message: 'Contacts array is required'
        }, origin);
        return;
      }

      if (!groupName) {
        sendJSON(res, 400, {
          success: false,
          message: 'Group name is required'
        }, origin);
        return;
      }

      try {
        // Handle group
        const group = await getOrCreateGroup(decoded.userId, groupName);
        const groupId = group.id;

        // Import contacts
        const results = {
          success: 0,
          failed: 0,
          errors: []
        };

        for (const contactData of contacts) {
          try {
            if (!contactData.name || !contactData.email) {
              results.failed++;
              results.errors.push(`Contact missing name or email: ${JSON.stringify(contactData)}`);
              continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactData.email)) {
              results.failed++;
              results.errors.push(`Invalid email format: ${contactData.email}`);
              continue;
            }

            // Check if contact already exists for this user
            const existingContact = await prisma.contact.findFirst({
              where: {
                email: contactData.email.toLowerCase(),
                userId: decoded.userId
              }
            });

            if (existingContact) {
              results.failed++;
              results.errors.push(`Contact with email ${contactData.email} already exists`);
              continue;
            }

            await prisma.contact.create({
              data: {
                name: contactData.name.trim(),
                email: contactData.email.toLowerCase().trim(),
                tags: contactData.tags?.trim() || null,
                groupId,
                userId: decoded.userId
              }
            });

            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to import ${contactData.email}: ${error.message}`);
          }
        }

        sendJSON(res, 200, {
          success: true,
          message: `Import completed: ${results.success} contacts imported, ${results.failed} failed`,
          data: results
        }, origin);
        return;
      } catch (error) {
        console.error('Bulk import error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Create new contact
    if (path === '/api/contacts' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const body = await parseBody(req);
      const { name, email, tags, group: groupName } = body;

      // Validation
      if (!name || !email) {
        sendJSON(res, 400, {
          success: false,
          message: 'Name and email are required'
        }, origin);
        return;
      }

      try {
        // Handle group
        let groupId = null;
        if (groupName) {
          const group = await getOrCreateGroup(decoded.userId, groupName);
          groupId = group.id;
        }

        const contact = await prisma.contact.create({
          data: {
            name,
            email,
            tags: tags || null,
            groupId,
            userId: decoded.userId
          },
          include: { group: true }
        });

        // Transform the response to include group name
        const transformedContact = {
          ...contact,
          group: contact.group?.name || null
        };

        sendJSON(res, 201, {
          success: true,
          message: 'Contact created successfully',
          data: {
            data: transformedContact
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Create contact error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Update contact
    if (path.startsWith('/api/contacts/') && method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const contactId = path.split('/')[3];
      const body = await parseBody(req);
      const { name, email, tags, group: groupName } = body;

      // Validation
      if (!name || !email) {
        sendJSON(res, 400, {
          success: false,
          message: 'Name and email are required'
        }, origin);
        return;
      }

      try {
        // Check if contact exists and belongs to user
        const existingContact = await prisma.contact.findFirst({
          where: { 
            id: contactId,
            userId: decoded.userId 
          }
        });

        if (!existingContact) {
          sendJSON(res, 404, {
            success: false,
            message: 'Contact not found'
          }, origin);
          return;
        }

        // Handle group
        let groupId = null;
        if (groupName) {
          const group = await getOrCreateGroup(decoded.userId, groupName);
          groupId = group.id;
        }

        const contact = await prisma.contact.update({
          where: { id: contactId },
          data: {
            name,
            email,
            tags: tags || null,
            groupId
          },
          include: { group: true }
        });

        // Transform the response to include group name
        const transformedContact = {
          ...contact,
          group: contact.group?.name || null
        };

        sendJSON(res, 200, {
          success: true,
          message: 'Contact updated successfully',
          data: {
            data: transformedContact
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Update contact error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Delete contact
    if (path.startsWith('/api/contacts/') && method === 'DELETE') {
      console.log('🗑️ DELETE contact request received');
      console.log('📍 Full path:', path);
      console.log('🆔 Method:', method);
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const contactId = path.split('/')[3];
      console.log('🆔 Extracted contactId:', contactId);

      try {
        // Check if contact exists and belongs to user
        const existingContact = await prisma.contact.findFirst({
          where: { 
            id: contactId,
            userId: decoded.userId 
          }
        });

        if (!existingContact) {
          sendJSON(res, 404, {
            success: false,
            message: 'Contact not found'
          }, origin);
          return;
        }

        await prisma.contact.delete({
          where: { id: contactId }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Contact deleted successfully'
        }, origin);
        return;
      } catch (error) {
        console.error('Delete contact error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // TEMPLATES ENDPOINTS WITH PRISMA
    // =========================

    // Get all templates
    if (path === '/api/templates' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        const templates = await prisma.template.findMany({
          where: { userId: decoded.userId },
          orderBy: { createdAt: 'desc' }
        });

        sendJSON(res, 200, {
          success: true,
          data: {
            data: templates
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get templates error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Create new template
    if (path === '/api/templates' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const body = await parseBody(req);
      const { name, subject, blocks } = body;

      // Validation
      if (!name || !blocks) {
        sendJSON(res, 400, {
          success: false,
          message: 'Name and blocks are required'
        }, origin);
        return;
      }

      try {
        const template = await prisma.template.create({
          data: {
            name,
            subject: subject || null,
            blocks,
            userId: decoded.userId
          }
        });

        sendJSON(res, 201, {
          success: true,
          message: 'Template created successfully',
          data: {
            data: template
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Create template error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Update template
    if (path.startsWith('/api/templates/') && method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const templateId = path.split('/')[3];
      const body = await parseBody(req);
      const { name, subject, blocks } = body;

      // Validation
      if (!name || !blocks) {
        sendJSON(res, 400, {
          success: false,
          message: 'Name and blocks are required'
        }, origin);
        return;
      }

      try {
        // Check if template exists and belongs to user
        const existingTemplate = await prisma.template.findFirst({
          where: { 
            id: templateId,
            userId: decoded.userId 
          }
        });

        if (!existingTemplate) {
          sendJSON(res, 404, {
            success: false,
            message: 'Template not found'
          }, origin);
          return;
        }

        const template = await prisma.template.update({
          where: { id: templateId },
          data: {
            name,
            subject: subject || null,
            blocks
          }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Template updated successfully',
          data: {
            data: template
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Update template error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Delete template
    if (path.startsWith('/api/templates/') && method === 'DELETE') {
      console.log('🗑️ DELETE template request received');
      console.log('📍 Full path:', path);
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const templateId = path.split('/')[3];

      try {
        // Check if template exists and belongs to user
        const existingTemplate = await prisma.template.findFirst({
          where: { 
            id: templateId,
            userId: decoded.userId 
          }
        });

        if (!existingTemplate) {
          sendJSON(res, 404, {
            success: false,
            message: 'Template not found'
          }, origin);
          return;
        }

        await prisma.template.delete({
          where: { id: templateId }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Template deleted successfully'
        }, origin);
        return;
      } catch (error) {
        console.error('Delete template error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // CAMPAIGNS ENDPOINTS WITH PRISMA
    // =========================

    // Get all campaigns
    if (path === '/api/campaigns' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const statusFilter = url.searchParams.get('status');
        
        // Build where clause
        let whereClause = { userId: decoded.userId };
        
        // Add status filter if provided
        if (statusFilter) {
          whereClause.status = statusFilter;
        }
        
        const campaigns = await prisma.campaign.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' }
        });

        // Transform campaigns to include group name info
        const campaignsWithGroups = campaigns.map(campaign => ({
          ...campaign,
          group: {
            id: campaign.groupId || campaign.group, // Use groupId if available, fallback to group field
            name: campaign.group // The group field now contains the actual group name
          }
        }));

        sendJSON(res, 200, {
          success: true,
          data: {
            data: campaignsWithGroups
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get campaigns error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Get individual campaign
    if (path.startsWith('/api/campaigns/') && path.split('/').length === 4 && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const campaignId = path.split('/')[3];

      try {
        const campaign = await prisma.campaign.findFirst({
          where: { 
            id: campaignId,
            userId: decoded.userId 
          }
        });

        if (!campaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        // Transform campaign to include group info
        const campaignWithGroup = {
          ...campaign,
          group: {
            id: campaign.groupId || campaign.group, // Use groupId if available, fallback to group field
            name: campaign.group // The group field now contains the actual group name
          }
        };

        sendJSON(res, 200, {
          success: true,
          data: {
            data: campaignWithGroup
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get campaign error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Create new campaign
    if (path === '/api/campaigns' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const body = await parseBody(req);
      const { name, subject, sender, group, blocks } = body;

      // Validation
      if (!name || !subject || !sender || !group || !blocks) {
        sendJSON(res, 400, {
          success: false,
          message: 'All fields are required'
        }, origin);
        return;
      }

      try {
        // Find group by name to get both name and ID
        let groupName = group;
        let groupId = null;
        
        // Try to find the group by name first
        const foundGroup = await prisma.group.findFirst({
          where: {
            name: group,
            userId: decoded.userId
          }
        });
        
        if (foundGroup) {
          groupName = foundGroup.name;
          groupId = foundGroup.id;
        } else {
          // If group is passed as UUID, try to find by ID
          const foundGroupById = await prisma.group.findFirst({
            where: {
              id: group,
              userId: decoded.userId
            }
          });
          
          if (foundGroupById) {
            groupName = foundGroupById.name;
            groupId = foundGroupById.id;
          }
        }

        const campaign = await prisma.campaign.create({
          data: {
            name,
            subject,
            sender,
            group: groupName, // Store the group name for display
            groupId: groupId, // Store the group ID for relations
            blocks,
            userId: decoded.userId
          }
        });

        sendJSON(res, 201, {
          success: true,
          message: 'Campaign created successfully',
          data: {
            data: campaign
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Create campaign error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Update campaign
    if (path.startsWith('/api/campaigns/') && method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const campaignId = path.split('/')[3];
      const body = await parseBody(req);
      const { name, subject, sender, group, blocks } = body;

      // Validation
      if (!name || !subject || !sender || !group || !blocks) {
        sendJSON(res, 400, {
          success: false,
          message: 'All fields are required'
        }, origin);
        return;
      }

      try {
        // Check if campaign exists and belongs to user
        const existingCampaign = await prisma.campaign.findFirst({
          where: { 
            id: campaignId,
            userId: decoded.userId 
          }
        });

        if (!existingCampaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        // Find group by name to get both name and ID
        let groupName = group;
        let groupId = null;
        
        // Try to find the group by name first
        const foundGroup = await prisma.group.findFirst({
          where: {
            name: group,
            userId: decoded.userId
          }
        });
        
        if (foundGroup) {
          groupName = foundGroup.name;
          groupId = foundGroup.id;
        } else {
          // If group is passed as UUID, try to find by ID
          const foundGroupById = await prisma.group.findFirst({
            where: {
              id: group,
              userId: decoded.userId
            }
          });
          
          if (foundGroupById) {
            groupName = foundGroupById.name;
            groupId = foundGroupById.id;
          }
        }

        const campaign = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            name,
            subject,
            sender,
            group: groupName, // Store the group name for display
            groupId: groupId, // Store the group ID for relations
            blocks
          }
        });

        // Transform campaign to include group info for consistency
        const campaignWithGroup = {
          ...campaign,
          group: {
            id: campaign.groupId || campaign.group, // Use groupId if available, fallback to group field
            name: campaign.group // The group field now contains the actual group name
          }
        };

        sendJSON(res, 200, {
          success: true,
          message: 'Campaign updated successfully',
          data: {
            data: campaignWithGroup
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Update campaign error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Delete campaign
    if (path.startsWith('/api/campaigns/') && method === 'DELETE') {
      console.log('🗑️ DELETE campaign request received');
      console.log('📍 Full path:', path);
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      const campaignId = path.split('/')[3];

      try {
        // Check if campaign exists and belongs to user
        const existingCampaign = await prisma.campaign.findFirst({
          where: { 
            id: campaignId,
            userId: decoded.userId 
          }
        });

        if (!existingCampaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        await prisma.campaign.delete({
          where: { id: campaignId }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Campaign deleted successfully'
        }, origin);
        return;
      } catch (error) {
        console.error('Delete campaign error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // CAMPAIGN SENDING ENDPOINT
    // =========================

    // Send campaign to group
    if (path === '/api/campaigns/send' && method === 'POST') {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          sendJSON(res, 401, {
            success: false,
            message: 'Access token required'
          }, origin);
          return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          sendJSON(res, 401, {
            success: false,
            message: 'Invalid token'
          }, origin);
          return;
        }

        const body = await parseBody(req);
        const { campaignId, groupName, subject, htmlContent, from } = body;

        // Validate required fields
        if (!campaignId || !groupName || !subject || !htmlContent) {
          sendJSON(res, 400, {
            success: false,
            message: 'Missing required fields: campaignId, groupName, subject, htmlContent'
          }, origin);
          return;
        }

        // Verify the campaign belongs to the user
        const campaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        if (campaign.userId !== decoded.userId) {
          sendJSON(res, 403, {
            success: false,
            message: 'Not authorized to access this campaign'
          }, origin);
          return;
        }

        // Find the group
        const group = await prisma.group.findFirst({
          where: {
            name: groupName,
            userId: decoded.userId
          }
        });

        if (!group) {
          sendJSON(res, 404, {
            success: false,
            message: 'Group not found'
          }, origin);
          return;
        }

        // Get all contacts in the group
        const contacts = await prisma.contact.findMany({
          where: {
            groupId: group.id,
            userId: decoded.userId
          }
        });

        if (contacts.length === 0) {
          sendJSON(res, 400, {
            success: false,
            message: 'No contacts found in the selected group'
          }, origin);
          return;
        }

        // Send results tracking
        const results = {
          total: contacts.length,
          sent: 0,
          failed: 0,
          errors: []
        };

        // Send emails via Resend API with rate limiting
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          
          try {
            // Prepare email data for Resend API
            const emailData = {
              from: from || "Fluffly <noreply@fluffly.com>",
              to: contact.email,
              subject: subject,
              html: htmlContent
            };

            // Make request to Resend API
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer re_7bk19qCJ_2frULLzn4rm5AynPZ8KwqQvo',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData)
            });

            const resendData = await resendResponse.json();

            if (resendResponse.ok && resendData.id) {
              // Track the sent email in our database
              await prisma.sentEmail.create({
                data: {
                  messageId: resendData.id,
                  contactEmail: contact.email,
                  campaignId,
                  contactId: contact.id,
                  userId: decoded.userId,
                  status: 'sent'
                }
              });

              results.sent++;
            } else {
              results.failed++;
              results.errors.push(`Failed to send to ${contact.email}: ${resendData.message || 'Unknown error'}`);
            }

          } catch (emailError) {
            console.error(`Error sending email to ${contact.email}:`, emailError);
            results.failed++;
            results.errors.push(`Failed to send to ${contact.email}: ${emailError.message}`);
          }

          // Rate limiting: 2 requests per second (500ms delay)
          if (i < contacts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Update campaign status to 'sent' if any emails were sent
        if (results.sent > 0) {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'sent' }
          });
        }

        sendJSON(res, 200, { 
          success: true, 
          message: `Campaign sent: ${results.sent} successful, ${results.failed} failed`,
          data: results
        }, origin);
        return;
      } catch (error) {
        console.error('Error sending campaign:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Server error'
        }, origin);
        return;
      }
    }

    // =========================
    // CAMPAIGN ANALYTICS ENDPOINT
    // =========================

    // Get campaign analytics
    if (path.startsWith('/api/campaigns/') && path.endsWith('/analytics') && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      // Extract campaign ID from path like /api/campaigns/:id/analytics
      const pathParts = path.split('/');
      const campaignId = pathParts[3]; // /api/campaigns/ID/analytics

      try {
        // Verify the campaign belongs to the user and check status
        const campaign = await prisma.campaign.findFirst({
          where: { 
            id: campaignId,
            userId: decoded.userId 
          }
        });

        if (!campaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        // Only show analytics for sent campaigns
        if (campaign.status !== 'sent') {
          sendJSON(res, 200, {
            success: true,
            data: {
              totalSent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              bounced: 0,
              complained: 0,
              message: 'No data yet. Campaign has not been sent.'
            }
          }, origin);
          return;
        }

        // Count total sent emails for this campaign
        const totalSent = await prisma.sentEmail.count({
          where: {
            campaignId: campaignId,
            userId: decoded.userId
          }
        });

        // Count email events by type for this campaign
        const [delivered, opened, clicked, bounced, complained] = await Promise.all([
          prisma.emailEvent.count({
            where: {
              campaignId: campaignId,
              userId: decoded.userId,
              eventType: 'delivered'
            }
          }),
          prisma.emailEvent.count({
            where: {
              campaignId: campaignId,
              userId: decoded.userId,
              eventType: 'opened'
            }
          }),
          prisma.emailEvent.count({
            where: {
              campaignId: campaignId,
              userId: decoded.userId,
              eventType: 'clicked'
            }
          }),
          prisma.emailEvent.count({
            where: {
              campaignId: campaignId,
              userId: decoded.userId,
              eventType: 'bounced'
            }
          }),
          prisma.emailEvent.count({
            where: {
              campaignId: campaignId,
              userId: decoded.userId,
              eventType: 'complained'
            }
          })
        ]);

        const stats = {
          totalSent,
          delivered,
          opened,
          clicked,
          bounced,
          complained
        };

        sendJSON(res, 200, {
          success: true,
          data: stats
        }, origin);
        return;
      } catch (error) {
        console.error('Get campaign analytics error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // SENT EMAIL TRACKING ENDPOINT
    // =========================

    // Track sent email
    if (path === '/api/campaigns/track-email' && method === 'POST') {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          sendJSON(res, 401, {
            success: false,
            message: 'Access token required'
          }, origin);
          return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          sendJSON(res, 401, {
            success: false,
            message: 'Invalid token'
          }, origin);
          return;
        }

        const body = await parseBody(req);
        const { campaignId, contactId, messageId, contactEmail } = body;

        // Validate required fields
        if (!campaignId || !contactId || !messageId || !contactEmail) {
          sendJSON(res, 400, {
            success: false,
            message: 'Missing required fields'
          }, origin);
          return;
        }

        // Verify the campaign belongs to the user
        const campaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) {
          sendJSON(res, 404, {
            success: false,
            message: 'Campaign not found'
          }, origin);
          return;
        }

        if (campaign.userId !== decoded.userId) {
          sendJSON(res, 403, {
            success: false,
            message: 'Not authorized to access this campaign'
          }, origin);
          return;
        }

        // Create sent email record
        const sentEmail = await prisma.sentEmail.create({
          data: {
            messageId,
            contactEmail,
            campaignId,
            contactId,
            userId: decoded.userId,
          }
        });

        sendJSON(res, 201, { 
          success: true, 
          message: 'Email tracking recorded',
          data: sentEmail
        }, origin);
        return;
      } catch (error) {
        console.error('Error tracking sent email:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Server error'
        }, origin);
        return;
      }
    }

    // =========================
    // RESEND WEBHOOK ENDPOINT
    // =========================

    // Handle Resend webhook events
    if (path === '/api/webhooks/resend' && method === 'POST') {
      try {
        console.log('📩 Resend webhook received');
        
        // Get headers needed for signature verification
        const svixId = req.headers['svix-id'];
        const svixSignature = req.headers['svix-signature'];
        const svixTimestamp = req.headers['svix-timestamp'];
        
        // Verify webhook signature
        // For development purposes, we'll skip actual verification but log the headers
        console.log('🔑 Webhook headers:', { svixId, svixSignature, svixTimestamp });
        
        // In production, you would verify the signature like this:
        // const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
        // const wh = new Webhook(WEBHOOK_SECRET);
        
        // Get raw body for signature verification
        const rawBody = await getRawBody(req);
        const body = JSON.parse(rawBody);
        
        console.log('📦 Webhook payload:', body);
        
        // Extract event data
        const eventType = body.data?.event;
        const messageId = body.data?.messageId;
        const recipient = body.data?.recipient;
        const timestamp = body.data?.timestamp ? new Date(body.data.timestamp) : new Date();
        
        if (!eventType || !messageId || !recipient) {
          console.error('❌ Invalid webhook payload');
          sendJSON(res, 400, { success: false, message: 'Invalid webhook payload' }, origin);
          return;
        }
        
        // Find the sent email record by messageId
        const sentEmail = await prisma.sentEmail.findFirst({
          where: { messageId },
          include: {
            campaign: true,
            user: true,
            contact: true
          }
        });
        
        if (!sentEmail) {
          console.error('❌ No matching sent email found for messageId:', messageId);
          sendJSON(res, 404, { success: false, message: 'No matching sent email found' }, origin);
          return;
        }
        
        // Create email event record
        const emailEvent = await prisma.emailEvent.create({
          data: {
            eventType,
            messageId,
            contactEmail: recipient,
            timestamp,
            metadata: body.data || {},
            campaignId: sentEmail.campaignId,
            userId: sentEmail.userId,
            contactId: sentEmail.contactId
          }
        });
        
        console.log('✅ Email event recorded:', emailEvent.id);
        
        // Update sent email status if needed
        if (['delivered', 'opened', 'clicked', 'bounced', 'complained'].includes(eventType)) {
          await prisma.sentEmail.update({
            where: { id: sentEmail.id },
            data: { status: eventType }
          });
        }
        
        // Respond with success
        sendJSON(res, 200, { success: true, message: 'Webhook processed successfully' }, origin);
        return;
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
        sendJSON(res, 500, { success: false, message: 'Error processing webhook' }, origin);
        return;
      }
    }

    // =========================
    // GROUPS ENDPOINTS WITH PRISMA
    // =========================

    // Get all groups
    if (path === '/api/groups' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        const groups = await prisma.group.findMany({
          where: { userId: decoded.userId },
          orderBy: { name: 'asc' }
        });

        sendJSON(res, 200, {
          success: true,
          data: {
            data: groups
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Get groups error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // USER PROFILE ENDPOINTS
    // =========================

    // Update user profile
    if (path === '/api/user' && method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        const body = await parseBody(req);
        const { fullName } = body;

        if (!fullName || !fullName.trim()) {
          sendJSON(res, 400, {
            success: false,
            message: 'Full name is required'
          }, origin);
          return;
        }

        const updatedUser = await prisma.user.update({
          where: { id: decoded.userId },
          data: { fullName: fullName.trim() },
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Profile updated successfully',
          data: {
            user: updatedUser
          }
        }, origin);
        return;
      } catch (error) {
        console.error('Update user error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // Change password
    if (path === '/api/user/change-password' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
          success: false,
          message: 'Access token required'
        }, origin);
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid token'
        }, origin);
        return;
      }

      try {
        const body = await parseBody(req);
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
          sendJSON(res, 400, {
            success: false,
            message: 'Current password and new password are required'
          }, origin);
          return;
        }

        if (newPassword.length < 6) {
          sendJSON(res, 400, {
            success: false,
            message: 'New password must be at least 6 characters long'
          }, origin);
          return;
        }

        // Get user with current password
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!user) {
          sendJSON(res, 404, {
            success: false,
            message: 'User not found'
          }, origin);
          return;
        }

        // Verify current password
        const bcrypt = require('bcrypt');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
          sendJSON(res, 400, {
            success: false,
            message: 'Current password is incorrect'
          }, origin);
          return;
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { password: hashedNewPassword }
        });

        sendJSON(res, 200, {
          success: true,
          message: 'Password changed successfully'
        }, origin);
        return;
      } catch (error) {
        console.error('Change password error:', error);
        sendJSON(res, 500, {
          success: false,
          message: 'Internal server error'
        }, origin);
        return;
      }
    }

    // =========================
    // NOT FOUND
    // =========================
    
    sendJSON(res, 404, {
      success: false,
      message: 'Endpoint not found'
    }, origin);
    
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, {
      success: false,
      message: 'Internal server error'
    }, origin);
  }
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase database successfully');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log('📊 Environment variables:');
      console.log('   - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
      console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
      console.log('🎯 Endpoints available:');
      console.log('   - POST /api/auth/signup');
      console.log('   - POST /api/auth/login');
      console.log('   - GET  /api/auth/me');
      console.log('   - PUT  /api/user');
      console.log('   - POST /api/user/change-password');
      console.log('   - GET  /api/contacts');
      console.log('   - POST /api/contacts');
      console.log('   - PUT  /api/contacts/:id');
      console.log('   - DELETE /api/contacts/:id');
      console.log('   - GET  /api/templates');
      console.log('   - POST /api/templates');
      console.log('   - PUT  /api/templates/:id');
      console.log('   - DELETE /api/templates/:id');
      console.log('   - GET  /api/campaigns');
      console.log('   - GET  /api/campaigns/:id');
      console.log('   - GET  /api/campaigns/:id/analytics');
      console.log('   - POST /api/campaigns');
      console.log('   - PUT  /api/campaigns/:id');
      console.log('   - DELETE /api/campaigns/:id');
      console.log('   - POST /api/campaigns/send');
      console.log('   - GET  /api/groups');
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 