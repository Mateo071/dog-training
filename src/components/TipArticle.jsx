import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../data/tipArticles';

function TipArticle() {
  const { id } = useParams();
  const article = articles.find(a => a.id === parseInt(id));

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
        <Link to="/tips" className="text-brand-blue hover:text-blue-800">
          Return to Tips
        </Link>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
            <span className="text-gray-500">{article.date}</span>
          </div>

          <div className="prose max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
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