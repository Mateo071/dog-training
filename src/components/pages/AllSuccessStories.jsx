import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessStories from './SuccessStories';
import { successStoriesContent } from '../../data/seoContent';

function AllSuccessStories() {
  const navigate = useNavigate();

  return (
    <div className="py-12">
      {/* Hidden SEO content for search engines */}
      <div className="sr-only">
        <h1>Dog Training Success Stories - Real Results</h1>
        <p>{successStoriesContent.seo.description}</p>
        {successStoriesContent.stories.map(story => (
          <div key={story.id}>
            <h2>{story.title}</h2>
            <p>Dog: {story.dogName} ({story.breed})</p>
            <p>Problem: {story.problem}</p>
            <p>Solution: {story.solution}</p>
            <p>Result: {story.result}</p>
            <p>Duration: {story.duration}</p>
            <p>Testimonial: {story.testimonial}</p>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-brand-blue hover:text-blue-800 mb-8 inline-block cursor-pointer"
        >
          ← Back
        </button>
        <SuccessStories />
      </div>
    </div>
  );
}

export default AllSuccessStories;