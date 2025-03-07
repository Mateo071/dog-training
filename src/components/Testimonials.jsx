import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "San Diego, CA",
      text: "The transformation in my German Shepherd's behavior is incredible. The trainers at Flores are true professionals who really understand dogs.",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "La Jolla, CA",
      text: "Our puppy went from uncontrollable to well-behaved in just a few weeks. The positive training methods really work!",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Chula Vista, CA",
      text: "I was amazed by how quickly my dog responded to the training. The personalized approach made all the difference.",
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;