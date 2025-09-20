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
    
    // Expanded search queries for comprehensive backlink opportunity discovery
    const searchQueries = [
      // Forum and community searches
      `${keywords} forum diskussion anmelden registrieren`,
      `${keywords} community forum mitglied werden`,
      `${keywords} "forum beitrag" "kommentar schreiben"`,
      `${keywords} diskussionsforum login register`,
      `${keywords} beauty forum hautpflege diskussion`,
      
      // Blog and guest posting opportunities
      `${keywords} blog gastbeitrag schreiben`,
      `${keywords} "guest post" "gastautor werden"`,
      `${keywords} blog kommentare login`,
      `${keywords} "blogger werden" "artikel schreiben"`,
      `${keywords} "blog beitrag" "kommentar hinterlassen"`,
      
      // Link exchange and directory submissions
      `${keywords} linkverzeichnis eintrag kostenlos`,
      `${keywords} "link exchange" "linkpartner"`,
      `${keywords} verzeichnis eintragen kostenlos`,
      `${keywords} "backlink tausch" "link tausch"`,
      `${keywords} webkatalog eintrag submit`,
      
      // User-generated content platforms
      `${keywords} bewertung schreiben login`,
      `${keywords} erfahrungsbericht schreiben`,
      `${keywords} "nutzer bewertung" registrieren`,
      `${keywords} testbericht verfassen`,
      `${keywords} "user review" "account erstellen"`,
      
      // Social and professional networks
      `${keywords} xing profil erstellen`,
      `${keywords} linkedin artikel schreiben`,
      `${keywords} business netzwerk profil`,
      `${keywords} fachmagazin gastbeitrag`,
      `${keywords} expertennetzwerk anmelden`,
      
      // Q&A and help platforms
      `${keywords} frage antwort portal`,
      `${keywords} "fragen stellen" registrierung`,
      `${keywords} hilfe forum anmelden`,
      `${keywords} ratgeber community`,
      `${keywords} expertentipps forum`,
      
      // Industry-specific searches
      `${keywords} kosmetik forum diskussion`,
      `${keywords} beauty blog gastautor`,
      `${keywords} hautpflege community`,
      `${keywords} luxuskosmetik forum`,
      `${keywords} schönheit blog kommentar`
    ];

    for (const query of searchQueries.slice(0, 8)) { // Increased to 8 queries for better coverage
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
              
              // Enhanced filtering for German beauty/cosmetics sites and backlink opportunities
              if (url && 
                  !url.includes('google.com') && 
                  !url.includes('youtube.com') && 
                  !url.includes('facebook.com') &&
                  !url.includes('twitter.com') &&
                  !url.includes('instagram.com') &&
                  !url.includes('pinterest.com') &&
                  !url.includes('amazon.') &&
                  !url.includes('ebay.') &&
                  (// Forum and community indicators
                   url.includes('forum') || 
                   url.includes('community') || 
                   url.includes('discuss') || 
                   url.includes('blog') ||
                   url.includes('reddit') ||
                   // German specific sites
                   url.includes('.de') ||
                   url.includes('.at') ||
                   url.includes('.ch') ||
                   // Beauty/cosmetics specific domains
                   url.includes('beauty') ||
                   url.includes('kosmetik') ||
                   url.includes('hautpflege') ||
                   // Content indicators in snippet
                   snippet.toLowerCase().includes('login') ||
                   snippet.toLowerCase().includes('register') ||
                   snippet.toLowerCase().includes('anmelden') ||
                   snippet.toLowerCase().includes('registrieren') ||
                   snippet.toLowerCase().includes('kommentar') ||
                   snippet.toLowerCase().includes('forum') ||
                   snippet.toLowerCase().includes('diskussion') ||
                   snippet.toLowerCase().includes('bewertung') ||
                   snippet.toLowerCase().includes('erfahrung') ||
                   snippet.toLowerCase().includes('gastbeitrag') ||
                   snippet.toLowerCase().includes('mitglied'))) {
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

    // Add curated beauty and cosmetics sites if they match keywords
    const keywordLower = keywords.toLowerCase();
    
    // Beauty and cosmetics specific sites
    if (keywordLower.includes('kosmetik') || keywordLower.includes('hautpflege') || keywordLower.includes('beauty') || keywordLower.includes('gold')) {
      const beautySites = [
        {
          url: 'https://www.beautyjunkies.de/forum/',
          title: 'Beauty Junkies - Deutsches Beauty Forum',
          snippet: 'Größtes deutschsprachiges Beauty-Forum mit aktiver Community',
          source: 'curated'
        },
        {
          url: 'https://www.kosmetik-vegan.de/forum/',
          title: 'Kosmetik Vegan Forum - Naturkosmetik Community',
          snippet: 'Forum für vegane und natürliche Kosmetik mit Diskussionen',
          source: 'curated'
        },
        {
          url: 'https://www.planet-liebe.de/forum/beauty-und-styling/',
          title: 'Planet Liebe - Beauty und Styling Forum',
          snippet: 'Community-Forum mit Beauty- und Styling-Diskussionen',
          source: 'curated'
        },
        {
          url: 'https://www.mein-wahres-ich.de/community/',
          title: 'Mein wahres Ich - Beauty Community',
          snippet: 'Deutsche Beauty-Community mit Produktbewertungen',
          source: 'curated'
        },
        {
          url: 'https://forum.glamour.de/',
          title: 'Glamour Forum - Beauty und Mode',
          snippet: 'Glamour Magazin Forum mit Beauty-Diskussionen',
          source: 'curated'
        }
      ];
      discoveredPages.push(...beautySites);
    }
    
    // Tech sites (keep existing)
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

    // Remove duplicates and increase results limit
    const uniquePages = Array.from(new Map(discoveredPages.map(page => [page.url, page])).values())
      .slice(0, 20); // Increased to 20 pages for better coverage

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