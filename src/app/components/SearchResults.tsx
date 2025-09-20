"use client";

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

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900">No results yet</p>
          <p className="text-gray-500">Enter a URL above to start finding backlink opportunities</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    if (confidence >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Analysis Results ({results.length})
      </h2>

      {results.map((result, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            result.analysis.isOpportunity ? 'border-green-500' : 'border-red-500'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {result.title || 'Untitled Page'}
              </h3>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                {result.url}
              </a>
              {result.metaDescription && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {result.metaDescription}
                </p>
              )}
            </div>
            <div className="ml-4 flex flex-col items-end space-y-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  result.analysis.isOpportunity
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {result.analysis.isOpportunity ? '✓ Opportunity' : '✗ Not Suitable'}
              </span>
              <span className={`text-sm font-medium ${getConfidenceColor(result.analysis.confidence)}`}>
                {result.analysis.confidence}% confidence
              </span>
              {result.discoveryInfo && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {result.discoveryInfo.source === 'search' ? '🔍 Found' : '📋 Curated'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Page Analysis</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Page Type:</span>
                  <span className="capitalize">{result.analysis.pageType}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(result.analysis.difficulty)}`}>
                    {result.analysis.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Interactive Features</h4>
              <div className="flex flex-wrap gap-1">
                {result.interactiveFeatures.hasComments && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">💬 Comments</span>
                )}
                {result.interactiveFeatures.hasContactForm && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">📧 Contact Form</span>
                )}
                {result.interactiveFeatures.hasForum && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">💬 Forum</span>
                )}
                {result.interactiveFeatures.hasUserProfiles && (
                  <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded">👤 User Profiles</span>
                )}
                {result.interactiveFeatures.hasLoginForm && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">🔐 Login Form</span>
                )}
                {result.interactiveFeatures.hasRegistration && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">📝 Registration</span>
                )}
                {result.interactiveFeatures.hasContentSubmission && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">📤 Content Submission</span>
                )}
                {result.interactiveFeatures.hasSocialSharing && (
                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">🔗 Social Sharing</span>
                )}
                {!Object.values(result.interactiveFeatures).some(Boolean) && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">No interactive features found</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-gray-700 text-sm">{result.analysis.reason}</p>
            </div>

            {result.analysis.isOpportunity && (
              <div className="space-y-2">
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Recommended Action:</h5>
                  <p className="text-gray-700 text-sm">{result.analysis.recommendedAction}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Backlink Context:</h5>
                  <p className="text-gray-700 text-sm">{result.analysis.backlinkContext}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}