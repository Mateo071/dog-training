import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';

const Tips = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Get tips content from Supabase
      const { data: tipsData, error: tipsError } = await db.getWebsiteContentBySection('tips');
      
      if (tipsError) throw tipsError;
      
      if (tipsData && tipsData.length > 0) {
        // Transform the data to match the expected format
        const transformedData = tipsData.map(tip => ({
          id: tip.id,
          documentId: tip.id,
          Title: tip.fields?.title || 'Untitled Article',
          Date: tip.fields?.publish_date || new Date().toISOString().split('T')[0],
          Content: [{
            children: [{
              text: tip.fields?.excerpt || tip.fields?.content?.substring(0, 180) || 'No content available...'
            }]
          }],
          // Store full content and other fields for article view
          fullContent: tip.fields?.content || '',
          Author: tip.fields?.author || '',
          Category: tip.fields?.category || '',
          Tags: tip.fields?.tags || '',
          ReadingTime: tip.fields?.reading_time || '',
          FeaturedImage: tip.fields?.featured_image || '',
          MetaDescription: tip.fields?.meta_description || ''
        }));
        
        // Sort by date (newest first) - reverse chronological order
        const sortedData = transformedData.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        setData(sortedData);
      } else {
        // Fallback to sample tips if no content found
        setData([
          {
            id: 1,
            documentId: 1,
            Title: 'House Training Your Puppy: A Complete Guide',
            Date: '2024-03-15',
            Content: [{
              children: [{
                text: 'House training is one of the most important skills your puppy needs to learn. With consistency and patience, most puppies can be successfully house trained within 4-6 months...'
              }]
            }],
            fullContent: 'House training is one of the most important skills your puppy needs to learn. With consistency and patience, most puppies can be successfully house trained within 4-6 months. Here are the essential steps to success...',
            Author: 'Flores Dog Training',
            Category: 'Puppy Training',
            ReadingTime: '8 min read'
          },
          {
            id: 2,
            documentId: 2,
            Title: 'Understanding Dog Body Language',
            Date: '2024-03-10',
            Content: [{
              children: [{
                text: 'Learning to read your dog\'s body language is crucial for building a strong relationship. Dogs communicate primarily through physical signals rather than vocalizations...'
              }]
            }],
            fullContent: 'Learning to read your dog\'s body language is crucial for building a strong relationship. Dogs communicate primarily through physical signals rather than vocalizations. Here\'s what to watch for...',
            Author: 'Flores Dog Training',
            Category: 'Dog Behavior',
            ReadingTime: '5 min read'
          },
          {
            id: 3,
            documentId: 3,
            Title: 'Dealing with Separation Anxiety',
            Date: '2024-03-05',
            Content: [{
              children: [{
                text: 'Separation anxiety is a common issue that affects many dogs when left alone. Understanding the signs and implementing proper training techniques can help your dog feel more secure...'
              }]
            }],
            fullContent: 'Separation anxiety is a common issue that affects many dogs when left alone. Understanding the signs and implementing proper training techniques can help your dog feel more secure when you\'re away...',
            Author: 'Flores Dog Training',
            Category: 'Behavioral Issues',
            ReadingTime: '6 min read'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching tips data:', err);
      setError(err.message);
      
      // Fallback to sample tips on error
      setData([
        {
          id: 1,
          documentId: 1,
          Title: 'House Training Your Puppy: A Complete Guide',
          Date: '2024-03-15',
          Content: [{
            children: [{
              text: 'House training is one of the most important skills your puppy needs to learn. With consistency and patience, most puppies can be successfully house trained within 4-6 months...'
            }]
          }],
          fullContent: 'House training is one of the most important skills your puppy needs to learn. With consistency and patience, most puppies can be successfully house trained within 4-6 months. Here are the essential steps to success...',
          Author: 'Flores Dog Training',
          Category: 'Puppy Training',
          ReadingTime: '8 min read'
        },
        {
          id: 2,
          documentId: 2,
          Title: 'Understanding Dog Body Language',
          Date: '2024-03-10',
          Content: [{
            children: [{
              text: 'Learning to read your dog\'s body language is crucial for building a strong relationship. Dogs communicate primarily through physical signals rather than vocalizations...'
            }]
          }],
          fullContent: 'Learning to read your dog\'s body language is crucial for building a strong relationship. Dogs communicate primarily through physical signals rather than vocalizations. Here\'s what to watch for...',
          Author: 'Flores Dog Training',
          Category: 'Dog Behavior',
          ReadingTime: '5 min read'
        },
        {
          id: 3,
          documentId: 3,
          Title: 'Dealing with Separation Anxiety',
          Date: '2024-03-05',
          Content: [{
            children: [{
              text: 'Separation anxiety is a common issue that affects many dogs when left alone. Understanding the signs and implementing proper training techniques can help your dog feel more secure...'
            }]
          }],
          fullContent: 'Separation anxiety is a common issue that affects many dogs when left alone. Understanding the signs and implementing proper training techniques can help your dog feel more secure when you\'re away...',
          Author: 'Flores Dog Training',
          Category: 'Behavioral Issues',
          ReadingTime: '6 min read'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
          <h2 className="relative text-3xl font-bold text-center py-4">Training Tips & Guides</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
          <h2 className="relative text-3xl font-bold text-center py-4">Training Tips & Guides</h2>
        </div>
        <div className="text-center text-red-600 py-8">
          Error loading tips. Please try again later.
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
          <h2 className="relative text-3xl font-bold text-center py-4">Training Tips & Guides</h2>
        </div>
        <div className="text-center text-gray-600 py-8">
          No tips available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
        <h2 className="relative text-3xl font-bold text-center py-4">Training Tips & Guides</h2>
      </div>
      <div className="space-y-6">
        {data.map(article => (
          <div 
            key={article.documentId}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <Link to={`/tips/${article.documentId}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-brand-teal">{article.Title}</h3>
                  <span className="text-sm text-gray-500">{article.Date}</span>
                </div>
                
                {article.Category && (
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {article.Category}
                    </span>
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    {article.Content[0]?.children[0]?.text ? 
                      `${article.Content[0].children[0].text.slice(0, 180)}...` :
                      'Click to read more...'
                    }
                  </p>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {article.Author && <span>By {article.Author}</span>}
                    {article.ReadingTime && <span>{article.ReadingTime}</span>}
                  </div>
                  <div className="inline-block text-blue-600 hover:text-blue-800 font-medium">
                    Read More
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tips;