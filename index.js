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

// Endpoint for MCP API
app.post('/api/mcp', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;
  if (!jsonrpc || jsonrpc !== '2.0') {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: null });
  }

  const ajv = new Ajv();
  const tool = tools.find(tool => tool.name === method);
  
  if (tool && tool.parameters) {
    const validate = ajv.compile(tool.parameters);
    if (!validate(params)) {
      return res.status(400).json({ jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params' }, id });
    }
  }

  if (method === 'tools/list') {
    res.json({ jsonrpc: '2.0', result: tools.map(tool => ({ name: tool.name, parameters: tool.parameters })), id });
  } else if (method === 'tools/call') {
    const tool = tools.find(t => t.name === params.toolName);
    if (tool) {
      const result = tool.execute(params);
      res.json({ jsonrpc: '2.0', result, id });
    } else {
      res.status(404).json({ jsonrpc: '2.0', error: { code: -32601, message: 'Tool not found' }, id });
    }
  } else {
    res.status(404).json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});