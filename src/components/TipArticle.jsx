import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

function TipArticle() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://natural-melody-8463e9c17b.strapiapp.com/api/blogs/${id}`, {
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
        setData(result.data);
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
    return (
    <>
      <div>Loading...</div>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
        <Link to="/tips" className="text-brand-blue hover:text-blue-800">
          Return to Tips
        </Link>
      </div>
    </>
    )
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <Link 
            to="/tips"
            className="text-brand-blue hover:text-blue-800 mb-6 inline-block"
          >
            ← Back to Tips
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.Title}</h1>
            <span className="text-gray-500">{data.Date}</span>
          </div>

          <div className="prose max-w-none">
            <BlocksRenderer content={data.Content} />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">Share this article:</p>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TipArticle