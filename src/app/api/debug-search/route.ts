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
    const searchResponse = await fetch(`${request.url.replace('/api/debug-search', '/api/search')}`, {
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

    // Create HTML to display results
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Search Results Debug - ${keywords}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 40px;
          background: #f8f9fa;
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          border-bottom: 2px solid #e9ecef; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .result-card { 
          border: 1px solid #dee2e6; 
          padding: 20px; 
          margin: 15px 0; 
          border-radius: 6px; 
          background: #f8f9fa;
        }
        .result-url { 
          color: #0066cc; 
          text-decoration: none; 
          font-weight: 500;
        }
        .result-url:hover { 
          text-decoration: underline; 
        }
        .result-title { 
          font-size: 18px; 
          font-weight: 600; 
          margin: 10px 0; 
          color: #212529;
        }
        .result-snippet { 
          color: #6c757d; 
          margin: 10px 0; 
          line-height: 1.5;
        }
        .result-source { 
          background: #007bff; 
          color: white; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: 500;
          display: inline-block;
          margin-top: 10px;
        }
        .stats { 
          background: #e3f2fd; 
          padding: 15px; 
          border-radius: 6px; 
          margin: 20px 0; 
        }
        .search-info {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .no-results {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          padding: 40px;
        }
        .download-section {
          background: #e8f5e8;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          text-align: center;
        }
        .download-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .download-btn:hover {
          background: #218838;
        }
        .download-btn:active {
          transform: translateY(1px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔍 Search Results Debug</h1>
          <div class="search-info">
            <strong>Keywords:</strong> ${keywords}<br>
            <strong>Target URL:</strong> ${targetUrl}
          </div>
        </div>
        
        <div class="stats">
          <h3>📊 Discovery Statistics</h3>
          <p><strong>Total Pages Found:</strong> ${searchData.totalFound}</p>
          <p><strong>Search Status:</strong> ${searchData.success ? '✅ Success' : '❌ Failed'}</p>
        </div>

        <div class="download-section">
          <h3>💾 Export Results</h3>
          <p>Download the search results as a JSON file for further analysis or import into other tools.</p>
          <button class="download-btn" onclick="downloadJSON()">
            <span>📥</span>
            Download JSON
          </button>
        </div>

        ${searchData.discoveredPages && searchData.discoveredPages.length > 0 ? `
          <h2>🎯 Discovered Backlink Opportunities</h2>
          ${searchData.discoveredPages.map((page: any, index: number) => `
            <div class="result-card">
              <div class="result-source">${page.source === 'search' ? '🔍 Found via Search' : '📋 Curated'}</div>
              <div class="result-title">${page.title || 'Untitled'}</div>
              <a href="${page.url}" target="_blank" class="result-url">${page.url}</a>
              <div class="result-snippet">${page.snippet || 'No description available'}</div>
            </div>
          `).join('')}
        ` : `
          <div class="no-results">
            <h3>No results found</h3>
            <p>The search didn't return any potential backlink opportunities for the given keywords.</p>
          </div>
        `}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
          <p>🤖 AI-Powered Backlink Opportunity Finder - Debug Mode</p>
        </div>
      </div>

      <script>
        // Search results data
        const searchResults = ${JSON.stringify({
          keywords: keywords,
          targetUrl: targetUrl,
          timestamp: new Date().toISOString(),
          discoveryStatistics: {
            totalFound: searchData.totalFound,
            searchStatus: searchData.success ? 'success' : 'failed'
          },
          discoveredPages: searchData.discoveredPages || [],
          metadata: {
            generatedBy: 'AI-Powered Backlink Opportunity Finder',
            version: '2.0',
            searchEnhanced: true,
            germanBeautyFocus: true
          }
        }, null, 2)};

        function downloadJSON() {
          try {
            // Create filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const keywordSlug = searchResults.keywords.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
            const filename = \`backlink-opportunities-\${keywordSlug}-\${timestamp}.json\`;
            
            // Create blob and download
            const blob = new Blob([JSON.stringify(searchResults, null, 2)], {
              type: 'application/json'
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Show success feedback
            const button = document.querySelector('.download-btn');
            const originalContent = button.innerHTML;
            button.innerHTML = '<span>✓</span> Downloaded!';
            button.style.background = '#218838';
            
            setTimeout(() => {
              button.innerHTML = originalContent;
              button.style.background = '#28a745';
            }, 2000);
            
          } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
          }
        }
      </script>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error in debug search:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug search', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}