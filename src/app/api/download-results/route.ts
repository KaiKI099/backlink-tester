import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keywords, targetUrl, results } = await request.json();

    if (!keywords || !targetUrl) {
      return NextResponse.json(
        { error: 'Keywords and target URL are required' },
        { status: 400 }
      );
    }

    // If results are provided, use them directly; otherwise call discover endpoint
    let discoverData;
    if (results && results.length > 0) {
      discoverData = { success: true, results, totalFound: results.length };
    } else {
      // Call the discover endpoint
      const discoverResponse = await fetch(`${request.url.replace('/api/download-results', '/api/discover')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, targetUrl })
      });

      discoverData = await discoverResponse.json();

      if (!discoverData.success) {
        throw new Error(discoverData.error || 'Failed to discover pages');
      }
    }

    // Create structured JSON export
    const exportData = {
      keywords: keywords,
      targetUrl: targetUrl,
      timestamp: new Date().toISOString(),
      discoveryStatistics: {
        totalFound: discoverData.totalFound || discoverData.results?.length || 0,
        searchStatus: discoverData.success ? 'success' : 'failed',
        searchQueries: 8,
        maxResults: 20,
        analysisCapacity: 10
      },
      discoveredPages: discoverData.results?.map((result: any, index: number) => {
        const pageData = result.pageData || {};
        const discoveryInfo = result.discoveryInfo || {};
        return {
          id: index + 1,
          title: pageData.title || discoveryInfo.title || 'Untitled',
          url: pageData.url || result.url,
          description: pageData.metaDescription || discoveryInfo.snippet || 'No description available',
          source: discoveryInfo.source || 'unknown',
          discoveryMethod: discoveryInfo.source === 'search' ? 'Automated Search' : 'Curated Database',
          potentialBacklinkTypes: [
            ...(pageData.interactiveFeatures?.hasForum ? ['Forum Discussion'] : []),
            ...(pageData.interactiveFeatures?.hasComments ? ['Blog Comment'] : []),
            ...(pageData.interactiveFeatures?.hasContentSubmission ? ['Content Submission'] : []),
            ...(pageData.interactiveFeatures?.hasContactForm ? ['Contact Form'] : []),
            ...(discoveryInfo.snippet?.toLowerCase().includes('gastbeitrag') ? ['Guest Post'] : [])
          ],
          targetMarket: {
            language: pageData.url?.includes('.de') || pageData.url?.includes('.at') || pageData.url?.includes('.ch') ? 'German' : 'International',
            region: pageData.url?.includes('.de') ? 'Germany' : pageData.url?.includes('.at') ? 'Austria' : pageData.url?.includes('.ch') ? 'Switzerland' : 'Other',
            industry: pageData.url?.includes('beauty') || pageData.url?.includes('kosmetik') || pageData.title?.toLowerCase().includes('beauty') ? 'Beauty/Cosmetics' : 'General'
          },
          analysis: result.analysis || {},
          confidence: result.analysis?.confidence || 0,
          isOpportunity: result.analysis?.isOpportunity || false
        };
      }) || [],
      analysisMetrics: {
        totalOpportunities: discoverData.results?.filter((r: any) => r.analysis?.isOpportunity).length || 0,
        highConfidence: discoverData.results?.filter((r: any) => r.analysis?.confidence >= 80).length || 0,
        mediumConfidence: discoverData.results?.filter((r: any) => r.analysis?.confidence >= 60 && r.analysis?.confidence < 80).length || 0,
        lowConfidence: discoverData.results?.filter((r: any) => r.analysis?.confidence < 60).length || 0
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
        'X-Total-Results': exportData.discoveryStatistics.totalFound.toString(),
        'X-Total-Opportunities': exportData.analysisMetrics.totalOpportunities.toString(),
        'X-High-Confidence': exportData.analysisMetrics.highConfidence.toString()
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