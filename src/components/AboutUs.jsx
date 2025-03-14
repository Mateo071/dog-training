import React from 'react';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-96 w-full object-cover md:w-96"
                src="parents.jpg"
                alt="Marcelo and Paty with their dogs"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-brand-blue font-semibold">Our Story</div>
              <h1 className="mt-2 text-4xl font-bold text-gray-900">Meet Marcelo & Paty</h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Welcome to Flores Dog Training, where our passion for dogs transforms into life-changing relationships between pets and their families.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-brand-blue">Marcelo's Journey</h2>
          <p className="text-gray-600 leading-relaxed">
            Marcelo's path to becoming a dog trainer began during Hurricane Milton, when he rescued a Pitbull Terrier puppy named Tito. This life-changing encounter sparked a deep passion for understanding dog behavior and training techniques. He is now a regular volunteer at the Humane Society at Lakewood Ranch.
          </p>
          <p className="text-gray-600 leading-relaxed">
            As a dedicated animal lover, Marcelo continuously stays at the forefront of animal behavioral science and nutrition. His commitment to learning ensures that our training methods are always based on the latest research and most effective techniques.
          </p>
          <div className="bg-brand-teal/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-brand-teal mb-3">Professional Development</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-brand-teal mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Certified Professional Dog Trainer
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-brand-teal mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Animal Behavior Specialist
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-brand-teal mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Canine Nutrition Expert
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-brand-teal">The Family Behind the Business</h2>
          <p className="text-gray-600 leading-relaxed">
            While Marcelo works directly with the dogs and their families, Paty plays a crucial role behind the scenes. Her organizational skills and attention to detail ensure that every aspect of Flores Dog Training runs smoothly.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Together, Marcelo and Paty have built more than just a business – they've created a community where dogs and their owners can learn, grow, and strengthen their bonds. Their personal experience with Tito has shaped their understanding of the transformative power of proper dog training.
          </p>
          <div className="bg-brand-blue/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-brand-blue mb-3">Our Mission</h3>
            <p className="text-gray-700">
              To enhance the lives of dogs and their families through education, understanding, and positive training methods. We believe every dog has the potential to be an amazing companion with the right guidance and support.
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