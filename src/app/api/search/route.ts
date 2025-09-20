import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { keywords, targetUrl } = await request.json();

    if (!keywords || !targetUrl) {
      return NextResponse.json(
        { error: 'Keywords and target URL are required' },
        { status: 400 }
      );
    }

    console.log(`Starting page discovery for keywords: ${keywords}`);

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
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const discoveredPages = [];
    
    // Search queries designed to find pages with user-generated content and login forms
    const searchQueries = [
      `${keywords} forum login register`,
      `${keywords} community discuss forum`,
      `${keywords} blog comments login`,
      `${keywords} directory submit site`,
      `${keywords} guest post contribute write`,
      `${keywords} "post comment" "sign up"`,
      `${keywords} "user registration" forum`,
      `${keywords} "member login" community`,
      `${keywords} reddit discussion`,
      `${keywords} stackoverflow question answer`
    ];

    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid being too slow
      try {
        console.log(`Searching for: ${query}`);
        
        // Use DuckDuckGo as it's more lenient with automated searches
        await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, { 
          waitUntil: 'networkidle2', 
          timeout: 15000 
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract search results
        const searchResults = await page.evaluate(() => {
          const results = [];
          const resultElements = document.querySelectorAll('article[data-testid="result"], .result, .web-result');
          
          for (let i = 0; i < Math.min(resultElements.length, 5); i++) {
            const element = resultElements[i];
            const titleElement = element.querySelector('h2 a, h3 a, .result-title a, [data-testid="result-title-a"]');
            const snippetElement = element.querySelector('.result-snippet, [data-testid="result-snippet"]');
            
            if (titleElement && titleElement.href) {
              const url = titleElement.href;
              const title = titleElement.textContent?.trim() || '';
              const snippet = snippetElement?.textContent?.trim() || '';
              
              // Filter for relevant domains and content
              if (url && 
                  !url.includes('google.com') && 
                  !url.includes('youtube.com') && 
                  !url.includes('facebook.com') &&
                  !url.includes('twitter.com') &&
                  !url.includes('linkedin.com') &&
                  (url.includes('forum') || 
                   url.includes('community') || 
                   url.includes('discuss') || 
                   url.includes('blog') ||
                   url.includes('reddit') ||
                   url.includes('stackoverflow') ||
                   snippet.toLowerCase().includes('login') ||
                   snippet.toLowerCase().includes('register') ||
                   snippet.toLowerCase().includes('comment') ||
                   snippet.toLowerCase().includes('forum'))) {
                results.push({
                  url: url,
                  title: title,
                  snippet: snippet,
                  source: 'search'
                });
              }
            }
          }
          return results;
        });

        discoveredPages.push(...searchResults);
        
        // Add a delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (searchError) {
        console.error(`Error in search query "${query}":`, searchError);
        continue;
      }
    }

    // Add some common forum and community sites based on keywords
    const commonSites = [
      `https://www.reddit.com/search/?q=${encodeURIComponent(keywords)}`,
      `https://stackoverflow.com/search?q=${encodeURIComponent(keywords)}`,
    ];

    // Add known community sites if they match keywords
    const keywordLower = keywords.toLowerCase();
    if (keywordLower.includes('tech') || keywordLower.includes('programming') || keywordLower.includes('dev')) {
      discoveredPages.push({
        url: `https://dev.to/search?q=${encodeURIComponent(keywords)}`,
        title: `Dev.to - ${keywords} discussions`,
        snippet: 'Developer community with articles and discussions',
        source: 'curated'
      });
    }

    if (keywordLower.includes('design') || keywordLower.includes('ui') || keywordLower.includes('ux')) {
      discoveredPages.push({
        url: `https://dribbble.com/search/${encodeURIComponent(keywords)}`,
        title: `Dribbble - ${keywords} designs`,
        snippet: 'Design community with portfolios and discussions',
        source: 'curated'
      });
    }

    await browser.close();

    // Remove duplicates and limit results
    const uniquePages = Array.from(new Map(discoveredPages.map(page => [page.url, page])).values())
      .slice(0, 10); // Limit to 10 pages

    console.log(`Discovered ${uniquePages.length} potential pages`);

    return NextResponse.json({
      success: true,
      discoveredPages: uniquePages,
      totalFound: uniquePages.length
    });

  } catch (error) {
    console.error('Error in page discovery:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to discover pages', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}