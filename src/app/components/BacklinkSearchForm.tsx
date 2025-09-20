"use client";

import { useState } from 'react';

interface BacklinkSearchFormProps {
  onSearch: (url: string, keywords: string, targetUrl: string) => void;
  isLoading: boolean;
}

export default function BacklinkSearchForm({ onSearch, isLoading }: BacklinkSearchFormProps) {
  const [keywords, setKeywords] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() && targetUrl.trim()) {
      onSearch('', keywords.trim(), targetUrl.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Your Target URL (where you want backlinks to point to)
          </label>
          <input
            type="url"
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
            Target Keywords (comma-separated)
          </label>
          <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="SEO, digital marketing, web development"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>


        <button
          type="submit"
          disabled={isLoading || !keywords.trim() || !targetUrl.trim()}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            isLoading || !keywords.trim() || !targetUrl.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Discovering and analyzing pages...
            </div>
          ) : (
            'Find Backlink Opportunities'
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Enter your target URL (where you want backlinks to point)</li>
          <li>Add relevant keywords for your niche</li>
          <li>Our AI will search for relevant pages with login forms and forums</li>
          <li>Each discovered page is analyzed for backlink potential</li>
          <li>Get specific recommendations for each opportunity</li>
        </ol>
      </div>
    </div>
  );
}