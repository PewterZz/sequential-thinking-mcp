# Deployment Guide for sequential-thinking-mcp

This guide will help you deploy your MCP server to various platforms.

## Prerequisites

Before deploying, make sure:

1. Your server is working correctly locally
2. You have all required API keys configured
3. You have accounts on the deployment platform of your choice

## Deployment Options

### Option 1: Smithery.ai (Recommended)

This MCP server includes a `smithery.yaml` configuration file for seamless deployment to Smithery.ai:

1. Create an account on [Smithery.ai](https://smithery.ai)
2. Install the Smithery CLI: `npm install -g @smithery/cli`
3. Login to Smithery: `smithery login`
4. Deploy your server: `smithery deploy`
5. Configure environment variables in the Smithery dashboard:
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY

Smithery.ai provides:
- Automatic scaling
- Built-in monitoring
- API key management
- Usage analytics
- Model fallbacks

### Option 2: Vercel (for Next.js based MCP servers)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Configure environment variables:
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY
4. Deploy the application

### Option 3: Docker Deployment

This MCP server includes a Dockerfile for containerized deployment:

1. Build the Docker image:
   ```
   docker build -t sequential-thinking-mcp .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 --env-file .env sequential-thinking-mcp
   ```

3. Deploy to a container service like:
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances

## Securing Your Deployment

For production deployments, ensure:

1. API keys and sensitive data are stored securely
2. Authentication is enabled
3. HTTPS is configured
4. Rate limiting is implemented
5. Proper error handling is in place

## Testing Your Deployment

After deployment, test your MCP server using the provided example client, updating the endpoint URL to your deployed service.
