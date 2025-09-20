import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { programsContent } from '../../data/seoContent';

function Programs() {
  // Initialize with static SEO content for immediate rendering
  const [data, setData] = useState(
    programsContent.programs.map(program => ({
      id: program.id,
      documentId: program.id,
      Title: program.title,
      Content: program.description,
      Color: program.color,
      Price: program.price,
      Duration: program.duration,
      Features: program.features || [],
      Order: program.id
    }))
  );
  const [error, setError] = useState(null);
  const [_loading, setLoading] = useState(false); // Start as false since we have initial content

  const fetchData = async () => {
    try {
      // Get programs content from Supabase
      const { data: programsData, error: programsError } = await db.getWebsiteContentBySection('programs');
      
      if (programsError) throw programsError;
      
      if (programsData && programsData.length > 0) {
        // Transform the data to match the expected format
        const transformedData = programsData.map(program => {
          // Parse features from various data formats
          let features = [];
          try {
            if (program.fields?.features) {
              let featuresData = program.fields.features;
              
              if (Array.isArray(featuresData)) {
                features = featuresData;
              } else if (typeof featuresData === 'string') {
                features = JSON.parse(featuresData);
              } else if (typeof featuresData === 'object' && featuresData !== null) {
                // Handle case where Supabase returns features as an object
                const values = Object.values(featuresData);
                if (values.length === 0) {
                  // Empty object - fallback to static content
                  features = [];
                } else {
                  features = values;
                }
              }
              
              // Ensure features is an array of strings
              if (!Array.isArray(features)) {
                features = [];
              }
            }
            
            // Fallback: if features is still empty, use static content
            if (features.length === 0) {
              const staticProgram = programsContent.programs.find(p => p.title === program.fields?.program_title);
              if (staticProgram && staticProgram.features) {
                features = staticProgram.features;
              }
            }
          } catch (e) {
            console.warn('Failed to parse features for program:', program.id, e.message);
            // Fallback to static content
            const staticProgram = programsContent.programs.find(p => p.title === program.fields?.program_title);
            if (staticProgram && staticProgram.features) {
              features = staticProgram.features;
            } else {
              features = [];
            }
          }
          
          return {
            id: program.id,
            documentId: program.id,
            Title: program.fields?.program_title || '',
            Content: program.fields?.description || '',
            Color: program.fields?.color || '#2563eb', // Default to blue if no color
            Price: program.fields?.price || '',
            Duration: program.fields?.duration || '',
            Features: features,
            Order: program.sort_order || 0
          };
        });
        
        // Sort by order
        const sortedData = transformedData.sort((a, b) => a.Order - b.Order);
        setData(sortedData);
      } else {
        // Fallback to sample programs if no content found
        setData([
          {
            id: 1,
            documentId: 1,
            Title: 'Puppy Foundation Program',
            Content: 'Perfect for puppies 8-16 weeks old. This foundational program sets your puppy up for a lifetime of success through positive reinforcement training and early socialization in a supportive environment.',
            Color: '#10b981', // emerald-500
            Price: '$300',
            Duration: '6 weeks',
            Features: [
              'House training and crate training',
              'Basic commands (sit, stay, come)',
              'Socialization with dogs and people',
              'Bite inhibition training',
              'Leash walking basics'
            ],
            Order: 1
          },
          {
            id: 2,
            documentId: 2,
            Title: 'Basic Obedience Training',
            Content: 'Ideal for dogs 4 months and older. This comprehensive program builds the foundation for a well-behaved, responsive companion through structured training sessions and consistent positive reinforcement methods.',
            Color: '#3b82f6', // blue-500
            Price: '$400',
            Duration: '8 weeks',
            Features: [
              'Essential commands training',
              'Leash walking and heel training',
              'Door manners and greeting behavior',
              'Focus and attention exercises',
              'Real-world application practice'
            ],
            Order: 2
          },
          {
            id: 3,
            documentId: 3,
            Title: 'Advanced Training & Behavior Modification',
            Content: 'For dogs with specific behavioral challenges or those ready for advanced training. This specialized program uses a customized approach based on your dog\'s individual needs and comprehensive behavioral assessment.',
            Color: '#8b5cf6', // violet-500
            Price: '$500',
            Duration: '10 weeks',
            Features: [
              'Behavioral assessment and customized plan',
              'Reactivity and aggression management',
              'Anxiety and fear-based behavior modification',
              'Advanced obedience and impulse control',
              'Owner education and long-term support'
            ],
            Order: 3
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching programs data:', err);
      setError(err.message);
      
      // Fallback to sample programs on error - use seoContent data
      setData(
        programsContent.programs.map(program => ({
          id: program.id,
          documentId: program.id,
          Title: program.title,
          Content: program.description,
          Color: program.color,
          Price: program.price,
          Duration: program.duration,
          Features: program.features || [],
          Order: program.id
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert hex color to CSS color
  const getColorStyles = (colorValue) => {
    // If it's a hex color, use it directly
    if (colorValue && colorValue.startsWith('#')) {
      return {
        color: colorValue,
        backgroundColor: colorValue,
        '--hover-color': colorValue + '99' // Add alpha for hover
      };
    }
    
    // Fallback to default blue
    return {
      color: '#3b82f6',
      backgroundColor: '#3b82f6',
      '--hover-color': '#3b82f699'
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Remove loading state since we render static content immediately

  if (error && !data) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 text-red-600">
          Error loading programs. Please try again later.
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 text-gray-600">
          No training programs available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {data.map(program => {
          const colorStyles = getColorStyles(program.Color);
          
          return (
            <div key={program.documentId} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 
                  className="text-2xl font-semibold mb-4" 
                  style={{ color: colorStyles.color }}
                >
                  {program.Title}
                </h3>
                
                <div 
                  className="text-gray-700 mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: program.Content
                      .replace(/\n/g, '<br />')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }}
                />
                
                {/* Features List */}
                {program.Features && program.Features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {program.Features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <svg 
                            className="w-5 h-5 mr-3 flex-shrink-0" 
                            style={{ color: colorStyles.color }}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(program.Price || program.Duration) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    {program.Price && (
                      <div className="flex items-center">
                        <span className="font-medium">Price:</span>
                        <span className="ml-1">{program.Price}</span>
                      </div>
                    )}
                    {program.Duration && (
                      <div className="flex items-center">
                        <span className="font-medium">Duration:</span>
                        <span className="ml-1">{program.Duration}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <Link 
                  to="/contact" 
                  className="inline-block text-white px-6 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: colorStyles.backgroundColor,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colorStyles['--hover-color'];
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colorStyles.backgroundColor;
                  }}
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Programs;