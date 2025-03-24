import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SuccessStories({ limit }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [displayedStories, setDisplayedStories] = useState(null);
  
  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/success-stories?populate=*');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      const fetchedData = result.data;
      setData(fetchedData);
      setDisplayedStories(limit ? fetchedData.slice(0, limit) : fetchedData);
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