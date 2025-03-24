import { useState, useEffect } from 'react';

function Testimonials() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/testimonials?populate=*', {
        method: 'GET',
        headers: {
          'Authorization': `BEARER ${import.meta.env.VITE_APP_STRAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      const sortedData = result.data.sort((a, b) => a.Order - b.Order);
      setData(sortedData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>
  };

  if (!data) {
    return <div>Loading...</div>
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map(testimonial => (
            <div key={testimonial.documentId} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.Photo.url}
                  alt={testimonial.Photo.alternativeText}
                  className="w-12 h-12 rounded-full mr-4"
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