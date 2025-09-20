const axios = require('axios');

async function testDiscovery() {
  const baseURL = 'http://localhost:3000';
  
  // Test data with relevant keywords that should find forums and communities
  const testData = {
    keywords: 'web development programming',
    targetUrl: 'https://my-dev-blog.com'
  };

  console.log('🧪 Testing Automated Backlink Discovery Workflow...\n');

  try {
    console.log('📋 Test Parameters:');
    console.log('- Keywords:', testData.keywords);
    console.log('- Target URL:', testData.targetUrl);
    console.log('\n🔍 Starting discovery and analysis...\n');
    
    const startTime = Date.now();
    const response = await axios.post(`${baseURL}/api/discover`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000 // 5 minute timeout for multiple analyses
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ Discovery completed in ${Math.round(duration)} seconds\n`);
    
    if (response.data.success) {
      const { results, summary } = response.data;
      
      console.log('📊 DISCOVERY SUMMARY:');
      console.log(`- Pages Discovered: ${summary.discoveredPages}`);
      console.log(`- Pages Analyzed: ${summary.totalAnalyzed}`);
      console.log(`- Opportunities Found: ${summary.opportunitiesFound}`);
      console.log(`- Average Confidence: ${summary.averageConfidence}%\n`);
      
      console.log('🎯 DETAILED ANALYSIS RESULTS:\n');
      
      results.forEach((result, index) => {
        console.log(`--- PAGE ${index + 1} ---`);
        console.log(`🌐 URL: ${result.pageData.url}`);
        console.log(`📝 Title: ${result.pageData.title || 'No title'}`);
        
        if (result.discoveryInfo) {
          console.log(`🔍 Discovery Source: ${result.discoveryInfo.source}`);
          console.log(`📋 Original Title: ${result.discoveryInfo.title}`);
        }
        
        const analysis = result.analysis;
        console.log(`🎯 Opportunity: ${analysis.isOpportunity ? '✅ YES' : '❌ NO'}`);
        console.log(`📈 Confidence: ${analysis.confidence}%`);
        console.log(`🏷️ Page Type: ${analysis.pageType}`);
        console.log(`⚡ Difficulty: ${analysis.difficulty}`);
        console.log(`💡 Reason: ${analysis.reason}`);
        
        if (analysis.isOpportunity) {
          console.log(`🎪 Recommended Action: ${analysis.recommendedAction}`);
          console.log(`📍 Context: ${analysis.backlinkContext}`);
        }
        
        // Interactive features
        const features = result.pageData.interactiveFeatures;
        const foundFeatures = [];
        if (features.hasComments) foundFeatures.push('💬 Comments');
        if (features.hasContactForm) foundFeatures.push('📧 Contact Form');
        if (features.hasForum) foundFeatures.push('💬 Forum');
        if (features.hasUserProfiles) foundFeatures.push('👤 User Profiles');
        if (features.hasLoginForm) foundFeatures.push('🔐 Login Form');
        if (features.hasRegistration) foundFeatures.push('📝 Registration');
        if (features.hasContentSubmission) foundFeatures.push('📤 Content Submission');
        if (features.hasSocialSharing) foundFeatures.push('🔗 Social Sharing');
        
        console.log(`🔧 Interactive Features: ${foundFeatures.length > 0 ? foundFeatures.join(', ') : 'None detected'}`);
        console.log(''); // Empty line between results
      });
      
      // Analysis summary
      const opportunities = results.filter(r => r.analysis.isOpportunity);
      if (opportunities.length > 0) {
        console.log('🎉 TOP OPPORTUNITIES:');
        opportunities
          .sort((a, b) => b.analysis.confidence - a.analysis.confidence)
          .slice(0, 3)
          .forEach((opp, i) => {
            console.log(`${i + 1}. ${opp.pageData.url} (${opp.analysis.confidence}% confidence)`);
            console.log(`   Action: ${opp.analysis.recommendedAction}`);
          });
      }
      
      console.log('\n✨ Automated discovery test completed successfully!');
    } else {
      console.log('❌ Discovery failed:', response.data.error);
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
testDiscovery();