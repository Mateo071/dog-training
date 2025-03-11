import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/tipArticles';

function Tips() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-8">Training Tips & Guides</h2>
      
      <div className="space-y-6">
        {articles.map(article => (
          <div 
            key={article.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-blue-600">{article.title}</h3>
                <span className="text-sm text-gray-500">{article.date}</span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-600">{article.preview}</p>
              </div>
              
              <Link 
                to={`/tips/${article.id}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tips