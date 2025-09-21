import { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';

function Testimonials() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Get testimonials content from Supabase
      const { data: testimonialsData, error: testimonialsError } = await db.getWebsiteContentBySection('testimonials');
      
      if (testimonialsError) throw testimonialsError;
      
      if (testimonialsData && testimonialsData.length > 0) {
        // Transform the data to match the expected format
        const transformedData = await Promise.all(testimonialsData.map(async (testimonial) => {
          let photoUrl = 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200';
          
          if (testimonial.fields?.photo) {
            if (testimonial.fields.photo.startsWith('http')) {
              photoUrl = testimonial.fields.photo;
            } else {
              // Get the filename from the photo field
              const fileName = testimonial.fields.photo.split('/').pop();
              
              // Get the public URL from Supabase storage
              const urlResult = await db.getPublicMediaUrl('testimonials', fileName);
              photoUrl = urlResult.data?.publicUrl || urlResult.publicUrl || 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200';
            }
          }
          
          return {
            id: testimonial.id,
            Name: testimonial.fields?.client_name || '',
            Location: testimonial.fields?.location || '',
            Quote: testimonial.fields?.testimonial_text || '',
            Photo: {
              url: photoUrl,
              alternativeText: `${testimonial.fields?.client_name || 'Client'} photo`
            },
            Order: testimonial.sort_order || 0
          };
        }));
        
        // Sort by order
        const sortedData = transformedData.sort((a, b) => a.Order - b.Order);
        setData(sortedData);
      } else {
        // Fallback to sample testimonials if no content found
        setData([
          {
            id: 1,
            Name: 'Sarah Johnson',
            Location: 'San Diego, CA',
            Quote: 'Flores Dog Training transformed our reactive rescue dog into a calm, confident companion. The results exceeded our expectations!',
            Photo: {
              url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
              alternativeText: 'Sarah Johnson photo'
            },
            Order: 1
          },
          {
            id: 2,
            Name: 'Mike Rodriguez',
            Location: 'La Jolla, CA',
            Quote: 'Professional, knowledgeable, and patient. Our puppy learned basic commands and proper socialization skills quickly.',
            Photo: {
              url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
              alternativeText: 'Mike Rodriguez photo'
            },
            Order: 2
          },
          {
            id: 3,
            Name: 'Jessica Chen',
            Location: 'Pacific Beach, CA',
            Quote: 'The personalized training approach made all the difference. Highly recommend for any dog behavior challenges!',
            Photo: {
              url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
              alternativeText: 'Jessica Chen photo'
            },
            Order: 3
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching testimonials data:', err);
      setError(err.message);
      
      // Fallback to sample testimonials on error
      setData([
        {
          id: 1,
          Name: 'Sarah Johnson',
          Location: 'San Diego, CA',
          Quote: 'Flores Dog Training transformed our reactive rescue dog into a calm, confident companion. The results exceeded our expectations!',
          Photo: {
            url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
            alternativeText: 'Sarah Johnson photo'
          },
          Order: 1
        },
        {
          id: 2,
          Name: 'Mike Rodriguez',
          Location: 'La Jolla, CA',
          Quote: 'Professional, knowledgeable, and patient. Our puppy learned basic commands and proper socialization skills quickly.',
          Photo: {
            url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
            alternativeText: 'Mike Rodriguez photo'
          },
          Order: 2
        },
        {
          id: 3,
          Name: 'Jessica Chen',
          Location: 'Pacific Beach, CA',
          Quote: 'The personalized training approach made all the difference. Highly recommend for any dog behavior challenges!',
          Photo: {
            url: 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200',
            alternativeText: 'Jessica Chen photo'
          },
          Order: 3
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
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="text-center text-red-600">
            Error loading testimonials. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="text-center text-gray-600">
            No testimonials available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map(testimonial => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.Photo.url}
                  alt={testimonial.Photo.alternativeText}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Client&background=0f172a&color=fff&size=200';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.Name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.Location}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.Quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;