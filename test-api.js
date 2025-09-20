const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  // Test data
  const testData = {
    url: 'https://example.com',
    keywords: 'example, test, demo',
    targetUrl: 'https://my-website.com'
  };

  console.log('🧪 Testing Backlink Opportunity Finder API...\n');

  try {
    // Test the crawl endpoint
    console.log('📡 Testing /api/crawl endpoint...');
    console.log('Request data:', testData);
    
    const startTime = Date.now();
    const response = await axios.post(`${baseURL}/api/crawl`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 150000 // 150 second timeout for slow AI model
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ API Response received in ${duration} seconds`);
    console.log('Success:', response.data.success);
    
    if (response.data.success) {
      console.log('\n📊 Analysis Results:');
      console.log('- Page Title:', response.data.pageData.title);
      console.log('- Page URL:', response.data.pageData.url);
      console.log('- Meta Description:', response.data.pageData.metaDescription);
      
      console.log('\n🎯 AI Analysis:');
      const analysis = response.data.analysis;
      console.log('- Is Opportunity:', analysis.isOpportunity);
      console.log('- Confidence:', analysis.confidence + '%');
      console.log('- Page Type:', analysis.pageType);
      console.log('- Difficulty:', analysis.difficulty);
      console.log('- Reason:', analysis.reason);
      console.log('- Recommended Action:', analysis.recommendedAction);
      
      console.log('\n🔧 Interactive Features:');
      const features = response.data.pageData.interactiveFeatures;
      console.log('- Comments:', features.hasComments);
      console.log('- Contact Form:', features.hasContactForm);
      console.log('- Forum:', features.hasForum);
      console.log('- User Profiles:', features.hasUserProfiles);
      console.log('- Social Sharing:', features.hasSocialSharing);
      
      console.log('\n🎉 Test completed successfully!');
    } else {
      console.log('❌ API returned success: false');
      console.log('Error:', response.data.error);
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
testAPI();