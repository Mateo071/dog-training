import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { programs } from '../data/programs';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

function Programs() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/programs', {
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
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-8">Our Training Programs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {
          data.map(program => (
            <div key={program.documentId} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className={`text-2xl font-semibold text-brand-${program.Color} mb-4`}>{program.Title}</h3>
                  <BlocksRenderer content={program.Content} />
                <Link 
                  to="/contact" 
                  className={`inline-block bg-brand-${program.Color} text-white px-6 py-2 rounded-md hover:bg-brand-${program.Color}-light transition-colors`}
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Programs;