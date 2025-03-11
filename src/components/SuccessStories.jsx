import React from 'react';
import { Link } from 'react-router-dom';
import { successStories } from '../data/successStories';

function SuccessStories({ limit }) {
  const displayedStories = limit ? successStories.slice(0, limit) : successStories;

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
              key={story.id}
              to={`/success-stories/${story.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            >
              <div className="relative h-0 pb-[100%]">
                <img
                  src={story.image}
                  alt={`${story.dogName} the ${story.breed}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-brand-blue">{story.dogName}</h3>
                  <span className="text-sm font-medium text-gray-500">{story.breed}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">Challenge:</h4>
                    <p className="text-gray-700">{story.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">Achievement:</h4>
                    <p className="text-gray-700">{story.achievement}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Training Duration:</span>
                    <span className="text-sm font-medium text-brand-teal">{story.duration}</span>
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