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

    // Call the search endpoint
    const searchResponse = await fetch(`${request.url.replace('/api/download-results', '/api/search')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords, targetUrl })
    });

    const searchData = await searchResponse.json();

    if (!searchData.success) {
      throw new Error(searchData.error || 'Failed to search pages');
    }

    // Create structured JSON export
    const exportData = {
      keywords: keywords,
      targetUrl: targetUrl,
      timestamp: new Date().toISOString(),
      discoveryStatistics: {
        totalFound: searchData.totalFound,
        searchStatus: searchData.success ? 'success' : 'failed',
        searchQueries: 8,
        maxResults: 20,
        analysisCapacity: 10
      },
      discoveredPages: searchData.discoveredPages?.map((page: any, index: number) => ({
        id: index + 1,
        title: page.title || 'Untitled',
        url: page.url,
        description: page.snippet || 'No description available',
        source: page.source,
        discoveryMethod: page.source === 'search' ? 'Automated Search' : 'Curated Database',
        potentialBacklinkTypes: [
          ...(page.url.includes('forum') ? ['Forum Discussion'] : []),
          ...(page.url.includes('blog') ? ['Blog Comment'] : []),
          ...(page.snippet?.toLowerCase().includes('gastbeitrag') ? ['Guest Post'] : []),
          ...(page.snippet?.toLowerCase().includes('kommentar') ? ['User Comment'] : []),
          ...(page.snippet?.toLowerCase().includes('bewertung') ? ['User Review'] : [])
        ],
        targetMarket: {
          language: page.url.includes('.de') || page.url.includes('.at') || page.url.includes('.ch') ? 'German' : 'International',
          region: page.url.includes('.de') ? 'Germany' : page.url.includes('.at') ? 'Austria' : page.url.includes('.ch') ? 'Switzerland' : 'Other',
          industry: page.url.includes('beauty') || page.url.includes('kosmetik') || page.title?.toLowerCase().includes('beauty') ? 'Beauty/Cosmetics' : 'General'
        }
      })) || [],
      analysisMetrics: {
        germanSitesFound: searchData.discoveredPages?.filter((p: any) => p.url.includes('.de') || p.url.includes('.at') || p.url.includes('.ch')).length || 0,
        beautySpecificSites: searchData.discoveredPages?.filter((p: any) => p.url.includes('beauty') || p.url.includes('kosmetik') || p.title?.toLowerCase().includes('beauty')).length || 0,
        forumOpportunities: searchData.discoveredPages?.filter((p: any) => p.url.includes('forum') || p.title?.toLowerCase().includes('forum')).length || 0,
        blogOpportunities: searchData.discoveredPages?.filter((p: any) => p.url.includes('blog') || p.title?.toLowerCase().includes('blog')).length || 0
      },
      metadata: {
        generatedBy: 'AI-Powered Backlink Opportunity Finder',
        version: '2.0',
        searchEnhanced: true,
        germanBeautyFocus: true,
        exportFormat: 'JSON',
        compatibility: ['Excel', 'Google Sheets', 'CSV Conversion', 'API Import']
      }
    };

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const keywordSlug = keywords.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
    const filename = `backlink-opportunities-${keywordSlug}-${timestamp}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Total-Results': searchData.totalFound.toString(),
        'X-German-Sites': exportData.analysisMetrics.germanSitesFound.toString(),
        'X-Beauty-Sites': exportData.analysisMetrics.beautySpecificSites.toString()
      },
    });

  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate download', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}