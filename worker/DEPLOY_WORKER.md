# BBDown Cloudflare Worker Proxy Deployment

This Cloudflare Worker acts as a CORS proxy for Bilibili APIs, allowing the frontend app to bypass browser restrictions and communicate directly with Bilibili services (including streaming video chunks).

## Requirements
- Node.js (v18+)
- A Cloudflare account (the free tier includes 100,000 requests per day)

## Deployment Steps

1. **Install dependencies**
   Navigate to this directory and install the necessary npm packages:
   ```bash
   cd c:\Users\Hussain\Desktop\vids-access\BBDown\BBDown.Web\worker\
   npm install
   ```

2. **Login to Cloudflare**
   Authenticate the Wrangler CLI with your Cloudflare account. This will open a browser window:
   ```bash
   npx wrangler login
   ```

3. **Deploy the Worker**
   Run the deploy command. This compiles the TypeScript code and uploads it to Cloudflare:
   ```bash
   npx wrangler deploy
   ```

4. **Update Frontend Configuration**
   After a successful deployment, Wrangler will output a URL similar to `https://bbdown-proxy.<YOUR_USERNAME>.workers.dev`.
   Use this URL as the proxy endpoint in your web application settings or environment variables.

## Local Development
To test the worker locally:
```bash
npm run dev
```
