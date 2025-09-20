import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { url, keywords, targetUrl } = await request.json();

    if (!url || !keywords || !targetUrl) {
      return NextResponse.json(
        { error: 'URL, keywords, and target URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`Starting crawl for: ${url}`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract page information
    const pageData = await page.evaluate(() => {
      const title = document.title;
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(el => el.textContent?.trim()).filter(Boolean);
      const h2Elements = Array.from(document.querySelectorAll('h2')).map(el => el.textContent?.trim()).filter(Boolean);
      
      // Get main content - try different selectors
      const contentSelectors = [
        'main',
        'article',
        '.content',
        '.post-content',
        '.entry-content',
        '#content',
        '.container',
        'body'
      ];
      
      let mainContent = '';
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          mainContent = element.textContent || '';
          if (mainContent.length > 100) break;
        }
      }

      // Clean up the content
      mainContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 characters

      // Enhanced detection for interactive elements that might allow backlinks
      const hasComments = !!(
        document.querySelector('.comments') ||
        document.querySelector('#comments') ||
        document.querySelector('.comment-form') ||
        document.querySelector('[class*="comment"]') ||
        document.querySelector('.disqus') ||
        document.querySelector('#disqus_thread') ||
        document.querySelector('[id*="comment"]') ||
        document.querySelector('textarea[placeholder*="comment"]') ||
        document.querySelector('form[action*="comment"]')
      );

      const hasContactForm = !!(
        document.querySelector('form[class*="contact"]') ||
        document.querySelector('form[id*="contact"]') ||
        document.querySelector('input[type="email"]') ||
        document.querySelector('textarea[name*="message"]') ||
        document.querySelector('[class*="contact-form"]') ||
        document.querySelector('input[name*="email"]')
      );

      const hasForum = !!(
        document.querySelector('.forum') ||
        document.querySelector('.discussion') ||
        document.querySelector('.topic') ||
        document.querySelector('.thread') ||
        document.querySelector('[class*="forum"]') ||
        document.querySelector('[href*="forum"]') ||
        document.querySelector('.post-reply') ||
        document.querySelector('[class*="discussion"]')
      );

      const hasUserProfiles = !!(
        document.querySelector('.profile') ||
        document.querySelector('.user-profile') ||
        document.querySelector('[href*="profile"]') ||
        document.querySelector('[href*="user"]') ||
        document.querySelector('.member') ||
        document.querySelector('[class*="member"]') ||
        document.querySelector('.avatar')
      );

      // Enhanced detection for login and registration forms
      const hasLoginForm = !!(
        document.querySelector('form[class*="login"]') ||
        document.querySelector('form[id*="login"]') ||
        document.querySelector('input[name="password"]') ||
        document.querySelector('input[type="password"]') ||
        document.querySelector('[href*="login"]') ||
        document.querySelector('[href*="signin"]') ||
        document.querySelector('button[class*="login"]') ||
        document.querySelector('.login-form')
      );

      const hasRegistration = !!(
        document.querySelector('form[class*="register"]') ||
        document.querySelector('form[class*="signup"]') ||
        document.querySelector('[href*="register"]') ||
        document.querySelector('[href*="signup"]') ||
        document.querySelector('[href*="join"]') ||
        document.querySelector('button[class*="register"]') ||
        document.querySelector('button[class*="signup"]') ||
        document.querySelector('.registration-form')
      );

      // Check for content submission opportunities
      const hasContentSubmission = !!(
        document.querySelector('textarea[class*="post"]') ||
        document.querySelector('[class*="submit"]') ||
        document.querySelector('form[action*="submit"]') ||
        document.querySelector('[href*="submit"]') ||
        document.querySelector('[class*="contribute"]') ||
        document.querySelector('[href*="write"]')
      );

      // Check for social sharing buttons
      const hasSocialSharing = !!(
        document.querySelector('[class*="share"]') ||
        document.querySelector('[class*="social"]') ||
        document.querySelector('.twitter-share-button') ||
        document.querySelector('.facebook-share-button') ||
        document.querySelector('[href*="twitter.com/share"]') ||
        document.querySelector('[href*="facebook.com/sharer"]')
      );

      return {
        title,
        metaDescription,
        h1Elements,
        h2Elements,
        mainContent,
        hasComments,
        hasContactForm,
        hasForum,
        hasUserProfiles,
        hasLoginForm,
        hasRegistration,
        hasContentSubmission,
        hasSocialSharing,
        url: window.location.href
      };
    });

    await browser.close();

    // Now analyze the content using the Ollama API
    const analysisResponse = await fetch(`${request.url.replace('/api/crawl', '/api/analyze')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `Title: ${pageData.title}\nDescription: ${pageData.metaDescription}\nHeadings: ${[...pageData.h1Elements, ...pageData.h2Elements].join(', ')}\nContent: ${pageData.mainContent}`,
        keywords,
        targetUrl
      })
    });

    const analysisData = await analysisResponse.json();

    return NextResponse.json({
      success: true,
      pageData: {
        ...pageData,
        interactiveFeatures: {
          hasComments: pageData.hasComments,
          hasContactForm: pageData.hasContactForm,
          hasForum: pageData.hasForum,
          hasUserProfiles: pageData.hasUserProfiles,
          hasLoginForm: pageData.hasLoginForm,
          hasRegistration: pageData.hasRegistration,
          hasContentSubmission: pageData.hasContentSubmission,
          hasSocialSharing: pageData.hasSocialSharing
        }
      },
      analysis: analysisData.analysis,
      rawAnalysis: analysisData.rawResponse
    });

  } catch (error) {
    console.error('Error crawling page:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to crawl page', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}