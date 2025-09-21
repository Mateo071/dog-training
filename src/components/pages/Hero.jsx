import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';

function Hero() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Get hero content from Supabase
      const { data: heroData, error: heroError } = await db.getWebsiteSingleContent('hero');
      
      if (heroError) throw heroError;
      
      if (heroData && heroData.length > 0) {
        const hero = heroData[0];
        
        // Transform the fields data to match the expected format
        // Construct the proper Supabase storage URL for the hero background image
        let backgroundImageUrl;
        if (hero.fields?.background_image && hero.fields.background_image.startsWith('http')) {
          backgroundImageUrl = hero.fields.background_image;
        } else if (hero.fields?.background_image) {
          // Get the filename from the background_image field
          const fileName = hero.fields.background_image.split('/').pop();
          
          // Get the public URL from Supabase storage
          const urlResult = await db.getPublicMediaUrl('hero', fileName);
          backgroundImageUrl = urlResult.data?.publicUrl || urlResult.publicUrl || `/default-hero-bg.jpg`;
        } else {
          // No background image configured - use default
          backgroundImageUrl = '/default-hero-bg.jpg';
        }
          
        const transformedData = {
          Heading: hero.fields?.heading || 'Welcome to Flores Dog Training',
          Subheading: hero.fields?.subheading || 'Professional dog training services',
          HeadingColor: hero.fields?.heading_color || '#ffffff',
          SubheadingColor: hero.fields?.subheading_color || '#ffffff',
          Background: {
            formats: {
              large: {
                url: backgroundImageUrl
              }
            }
          }
        };
        
        setData(transformedData);
      } else {
        // Fallback to default data if no content found
        
        setData({
          Heading: 'Welcome to Flores Dog Training',
          Subheading: 'Professional dog training services that create lasting bonds',
          HeadingColor: '#ffffff',
          SubheadingColor: '#ffffff',
          Background: {
            formats: {
              large: {
                url: '/default-hero-bg.jpg'
              }
            }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching hero data:', err);
      setError(err.message);
      
      // Fallback to default data on error - use fallback URL directly to avoid more errors
      setData({
        Heading: 'Welcome to Flores Dog Training',
        Subheading: 'Professional dog training services that create lasting bonds',
        HeadingColor: 'white',
        SubheadingColor: 'white',
        Background: {
          formats: {
            large: {
              url: '/default-hero-bg.jpg'
            }
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Flores Dog Training</h1>
          <p className="text-xl">Professional dog training services</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.Background?.formats?.large?.url})`
      }}
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6" style={{ color: data.HeadingColor }}>
          {data.Heading}
        </h1>
        <p className="text-xl mb-8" style={{ color: data.SubheadingColor }}>
          {data.Subheading}
        </p>
        <Link 
          to="/programs" 
          className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Explore Our Programs
        </Link>
      </div>
    </div>
  );
}

export default Hero;