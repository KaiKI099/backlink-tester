"use client";

import { useState } from 'react';
import BacklinkSearchForm from './components/BacklinkSearchForm';
import SearchResults from './components/SearchResults';

interface AnalysisResult {
  isOpportunity: boolean;
  confidence: number;
  reason: string;
  backlinkContext: string;
  pageType: string;
  difficulty: string;
  recommendedAction: string;
}

interface SearchResult {
  url: string;
  title: string;
  metaDescription: string;
  analysis: AnalysisResult;
  interactiveFeatures: {
    hasComments: boolean;
    hasContactForm: boolean;
    hasForum: boolean;
    hasUserProfiles: boolean;
    hasLoginForm: boolean;
    hasRegistration: boolean;
    hasContentSubmission: boolean;
    hasSocialSharing: boolean;
  };
  discoveryInfo?: {
    title: string;
    snippet: string;
    source: string;
  };
}

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{keywords: string; targetUrl: string} | null>(null);

  const handleSearch = async (url: string, keywords: string, targetUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    setSearchParams({ keywords, targetUrl }); // Store search parameters
    
    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, targetUrl }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to discover and analyze pages');
      }

      // Convert each result to the expected format
      const newResults: SearchResult[] = data.results.map((result: any) => ({
        url: result.pageData.url,
        title: result.pageData.title || result.discoveryInfo?.title || 'Untitled',
        metaDescription: result.pageData.metaDescription || result.discoveryInfo?.snippet || '',
        analysis: result.analysis,
        interactiveFeatures: result.pageData.interactiveFeatures,
        discoveryInfo: result.discoveryInfo
      }));

      setResults(newResults);
      
      // Show summary if available
      if (data.summary) {
        console.log('Discovery Summary:', data.summary);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI-Powered Backlink Opportunity Finder
            </h1>
            <p className="text-lg text-gray-600">
              Discover high-quality backlink opportunities using local AI analysis
            </p>
          </header>

          <BacklinkSearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading} 
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <SearchResults results={results} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
