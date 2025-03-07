import React from 'react';
import { Link } from 'react-router-dom';

function Programs() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-8">Our Training Programs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Puppy Training</h3>
            <p className="text-gray-600 mb-4">
              Start your puppy's journey on the right paw! Our specialized puppy training program focuses on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Basic obedience and commands</li>
              <li>Socialization skills</li>
              <li>Potty training guidance</li>
              <li>Bite inhibition</li>
              <li>Proper leash manners</li>
            </ul>
            <Link 
              to="/contact" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-teal-600 mb-4">Adult Dog Training</h3>
            <p className="text-gray-600 mb-4">
              It's never too late to teach your dog new tricks! Our adult dog training program includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Advanced obedience training</li>
              <li>Behavior modification</li>
              <li>Problem-solving techniques</li>
              <li>Off-leash reliability</li>
              <li>Real-world applications</li>
            </ul>
            <Link 
              to="/contact" 
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Start Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Programs;