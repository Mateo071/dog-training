import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { successStoriesContent } from '../../data/seoContent';
import SEO from './SEO';

function SuccessStory() {
  const { id } = useParams(); // This could be either numeric ID or slug
  const navigate = useNavigate();
  
  // Find story by slug or ID
  const staticStory = successStoriesContent.stories.find(story => 
    story.slug === id || story.id.toString() === id
  );
  
  // Initialize with static content if found
  const [data, setData] = useState(staticStory ? {
    Name: staticStory.dogName,
    Breed: staticStory.breed,
    Banner: { url: '/default-dog-image.jpg' },
    Challenge: staticStory.challenge,
    Achievement: staticStory.achievement,
    Duration: staticStory.duration,
    videoUrl: null,
    fullStory: staticStory.fullStory,
    title: staticStory.title
  } : null);
  
  const [error, setError] = useState(null);

  // SEO data for current story
  const seoData = staticStory ? {
    title: `${staticStory.title} - Dog Training Success Story`,
    description: `${staticStory.dogName}, a ${staticStory.breed}, overcame ${staticStory.challenge.toLowerCase()} through professional dog training. Read about their transformation and achievement: ${staticStory.achievement}`,
    keywords: `${staticStory.dogName} dog training, ${staticStory.breed} training, ${staticStory.challenge.toLowerCase()}, dog training success story, professional dog trainer`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": staticStory.title,
      "description": `Success story of ${staticStory.dogName}, a ${staticStory.breed} who achieved: ${staticStory.achievement}`,
      "author": {
        "@type": "Organization",
        "name": "Flores Dog Training"
      },
      "publisher": {
        "@type": "Organization", 
        "name": "Flores Dog Training"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    }
  } : {
    title: "Dog Training Success Story",
    description: "Read about an amazing dog training transformation story.",
    keywords: "dog training success story",
    robots: "noindex, nofollow"
  };
  
  useEffect(() => {
    // Only try to fetch from Supabase if we don't have static content
    if (!staticStory) {
      const loadData = async () => {
        try {
          // Get single success story by ID from Supabase
          const { data: storyData, error: storyError } = await db.getWebsiteContentById(id);
          
          if (storyError) throw storyError;
          
          if (storyData) {
            // Transform fields array to object for easier access
            const fields = {};
            if (storyData.website_content_fields) {
              storyData.website_content_fields.forEach(field => {
                fields[field.field_key] = field.field_value;
              });
            }
            
            let imageUrl = '/default-dog-image.jpg';
            
            if (fields.image) {
              if (fields.image.startsWith('http')) {
                imageUrl = fields.image;
              } else {
                // Get the filename from the image field
                const fileName = fields.image.split('/').pop();
                
                // Get the public URL from Supabase storage
                const urlResult = await db.getPublicMediaUrl('success_stories', fileName);
                imageUrl = urlResult.data?.publicUrl || urlResult.publicUrl || '/default-dog-image.jpg';
              }
            }
            
            const transformedData = {
              Name: fields.dog_name || '',
              Breed: fields.breed || '',
              Banner: {
                url: imageUrl
              },
              Challenge: fields.challenge || '',
              Achievement: fields.achievement || '',
              Duration: fields.duration || '',
              videoUrl: fields.video_url || null,
              fullStory: fields.story_content || fields.challenge || '',
              title: `${fields.dog_name || 'Dog'} the ${fields.breed || 'Dog'}`
            };
            
            setData(transformedData);
          }
        } catch (err) {
          console.error('Error loading success story:', err);
          setError(err.message);
        }
      };

      loadData();
    }
  }, [id, staticStory]);

  if (error && !staticStory) {
    return (
      <>
        <SEO 
          title="Success Story Error"
          description="There was an error loading this success story."
          robots="noindex, nofollow"
        />
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="text-red-600">Error loading success story: {error}</div>
          <Link to="/success-stories" className="text-brand-blue hover:text-blue-800 mt-4 inline-block">
            ← Back to Success Stories
          </Link>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <SEO 
          title="Success Story Not Found"
          description="The requested dog training success story could not be found."
          robots="noindex, nofollow"
        />
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Story Not Found</h2>
          <p className="text-gray-600 mb-4">The success story you're looking for doesn't exist.</p>
          <Link to="/success-stories" className="text-brand-blue hover:text-blue-800">
            ← Back to Success Stories
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO {...seoData} />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-brand-blue hover:text-blue-800 mb-8 inline-block cursor-pointer"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="relative h-[400px]">
            <img
              src={data.Banner.url}
              alt={`${data.Name} the ${data.Breed}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-dog-image.jpg';
              }}
            />
          </div>
          
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data.title || `${data.Name}'s Transformation Story`}
              </h1>
              <p className="text-xl text-gray-600">{data.Breed}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">The Challenge</h3>
                <p className="text-gray-600">{data.Challenge}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">The Achievement</h3>
                <p className="text-gray-600">{data.Achievement}</p>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <div 
                className="text-gray-700 story-content"
                dangerouslySetInnerHTML={{ 
                  __html: data.fullStory
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^(.*)$/g, '<p>$1</p>')
                    .replace(/<p><\/p>/g, '')
                }}
              />
            </div>
            
            <style>{`
              .story-content h3 {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                line-height: 1.4 !important;
                margin: 1.6em 0 0.8em 0 !important;
                color: #111827 !important;
              }
              
              .story-content h1 {
                font-size: 1.875rem !important;
                font-weight: 800 !important;
                line-height: 1.1111111 !important;
                margin: 2em 0 1em 0 !important;
                color: #111827 !important;
              }
              
              .story-content h2 {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                line-height: 1.3333333 !important;
                margin: 2em 0 1em 0 !important;
                color: #111827 !important;
              }
              
              .story-content p {
                margin: 1.25em 0 !important;
                line-height: 1.75 !important;
                color: #374151 !important;
              }
              
              .story-content ul,
              .story-content ol {
                margin: 1.25em 0 !important;
                padding-left: 1.625em !important;
              }
              
              .story-content li {
                margin: 0.5em 0 !important;
                padding-left: 0.375em !important;
                line-height: 1.75 !important;
                color: #374151 !important;
              }
            `}</style>

            {data?.videoUrl && (
              <div className="aspect-w-16 aspect-h-9 mb-8">
                <iframe
                  src={data.videoUrl}
                  title={`${data.Name}'s Training Journey`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[400px] rounded-lg"
                ></iframe>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <span className="text-gray-600">Training Duration:</span>
              <span className="font-medium text-brand-teal">{data.Duration}</span>
            </div>

            <div className="mt-8 text-center">
              <Link 
                to="/contact" 
                className="inline-block bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Dog's Transformation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuccessStory;