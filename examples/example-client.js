import fetch from 'node-fetch';

const callTool = async () => {
  const response = await fetch('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        toolName: 'dynamic_thought_branching',
        thought: 'Analyzing market trends',
        branch_id: 'uuidv4()',
        confidence_score: 0.8
      },
      id: 1
    })
  });
  const data = await response.json();
  console.log(data);
};

callTool();
