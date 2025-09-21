import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';

function SuccessStories({ limit }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [displayedStories, setDisplayedStories] = useState(null);
  
  const loadData = useCallback(async () => {
    try {
      // Get success stories content from Supabase
      const { data: successStoriesData, error: successStoriesError } = await db.getWebsiteContentBySection('success_stories');
      
      if (successStoriesError) throw successStoriesError;
      
      if (successStoriesData && successStoriesData.length > 0) {
        // Transform the data to match the expected format
        const transformedData = await Promise.all(successStoriesData.map(async (story) => {
          let imageUrl = '/default-dog-image.jpg';
          
          if (story.fields?.image) {
            if (story.fields.image.startsWith('http')) {
              imageUrl = story.fields.image;
            } else {
              // Get the filename from the image field
              const fileName = story.fields.image.split('/').pop();
              
              // Get the public URL from Supabase storage
              const urlResult = await db.getPublicMediaUrl('success_stories', fileName);
              imageUrl = urlResult.data?.publicUrl || urlResult.publicUrl || '/default-dog-image.jpg';
            }
          }
          
          return {
            documentId: story.id,
            Name: story.fields?.dog_name || '',
            Breed: story.fields?.breed || '',
            Banner: {
              url: imageUrl
            },
            Challenge: story.fields?.challenge || '',
            Achievement: story.fields?.achievement || '',
            Duration: story.fields?.duration || '',
            Order: story.sort_order || 0,
            videoUrl: story.fields?.video_url || null,
            fullStory: story.fields?.story_content || story.fields?.challenge || ''
          };
        }));
        
        // Sort by order
        const sortedData = transformedData.sort((a, b) => a.Order - b.Order);
        setData(sortedData);
        setDisplayedStories(limit ? sortedData.slice(0, limit) : sortedData);
      } else {
        // No data available
        setData([]);
        setDisplayedStories([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [limit]);

  useEffect(() => {
    loadData();
  }, [limit, loadData]);

  if (error) {
    return <div>Error: {error}</div>
  };

  if (!data) {
    return <div></div>
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
          <h2 className="relative text-3xl font-bold text-center py-4">Success Stories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedStories.map(story => (
            <Link
              key={story.documentId}
              to={`/success-stories/${story.documentId}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            >
              <div className="relative h-0 pb-[100%]">
                <img
                  src={story.Banner.url}
                  alt={`${story.Name} the ${story.Breed}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-brand-blue">{story.Name}</h3>
                  <span className="text-sm font-medium text-gray-500">{story.Breed}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">Challenge:</h4>
                    <p className="text-gray-700">{story.Challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">Achievement:</h4>
                    <p className="text-gray-700">{story.Achievement}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Training Duration:</span>
                    <span className="text-sm font-medium text-brand-teal">{story.Duration}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {limit && (
          <div className="text-center mt-8">
            <Link
              to="/success-stories"
              className="inline-block text-brand-teal px-6 py-3 text-lg font-semibold hover:text-brand-teal-dark transition-colors"
            >
              View More Success Stories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default SuccessStories;