/* Express server setup with MCP JSON-RPC implementation */
const express = require('express');
const bodyParser = require('body-parser');
const Ajv = require('ajv');
const { v4: uuidv4 } = require('uuid');

// Define tools with proper schemas
const tools = [
  {
    name: 'dynamic_thought_branching',
    parameters: {
      type: 'object',
      properties: {
        thought: { type: 'string' }
      },
      required: ['thought']
    },
    execute: (params) => `Branching thought: ${params.thought}`
  },
  {
    name: 'hypothesis_generation',
    parameters: {
      type: 'object',
      properties: {
        context: { type: 'string' }
      },
      required: ['context']
    },
    execute: (params) => `Generating hypothesis for context: ${params.context}`
  }
];

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: require('./package.json').version 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sequential Thinking MCP Server',
    version: require('./package.json').version,
    description: 'A server for AI sequential thinking processes using thought branching and dynamic hypothesis generation',
    endpoints: {
      health: '/health',
      mcp: '/api/mcp'
    },
    tools: tools.map(tool => tool.name)
  });
});

// Endpoint for MCP API
app.post('/api/mcp', (req, res) => {
  try {
    const { jsonrpc, method, params, id } = req.body;
    
    // Validate JSON-RPC format
    if (!jsonrpc || jsonrpc !== '2.0') {
      return res.status(400).json({ 
        jsonrpc: '2.0', 
        error: { code: -32600, message: 'Invalid Request' }, 
        id: null 
      });
    }

    const ajv = new Ajv();
    const tool = tools.find(tool => tool.name === method);
    
    // Validate parameters if tool has schema
    if (tool && tool.parameters && params) {
      const validate = ajv.compile(tool.parameters);
      if (!validate(params)) {
        return res.status(400).json({ 
          jsonrpc: '2.0', 
          error: { 
            code: -32602, 
            message: 'Invalid params',
            data: validate.errors 
          }, 
          id 
        });
      }
    }

    // Handle different methods
    if (method === 'tools/list') {
      res.json({ 
        jsonrpc: '2.0', 
        result: tools.map(tool => ({ 
          name: tool.name, 
          parameters: tool.parameters 
        })), 
        id 
      });
    } else if (method === 'tools/call') {
      const tool = tools.find(t => t.name === params.toolName);
      if (tool) {
        const result = tool.execute(params);
        res.json({ jsonrpc: '2.0', result, id });
      } else {
        res.status(404).json({ 
          jsonrpc: '2.0', 
          error: { code: -32601, message: 'Tool not found' }, 
          id 
        });
      }
    } else {
      res.status(404).json({ 
        jsonrpc: '2.0', 
        error: { code: -32601, message: 'Method not found' }, 
        id 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      jsonrpc: '2.0', 
      error: { 
        code: -32603, 
        message: 'Internal error',
        data: error.message 
      }, 
      id: req.body?.id || null 
    });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`MCP API available at http://localhost:${PORT}/api/mcp`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;