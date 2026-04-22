# Deployment Guide

## Development Setup

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

The app will auto-reload as you make changes.

## Building for Production

### Create Optimized Build

```bash
npm run build
npm start
```

This creates an optimized production build in the `.next/` directory.

## Deployment Platforms

### Vercel (Recommended)

Vercel is the creator of Next.js and offers the best integration:

1. **Push your code to GitHub:**
```bash
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Automatic deployments:**
   - Every push to `main` triggers a new deployment
   - Preview deployments for pull requests

### GitHub Pages

For static export (limited functionality):

1. **Update next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // ... rest of config
};
```

2. **Build and deploy:**
```bash
npm run build
# Upload the 'out' directory to GitHub Pages
```

### Netlify

1. **Connect your GitHub repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Deploy:**
   - Click "Deploy"
   - Netlify will automatically build and deploy

### AWS Amplify

1. **Connect your repository:**
```bash
npm install -g @aws-amplify/cli
amplify init
```

2. **Configure and deploy:**
```bash
amplify push
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t asl-detector .
docker run -p 3000:3000 asl-detector
```

## Environment Variables

Create a `.env.local` file for development:

```
# API Configuration (if using backend)
NEXT_PUBLIC_API_URL=http://localhost:8000

# TensorFlow Model Path (if using custom model)
NEXT_PUBLIC_MODEL_URL=https://your-domain.com/models/asl-classifier
```

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Performance Optimization

### Current Optimizations

- CSS Modules for smaller CSS bundles
- Image optimization (Next.js Image component ready)
- Code splitting by route
- Client-side rendering optimized for ML models

### Additional Optimization Tips

1. **Model Caching:**
   - Models are cached in browser localStorage
   - Clear cache when updating models

2. **Bundle Size:**
   - TensorFlow.js (~8.5MB)
   - MediaPipe (~2MB)
   - Total app ~2-3MB

3. **Performance Monitoring:**
   - Use Next.js Analytics
   - Monitor Core Web Vitals

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Models Not Loading

- Check browser console for CORS errors
- Ensure model URLs are accessible
- Verify localStorage is enabled

### Performance Issues

- Check Network tab for large files
- Monitor JavaScript execution
- Consider reducing model precision

## Monitoring

### Error Tracking

Set up error tracking (Sentry, LogRocket, etc.):

1. **Install Sentry:**
```bash
npm install @sentry/nextjs
```

2. **Configure in next.config.js:**
```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(nextConfig, {
  org: "your-org",
  project: "asl-detector",
});
```

### Analytics

Add Google Analytics or similar:
```javascript
// In app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        strategy="afterInteractive"
      />
    </html>
  );
}
```

## Maintenance

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest major versions (careful)
npm upgrade
```

### Security

```bash
# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Support

For deployment issues:
1. Check Next.js documentation: https://nextjs.org/docs
2. Check MediaPipe docs: https://developers.google.com/mediapipe
3. Check TensorFlow.js docs: https://www.tensorflow.org/js
