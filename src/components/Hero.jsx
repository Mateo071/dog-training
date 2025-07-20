import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/Hero?populate=*', {
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
    <div 
    className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-cover bg-center bg-fixed"
    style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.Background?.formats?.large?.url})`
    }}
  >
    <div className={`text-center max-w-4xl mx-auto px-4`}>
      <h1 className={`text-5xl text-${data.HeadingColor} font-bold mb-6`}>{data.Heading}</h1>
      <p className={`text-xl text-${data.SubheadingColor} mb-8`}>{data.Subheading}</p>
      <Link 
        to="/programs" 
        className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
      >
        Explore Our Programs
      </Link>
    </div>
  </div>
  )
}

export default Hero;