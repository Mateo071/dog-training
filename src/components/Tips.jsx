import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { articles } from '../data/tipArticles';

const Tips = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/blogs', {
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
      const sortedDataByDate = result.data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      setData(sortedDataByDate);
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
    return <div></div>
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-8">Training Tips & Guides</h2>
      <div className="space-y-6">
        {
        data.map(article => (
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
                <div className="prose max-w-none">
                  <p className="text-gray-600">{`${article.Content[0].children[0].text.slice(0, 180)}...`}</p>
                </div>
                
                <div className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Read More
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tips