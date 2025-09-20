import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keywords, targetUrl } = await request.json();

    if (!keywords || !targetUrl) {
      return NextResponse.json(
        { error: 'Keywords and target URL are required' },
        { status: 400 }
      );
    }

    console.log(`Starting discovery and analysis for: ${keywords}`);

    // Step 1: Discover relevant pages
    const searchResponse = await fetch(`${request.url.replace('/api/discover', '/api/search')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords, targetUrl })
    });

    const searchData = await searchResponse.json();

    if (!searchData.success) {
      throw new Error(searchData.error || 'Failed to discover pages');
    }

    console.log(`Found ${searchData.discoveredPages.length} pages to analyze`);

    // Step 2: Analyze each discovered page
    const analysisResults = [];
    
    for (let i = 0; i < Math.min(searchData.discoveredPages.length, 5); i++) {
      const page = searchData.discoveredPages[i];
      
      try {
        console.log(`Analyzing page ${i + 1}/${Math.min(searchData.discoveredPages.length, 5)}: ${page.url}`);
        
        const crawlResponse = await fetch(`${request.url.replace('/api/discover', '/api/crawl')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: page.url,
            keywords: keywords,
            targetUrl: targetUrl
          })
        });

        const crawlData = await crawlResponse.json();

        if (crawlData.success) {
          analysisResults.push({
            ...crawlData,
            discoveryInfo: {
              title: page.title,
              snippet: page.snippet,
              source: page.source
            }
          });
        } else {
          console.log(`Failed to analyze ${page.url}: ${crawlData.error}`);
          // Add a failed result for completeness
          analysisResults.push({
            success: false,
            error: crawlData.error,
            pageData: {
              url: page.url,
              title: page.title,
              metaDescription: page.snippet,
              interactiveFeatures: {
                hasComments: false,
                hasContactForm: false,
                hasForum: false,
                hasUserProfiles: false,
                hasSocialSharing: false
              }
            },
            analysis: {
              isOpportunity: false,
              confidence: 0,
              reason: `Failed to analyze page: ${crawlData.error}`,
              backlinkContext: "N/A",
              pageType: "unknown",
              difficulty: "unknown",
              recommendedAction: "Unable to analyze - try manually"
            },
            discoveryInfo: {
              title: page.title,
              snippet: page.snippet,
              source: page.source
            }
          });
        }

        // Add delay between analyses to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (analysisError) {
        console.error(`Error analyzing page ${page.url}:`, analysisError);
        
        // Add a failed result
        analysisResults.push({
          success: false,
          error: 'Analysis failed',
          pageData: {
            url: page.url,
            title: page.title,
            metaDescription: page.snippet,
            interactiveFeatures: {
              hasComments: false,
              hasContactForm: false,
              hasForum: false,
              hasUserProfiles: false,
              hasSocialSharing: false
            }
          },
          analysis: {
            isOpportunity: false,
            confidence: 0,
            reason: `Analysis error: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`,
            backlinkContext: "N/A",
            pageType: "unknown",
            difficulty: "unknown",
            recommendedAction: "Manual review required"
          },
          discoveryInfo: {
            title: page.title,
            snippet: page.snippet,
            source: page.source
          }
        });
      }
    }

    // Calculate summary statistics
    const opportunities = analysisResults.filter(result => result.analysis?.isOpportunity === true);
    const avgConfidence = analysisResults.reduce((sum, result) => 
      sum + (result.analysis?.confidence || 0), 0) / analysisResults.length;

    console.log(`Analysis complete: ${opportunities.length}/${analysisResults.length} opportunities found`);

    return NextResponse.json({
      success: true,
      results: analysisResults,
      summary: {
        totalAnalyzed: analysisResults.length,
        opportunitiesFound: opportunities.length,
        averageConfidence: Math.round(avgConfidence),
        discoveredPages: searchData.discoveredPages.length
      }
    });

  } catch (error) {
    console.error('Error in discovery and analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to discover and analyze pages', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}