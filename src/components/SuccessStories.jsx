import React from 'react';

function SuccessStories() {
  const stories = [
    // {
    //   id: 1,
    //   dogName: "Max",
    //   breed: "German Shepherd",
    //   image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=300&h=300",
    //   challenge: "Severe anxiety and leash reactivity",
    //   achievement: "Now confidently walks in busy areas and plays well with other dogs",
    //   duration: "8 weeks"
    // },
    {
      id: 1,
      dogName: "Tito",
      breed: "Pitbull Terrier",
      image: "src/assets/tito.jpg",
      challenge: "Severe anxiety and leash reactivity",
      achievement: "Walks freely off-leash, waits for orders before eating and crossing the street, and is relaxed around strangers.",
      duration: "8 weeks"
    },
    {
      id: 2,
      dogName: "Luna",
      breed: "Golden Retriever Puppy",
      image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=300&h=300",
      challenge: "Excessive jumping and mouthing",
      achievement: "Learned proper greetings and gentle play",
      duration: "6 weeks"
    },
    {
      id: 3,
      dogName: "Rocky",
      breed: "Pit Bull Mix",
      image: "https://images.unsplash.com/photo-1617895153857-82fe79adfcd4?auto=format&fit=crop&q=80&w=300&h=300",
      challenge: "Resource guarding and food aggression",
      achievement: "Now shares toys and eats calmly around others",
      duration: "12 weeks"
    }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map(story => (
            <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <img
                src={story.image}
                alt={`${story.dogName} the ${story.breed}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-blue-600">{story.dogName}</h3>
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
                    <span className="text-sm font-medium text-teal-600">{story.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SuccessStories;