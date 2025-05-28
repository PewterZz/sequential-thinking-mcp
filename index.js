/* Express server setup with MCP JSON-RPC implementation */
const express = require('express');
const bodyParser = require('body-parser');
const Ajv = require('ajv');
const { v4: uuidv4 } = require('uuid');

// Configure logging based on environment
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLogLevel = logLevels[LOG_LEVEL] || logLevels.info;

function log(level, message, ...args) {
  if (logLevels[level] <= currentLogLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}:`, message, ...args);
  }
}

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
    execute: (params) => {
      log('debug', 'Executing dynamic_thought_branching with thought:', params.thought);
      return `Branching thought: ${params.thought}`;
    }
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
    execute: (params) => {
      log('debug', 'Executing hypothesis_generation with context:', params.context);
      return `Generating hypothesis for context: ${params.context}`;
    }
  }
];

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  log('debug', 'Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: require('./package.json').version,
    logLevel: LOG_LEVEL,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  log('debug', 'Server info requested');
  res.json({
    name: 'Sequential Thinking MCP Server',
    version: require('./package.json').version,
    description: 'A server for AI sequential thinking processes using thought branching and dynamic hypothesis generation',
    endpoints: {
      health: '/health',
      mcp: '/api/mcp'
    },
    tools: tools.map(tool => tool.name),
    configuration: {
      logLevel: LOG_LEVEL,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

// Endpoint for MCP API
app.post('/api/mcp', (req, res) => {
  try {
    const { jsonrpc, method, params, id } = req.body;
    log('debug', 'MCP API request:', { method, id });
    
    // Validate JSON-RPC format
    if (!jsonrpc || jsonrpc !== '2.0') {
      log('warn', 'Invalid JSON-RPC request:', { jsonrpc, method, id });
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
        log('warn', 'Invalid parameters for tool:', method, validate.errors);
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
      log('info', 'Tools list requested');
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
        log('info', 'Tool called:', params.toolName);
        const result = tool.execute(params);
        res.json({ jsonrpc: '2.0', result, id });
      } else {
        log('warn', 'Tool not found:', params.toolName);
        res.status(404).json({ 
          jsonrpc: '2.0', 
          error: { code: -32601, message: 'Tool not found' }, 
          id 
        });
      }
    } else {
      log('warn', 'Method not found:', method);
      res.status(404).json({ 
        jsonrpc: '2.0', 
        error: { code: -32601, message: 'Method not found' }, 
        id 
      });
    }
  } catch (error) {
    log('error', 'Server error:', error.message, error.stack);
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
  log('info', `Server running on port ${PORT}`);
  log('info', `Log level: ${LOG_LEVEL}`);
  log('info', `Node environment: ${process.env.NODE_ENV || 'development'}`);
  log('info', `Health check available at http://localhost:${PORT}/health`);
  log('info', `MCP API available at http://localhost:${PORT}/api/mcp`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('info', 'Process terminated');
  });
});

process.on('SIGINT', () => {
  log('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    log('info', 'Process terminated');
  });
});

module.exports = app;