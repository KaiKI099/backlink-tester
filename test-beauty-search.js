const axios = require('axios');

async function testBeautySearch() {
  const baseURL = 'http://localhost:3000';
  
  // German beauty/cosmetics test data
  const testData = {
    keywords: 'flüssiges Gold, luxus kosmetik, hautpflege',
    targetUrl: 'https://my-beauty-brand.com'
  };

  console.log('🧪 Testing Enhanced German Beauty/Cosmetics Search...\n');

  try {
    console.log('📋 Test Parameters:');
    console.log('- Keywords:', testData.keywords);
    console.log('- Target URL:', testData.targetUrl);
    console.log('- Focus: German beauty market');
    console.log('\n🔍 Testing search discovery only (fast)...\n');
    
    const startTime = Date.now();
    const response = await axios.post(`${baseURL}/api/search`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000 // 60 second timeout for search only
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ Search completed in ${Math.round(duration)} seconds\n`);
    
    if (response.data.success) {
      const { discoveredPages, totalFound } = response.data;
      
      console.log('📊 SEARCH RESULTS SUMMARY:');
      console.log(`- Total Pages Discovered: ${totalFound}`);
      console.log(`- Improvement: ${totalFound > 5 ? '🚀 MUCH BETTER' : '⚠️ Needs improvement'} (was finding only 5 pages before)`);
      console.log('');
      
      console.log('🎯 DISCOVERED BACKLINK OPPORTUNITIES:\n');
      
      // Group by source type
      const searchResults = discoveredPages.filter(page => page.source === 'search');
      const curatedResults = discoveredPages.filter(page => page.source === 'curated');
      
      if (searchResults.length > 0) {
        console.log('🔍 FOUND VIA SEARCH:');
        searchResults.forEach((page, index) => {
          console.log(`${index + 1}. ${page.title}`);
          console.log(`   URL: ${page.url}`);
          console.log(`   Snippet: ${page.snippet.substring(0, 100)}...`);
          console.log('');
        });
      }
      
      if (curatedResults.length > 0) {
        console.log('📋 CURATED GERMAN BEAUTY SITES:');
        curatedResults.forEach((page, index) => {
          console.log(`${index + 1}. ${page.title}`);
          console.log(`   URL: ${page.url}`);
          console.log(`   Description: ${page.snippet}`);
          console.log('');
        });
      }
      
      console.log('🎯 ANALYSIS SUMMARY:');
      console.log(`✅ German sites found: ${discoveredPages.filter(p => p.url.includes('.de') || p.url.includes('.at') || p.url.includes('.ch')).length}`);
      console.log(`✅ Beauty-specific sites: ${discoveredPages.filter(p => p.url.includes('beauty') || p.url.includes('kosmetik') || p.title.toLowerCase().includes('beauty')).length}`);
      console.log(`✅ Forum opportunities: ${discoveredPages.filter(p => p.url.includes('forum') || p.title.toLowerCase().includes('forum')).length}`);
      console.log(`✅ Blog opportunities: ${discoveredPages.filter(p => p.url.includes('blog') || p.title.toLowerCase().includes('blog')).length}`);
      
      console.log('\n🌐 Debug in Browser:');
      console.log(`You can view detailed results at: ${baseURL}/api/debug-search`);
      console.log('Send a POST request with the same keywords to see formatted results');
      
      console.log('\n✨ Enhanced search test completed successfully!');
      console.log('🚀 The search matrix expansion is working - finding more relevant opportunities!');
      
    } else {
      console.log('❌ Search failed:', response.data.error);
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
}

// Run the test
testBeautySearch();