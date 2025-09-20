import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export async function POST(request: NextRequest) {
  try {
    const { content, keywords, targetUrl } = await request.json();

    if (!content || !keywords || !targetUrl) {
      return NextResponse.json(
        { error: 'Content, keywords, and target URL are required' },
        { status: 400 }
      );
    }

    const prompt = `
    As a backlink SEO expert, analyze the following webpage content to determine if it's a good opportunity for placing a backlink to "${targetUrl}".

    Target keywords: ${keywords}
    Webpage content: ${content}

    Please evaluate this page for backlink opportunities and respond in JSON format with the following structure:
    {
      "isOpportunity": boolean,
      "confidence": number (0-100),
      "reason": "string explaining why this is or isn't a good opportunity",
      "backlinkContext": "suggested context or section where the backlink could be placed",
      "pageType": "forum, blog, article, directory, etc.",
      "difficulty": "easy, medium, hard",
      "recommendedAction": "specific action to take (e.g., 'comment on post', 'contact author', 'register and post')"
    }

    Focus on:
    1. Content relevance to the target keywords
    2. Whether the page accepts user-generated content (comments, forum posts, etc.)
    3. Domain authority indicators
    4. Existing backlink opportunities (comment sections, user profiles, etc.)
    5. Content quality and spam indicators
    `;

    const response = await Promise.race([
      ollama.chat({
        model: 'qwen2.5:32b-instruct-q4_K_M',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ollama request timed out after 120 seconds')), 120000)
      )
    ]);

    let analysisResult;
    try {
      // Try to parse the JSON response from the model
      const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured response from the text
        analysisResult = {
          isOpportunity: response.message.content.toLowerCase().includes('good opportunity') || 
                        response.message.content.toLowerCase().includes('yes'),
          confidence: 50,
          reason: response.message.content,
          backlinkContext: "Manual analysis needed",
          pageType: "unknown",
          difficulty: "medium",
          recommendedAction: "Manual review required"
        };
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisResult = {
        isOpportunity: false,
        confidence: 0,
        reason: "Error parsing AI response: " + response.message.content,
        backlinkContext: "N/A",
        pageType: "unknown",
        difficulty: "unknown",
        recommendedAction: "Manual review required"
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      rawResponse: response.message.content
    });

  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}