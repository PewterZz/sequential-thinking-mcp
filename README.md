# Pete Thinking MCP Server

## Quick Start

### Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Docker Setup
1. Build the Docker image: `docker build -t sequential-thinking-mcp .`
2. Run the Docker container: `docker run -p 3000:3000 sequential-thinking-mcp`

## Environment Variables
- Copy `.env.example` to `.env` and set your API keys.

## Example CURL Calls

### List Tools
```
curl -X POST http://localhost:3000/api/mcp -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "tools/list", "id": 1 }'
```

### Call Tool
```
curl -X POST http://localhost:3000/api/mcp -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "tools/call", "params": { "toolName": "dynamic_thought_branching", "thought": "Example thought", "branch_id": "1234", "confidence_score": 0.9 }, "id": 1 }'
```