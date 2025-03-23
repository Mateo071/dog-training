import React from 'react';
import { Link } from 'react-router-dom';
import { programs } from '../data/programs';

function Programs() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-8">Our Training Programs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {
          programs.map(program => (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className={`text-2xl font-semibold text-brand-${program.color} mb-4`}>{program.title}</h3>
                <p className="text-gray-600 mb-4">
                  {program.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </p>
                <Link 
                  to="/contact" 
                  className={`inline-block bg-brand-${program.color} text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors`}
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