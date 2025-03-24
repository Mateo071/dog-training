import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

function AboutUs() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/About-Us?populate=*');
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
    <div className="max-w-6xl mx-auto py-12">
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-96 w-full object-cover md:w-96"
                src={data.Image.formats.medium.url}
                alt="Marcelo and Paty with their dogs"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-brand-blue font-semibold">Our Story</div>
              <h1 className="mt-2 text-4xl font-bold text-gray-900">{data.MainHeading}</h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {data.Subheading}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-brand-blue">{data.LeftHeading}</h2>
          <div className="text-gray-600 leading-relaxed">
            <BlocksRenderer content={data.LeftContent} />
          </div>
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
              ))
              }
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-brand-teal">{data.RightHeading}</h2>
          <div className="text-gray-600 leading-relaxed">
            <BlocksRenderer content={data.RightContent} />
          </div>
          <div className="bg-brand-blue/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-brand-blue mb-3">Our Mission</h3>
            <p className="text-gray-700">
              {data.Mission}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-lg shadow-xl p-8 text-white">
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