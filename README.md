# AI-Powered Backlink Opportunity Finder

A Next.js application that uses local Ollama AI (qwen2.5:32b-instruct-q4_K_M) and Puppeteer to crawl the web and identify high-quality backlink opportunities.

## Features

- **AI-Powered Analysis**: Uses your local Ollama model to analyze web pages for backlink potential
- **Web Crawling**: Puppeteer-based crawling to extract page content and interactive features
- **Intelligent Detection**: Identifies comment sections, contact forms, forums, user profiles, and social sharing buttons
- **Detailed Reporting**: Provides confidence scores, difficulty ratings, and actionable recommendations
- **Real-time Processing**: Live analysis with loading states and error handling

## Prerequisites

1. **Ollama**: Make sure Ollama is installed and running on your system
2. **qwen2.5:32b-instruct-q4_K_M model**: This specific model should be installed in Ollama
3. **Node.js**: Version 18 or higher
4. **Chrome/Chromium**: Required for Puppeteer (usually auto-installed)

## Setup Instructions

### 1. Verify Ollama Setup

```bash
# Check if Ollama is running
ollama list

# If the model isn't installed, install it
ollama pull qwen2.5:32b-instruct-q4_K_M

# Test the model
ollama run qwen2.5:32b-instruct-q4_K_M "Hello, can you help with SEO analysis?"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Enter Your Target URL**: The website where you want backlinks to point to
2. **Add Keywords**: Comma-separated keywords relevant to your niche
3. **Provide Analysis URL**: A specific page to analyze for backlink opportunities
4. **Submit**: The AI will analyze the page and provide detailed insights

## Example Use Cases

- **Blog Outreach**: Analyze blog posts to find comment opportunities
- **Forum Marketing**: Identify relevant forum discussions for participation
- **Guest Posting**: Evaluate potential guest posting opportunities
- **Resource Pages**: Find resource pages that might link to your content
- **Directory Submissions**: Identify quality directories in your niche

## API Endpoints

### POST /api/crawl
Crawls a web page and analyzes it for backlink opportunities.

**Request Body:**
```json
{
  "url": "https://example.com/page",
  "keywords": "SEO, digital marketing",
  "targetUrl": "https://your-website.com"
}
```

**Response:**
```json
{
  "success": true,
  "pageData": {
    "title": "Page Title",
    "metaDescription": "Page description",
    "interactiveFeatures": {
      "hasComments": true,
      "hasContactForm": false,
      "hasForum": false,
      "hasUserProfiles": true,
      "hasSocialSharing": true
    }
  },
  "analysis": {
    "isOpportunity": true,
    "confidence": 85,
    "reason": "This page has active comment sections...",
    "backlinkContext": "Consider commenting on the post...",
    "pageType": "blog",
    "difficulty": "medium",
    "recommendedAction": "Leave a thoughtful comment..."
  }
}
```

### POST /api/analyze
Internal API used by the crawl endpoint to analyze content with Ollama.

## Technical Details

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **AI**: Local Ollama integration with qwen2.5:32b-instruct-q4_K_M
- **Web Scraping**: Puppeteer for content extraction
- **Analysis**: Intelligent detection of interactive elements and content relevance

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running on `http://127.0.0.1:11434`
- Check if the model is properly installed: `ollama list`
- Test the model directly: `ollama run qwen2.5:32b-instruct-q4_K_M`

### Puppeteer Issues
- On Linux, you might need to install additional dependencies:
  ```bash
  sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
  ```

### Memory Issues
- The qwen2.5:32b model requires significant RAM
- Consider using a smaller model if you encounter memory issues
- Monitor system resources during analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this for commercial and personal projects.
