const axios = require('axios');
const fs = require('fs');

async function testJSONDownload() {
  const baseURL = 'http://localhost:3000';
  
  // Test data
  const testData = {
    keywords: 'flüssiges Gold, luxus kosmetik, hautpflege',
    targetUrl: 'https://my-beauty-brand.com'
  };

  console.log('🧪 Testing JSON Download Functionality...\n');

  try {
    console.log('📋 Test Parameters:');
    console.log('- Keywords:', testData.keywords);
    console.log('- Target URL:', testData.targetUrl);
    console.log('\n📥 Testing JSON download endpoint...\n');
    
    const startTime = Date.now();
    const response = await axios.post(`${baseURL}/api/download-results`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000 // 60 second timeout
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ Download endpoint responded in ${Math.round(duration)} seconds\n`);
    
    // Parse the JSON response
    const jsonData = response.data;
    
    console.log('📊 DOWNLOAD SUMMARY:');
    console.log(`- Keywords: ${jsonData.keywords}`);
    console.log(`- Target URL: ${jsonData.targetUrl}`);
    console.log(`- Generated: ${jsonData.timestamp}`);
    console.log(`- Total Results: ${jsonData.discoveryStatistics.totalFound}`);
    console.log('');
    
    console.log('🎯 ANALYSIS METRICS:');
    console.log(`- German Sites: ${jsonData.analysisMetrics.germanSitesFound}`);
    console.log(`- Beauty Sites: ${jsonData.analysisMetrics.beautySpecificSites}`);
    console.log(`- Forum Opportunities: ${jsonData.analysisMetrics.forumOpportunities}`);
    console.log(`- Blog Opportunities: ${jsonData.analysisMetrics.blogOpportunities}`);
    console.log('');
    
    console.log('🔍 SAMPLE DISCOVERED PAGES:');
    jsonData.discoveredPages.slice(0, 3).forEach((page, index) => {
      console.log(`${index + 1}. ${page.title}`);
      console.log(`   URL: ${page.url}`);
      console.log(`   Source: ${page.discoveryMethod}`);
      console.log(`   Market: ${page.targetMarket.language} (${page.targetMarket.region})`);
      console.log(`   Industry: ${page.targetMarket.industry}`);
      console.log(`   Backlink Types: ${page.potentialBacklinkTypes.join(', ') || 'General'}`);
      console.log('');
    });
    
    // Save to file for demonstration
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backlink-opportunities-test-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2));
    console.log(`💾 JSON file saved locally as: ${filename}`);
    
    console.log('\n📋 JSON STRUCTURE:');
    console.log('- keywords: Search terms used');
    console.log('- targetUrl: Your website URL');
    console.log('- timestamp: When the search was performed');
    console.log('- discoveryStatistics: Overall search performance');
    console.log('- discoveredPages: Array of found opportunities with metadata');
    console.log('- analysisMetrics: Categorized opportunity counts');
    console.log('- metadata: Tool version and compatibility info');
    
    console.log('\n🔧 COMPATIBILITY:');
    jsonData.metadata.compatibility.forEach(format => {
      console.log(`✅ ${format}`);
    });
    
    console.log('\n✨ JSON download functionality test completed successfully!');
    console.log('🎉 Users can now export and analyze backlink opportunities offline!');
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Error:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
}

// Run the test
testJSONDownload();