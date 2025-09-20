import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../lib/supabase';

function TipArticle() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  // Function to show notification and auto-hide it
  const showCopyNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get specific tip content from Supabase by ID
        const { data: tipsData, error: tipsError } = await db.getWebsiteContentBySection('tips');
        
        if (tipsError) throw tipsError;
        
        if (tipsData && tipsData.length > 0) {
          // Find the specific article by ID
          const article = tipsData.find(tip => tip.id.toString() === id);
          
          if (article) {
            // Transform the data to match the expected format
            const transformedData = {
              id: article.id,
              documentId: article.id,
              Title: article.fields?.title || 'Untitled Article',
              Date: article.fields?.publish_date || new Date().toISOString().split('T')[0],
              Content: article.fields?.content || 'No content available.',
              Author: article.fields?.author || '',
              Category: article.fields?.category || '',
              Tags: article.fields?.tags || '',
              ReadingTime: article.fields?.reading_time || '',
              FeaturedImage: article.fields?.featured_image || '',
              MetaDescription: article.fields?.meta_description || '',
              Excerpt: article.fields?.excerpt || ''
            };
            
            setData(transformedData);
          } else {
            setError('Article not found');
          }
        } else {
          setError('No articles found');
        }
      } catch (err) {
        console.error('Error fetching tip article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <Link 
              to="/tips"
              className="text-brand-blue hover:text-blue-800 mb-6 inline-block"
            >
              ← Back to Tips
            </Link>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
              <p className="text-gray-600 mb-4">The requested article could not be found.</p>
              <Link to="/tips" className="text-brand-blue hover:text-blue-800">
                Return to Tips
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <Link 
              to="/tips"
              className="text-brand-blue hover:text-blue-800 mb-6 inline-block"
            >
              ← Back to Tips
            </Link>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
              <Link to="/tips" className="text-brand-blue hover:text-blue-800">
                Return to Tips
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <Link 
            to="/tips"
            className="text-brand-blue hover:text-blue-800 mb-6 inline-block"
          >
            ← Back to Tips
          </Link>
          
          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.Title}</h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span>{formatDate(data.Date)}</span>
              {data.Author && <span>By {data.Author}</span>}
              {data.ReadingTime && <span>{data.ReadingTime}</span>}
            </div>
            
            {/* Category and Tags */}
            {(data.Category || data.Tags) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.Category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    {data.Category}
                  </span>
                )}
                {data.Tags && data.Tags.split(',').map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
            
            {/* Excerpt */}
            {data.Excerpt && (
              <div className="bg-gray-50 border-l-4 border-brand-teal p-4 mb-6">
                <p className="text-gray-700 italic">{data.Excerpt}</p>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {data.FeaturedImage && (
            <div className="mb-8">
              <img 
                src={data.FeaturedImage} 
                alt={data.Title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: data.Content
                  .replace(/\n/g, '<br />')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/###\s*(.*?)(?:\n|$)/g, '<h3>$1</h3>')
                  .replace(/##\s*(.*?)(?:\n|$)/g, '<h2>$1</h2>')
                  .replace(/#\s*(.*?)(?:\n|$)/g, '<h1>$1</h1>')
              }}
            />
          </div>

          {/* Article Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Share this article:</p>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showCopyNotification();
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  const text = `${data.Title} - ${window.location.href}`;
                  if (navigator.share) {
                    navigator.share({ title: data.Title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(text);
                    showCopyNotification();
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Share
              </button>
            </div>
          </div>
          
          {/* Back to Tips */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/tips"
              className="inline-block bg-brand-teal text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Read More Tips
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TipArticle;