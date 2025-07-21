import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

function SuccessStory() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://natural-melody-8463e9c17b.strapiapp.com/api/success-stories/${id}?populate=*`, {
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
        const fetchedData = result.data;
        setData(fetchedData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>
  };

  if (!data) {
    return <div></div>
  };

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Story Not Found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link 
        to="/"
        className="text-brand-blue hover:text-blue-800 mb-8 inline-block"
      >
        ← Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="relative h-[400px]">
          <img
            src={data.Banner.url}
            alt={`${data.Name} the ${data.Breed}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.Name}'s Transformation Story
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Story</h2>
            <BlocksRenderer content={data.Content} />
          </div>
          {
            data?.Video && (
          <div className="aspect-w-16 aspect-h-9 mb-8">
            <iframe
              src={data.Video}
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
        </div>
      </div>
    </div>
  );
}

export default SuccessStory;