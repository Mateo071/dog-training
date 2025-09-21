import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { aboutUsContent } from '../../data/seoContent';

function AboutUs() {
  const navigate = useNavigate();
  // Initialize with static SEO content for immediate rendering
  const [data, setData] = useState({
    Image: {
      formats: {
        medium: {
          url: '/default-about-hero.jpg'
        }
      }
    },
    MainHeading: aboutUsContent.mainHeading,
    Subheading: aboutUsContent.subheading,
    LeftHeading: aboutUsContent.leftSection.heading,
    LeftContent: aboutUsContent.leftSection.content,
    LeftBlockHeading: aboutUsContent.professionalDevelopment.heading,
    LeftBlockContents: aboutUsContent.professionalDevelopment.bulletPoints.map((bullet, index) => ({
      documentId: index + 1,
      Bullet: bullet
    })),
    RightHeading: aboutUsContent.rightSection.heading,
    RightContent: aboutUsContent.rightSection.content,
    Mission: aboutUsContent.mission.content
  });
  const [error, setError] = useState(null);
  const [_loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Track content updates
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchData = async () => {
    setIsUpdating(true);
    try {
      // Get about_us content from Supabase
      const { data: aboutData, error: aboutError } = await db.getWebsiteSingleContent('about_us');
      
      if (aboutError) throw aboutError;
      
      if (aboutData && aboutData.length > 0) {
        const about = aboutData[0];
        
        // Get hero image URL
        let heroImageUrl = '/default-about-hero.jpg';
        if (about.fields?.hero_image) {
          if (about.fields.hero_image.startsWith('http')) {
            heroImageUrl = about.fields.hero_image;
          } else {
            // Get the filename from the hero_image field
            const fileName = about.fields.hero_image.split('/').pop();
            
            // Get the public URL from Supabase storage
            const urlResult = await db.getPublicMediaUrl('about_us', fileName);
            heroImageUrl = urlResult.data?.publicUrl || urlResult.publicUrl || '/default-about-hero.jpg';
          }
        }
        
        // Transform bullet points from rich text to array
        let bulletPoints = [];
        if (about.fields?.left_block_bullets) {
          bulletPoints = about.fields.left_block_bullets
            .split('\n')
            .filter(bullet => bullet.trim())
            .map(bullet => bullet.trim());
        }
        
        // Transform the fields data to match the expected format
        const transformedData = {
          Image: {
            formats: {
              medium: {
                url: heroImageUrl
              }
            }
          },
          MainHeading: about.fields?.main_heading || 'About Flores Dog Training',
          Subheading: about.fields?.subheading || 'Professional dog training services',
          LeftHeading: about.fields?.left_heading || 'Our Story',
          LeftContent: about.fields?.left_content || 'We are passionate about helping dogs and their owners build stronger relationships.',
          LeftBlockHeading: about.fields?.left_block_heading || 'Our Approach',
          LeftBlockContents: bulletPoints.map((bullet, index) => ({
            documentId: index + 1,
            Bullet: bullet
          })),
          RightHeading: about.fields?.right_heading || 'Our Experience',
          RightContent: about.fields?.right_content || 'Years of experience helping dogs and families.',
          Mission: about.fields?.mission || 'To create lasting bonds between dogs and their families through effective, compassionate training.'
        };
        
        // Use setTimeout to create smooth transition
        setTimeout(() => {
          setData(transformedData);
        }, 100);
      } else {
        // Fallback to default data if no content found
        setData({
          Image: {
            formats: {
              medium: {
                url: '/default-about-hero.jpg'
              }
            }
          },
          MainHeading: 'About Flores Dog Training',
          Subheading: 'Professional dog training services that create lasting bonds between you and your furry family member.',
          LeftHeading: 'Our Story',
          LeftContent: 'At Flores Dog Training, we believe every dog has the potential to be a well-behaved, happy companion. Our personalized approach focuses on positive reinforcement and building trust.',
          LeftBlockHeading: 'Our Approach',
          LeftBlockContents: [
            { documentId: 1, Bullet: 'Positive reinforcement training methods' },
            { documentId: 2, Bullet: 'Customized training programs for each dog' },
            { documentId: 3, Bullet: 'Focus on building trust and communication' },
            { documentId: 4, Bullet: 'Ongoing support for dog owners' }
          ],
          RightHeading: 'Our Experience',
          RightContent: 'With years of experience training dogs of all breeds, ages, and temperaments, we understand that every dog is unique. Our proven methods help address behavioral challenges while strengthening the bond between dogs and their families.',
          Mission: 'To create lasting bonds between dogs and their families through effective, compassionate training that builds confidence, trust, and mutual respect.'
        });
      }
    } catch (err) {
      console.error('Error fetching about us data:', err);
      setError(err.message);
      
      // Fallback to default data on error
      setData({
        Image: {
          formats: {
            medium: {
              url: '/default-about-hero.jpg'
            }
          }
        },
        MainHeading: 'About Flores Dog Training',
        Subheading: 'Professional dog training services that create lasting bonds between you and your furry family member.',
        LeftHeading: 'Our Story',
        LeftContent: 'At Flores Dog Training, we believe every dog has the potential to be a well-behaved, happy companion. Our personalized approach focuses on positive reinforcement and building trust.',
        LeftBlockHeading: 'Our Approach',
        LeftBlockContents: [
          { documentId: 1, Bullet: 'Positive reinforcement training methods' },
          { documentId: 2, Bullet: 'Customized training programs for each dog' },
          { documentId: 3, Bullet: 'Focus on building trust and communication' },
          { documentId: 4, Bullet: 'Ongoing support for dog owners' }
        ],
        RightHeading: 'Our Experience',
        RightContent: 'With years of experience training dogs of all breeds, ages, and temperaments, we understand that every dog is unique. Our proven methods help address behavioral challenges while strengthening the bond between dogs and their families.',
        Mission: 'To create lasting bonds between dogs and their families through effective, compassionate training that builds confidence, trust, and mutual respect.'
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsUpdating(false);
      }, 200); // Allow content transition to complete
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Remove loading state since we render static content immediately

  if (error && !data) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center text-red-600">
          Error loading about us content. Please try again later.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center text-gray-600">
          About us content not available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto py-12 transition-opacity duration-300 ${isUpdating ? 'opacity-95' : 'opacity-100'}`}>
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 relative">
              {!imageLoaded && (
                <div className="absolute inset-0 h-96 w-full md:w-96 bg-gray-200 animate-pulse">
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <img
                className={`h-96 w-full object-cover md:w-96 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                src={data.Image.formats.medium.url}
                alt="About Flores Dog Training"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = '/default-about-hero.jpg';
                  setImageLoaded(true);
                }}
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-brand-blue font-semibold">{aboutUsContent.intro}</div>
              <h1 className="mt-2 text-4xl font-bold text-gray-900">{data.MainHeading}</h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {data.Subheading}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16 transition-all duration-500 ease-in-out">
        <div className="space-y-6 transition-all duration-500 ease-in-out">
          <h2 className="text-3xl font-bold text-brand-blue transition-all duration-300">{data.LeftHeading}</h2>
          <div 
            className="text-gray-600 leading-relaxed transition-all duration-300"
            dangerouslySetInnerHTML={{ 
              __html: data.LeftContent
                .replace(/\n/g, '<br />')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
            }}
          />
          {data.LeftBlockHeading && data.LeftBlockContents.length > 0 && (
            <div className="bg-brand-teal/10 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-semibold text-brand-teal mb-3">{data.LeftBlockHeading}</h3>
              <ul className="space-y-2 text-gray-700">
                {data.LeftBlockContents.map(content => (
                  <li key={content.documentId} className="flex items-center">
                    <svg className="w-5 h-5 text-brand-teal mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {content.Bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6 transition-all duration-500 ease-in-out">
          <h2 className="text-3xl font-bold text-brand-teal transition-all duration-300">{data.RightHeading}</h2>
          <div 
            className="text-gray-600 leading-relaxed transition-all duration-300"
            dangerouslySetInnerHTML={{ 
              __html: data.RightContent
                .replace(/\n/g, '<br />')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
            }}
          />
          <div className="bg-brand-blue/10 rounded-lg p-6 mt-6 transition-all duration-300">
            <h3 className="text-xl font-semibold text-brand-blue mb-3 transition-all duration-300">Our Mission</h3>
            <div 
              className="text-gray-700 transition-all duration-300"
              dangerouslySetInnerHTML={{ 
                __html: data.Mission
                  .replace(/\n/g, '<br />')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-lg shadow-xl p-8 text-white transition-all duration-300">
        <h2 className="text-3xl font-bold mb-4">Start Your Journey With Us</h2>
        <p className="text-lg mb-6">
          Let us help you build a stronger, happier relationship with your dog. Contact us today to learn more about our training programs.
        </p>
        <button 
          onClick={() => navigate('/contact')}
          className="bg-white text-brand-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default AboutUs;