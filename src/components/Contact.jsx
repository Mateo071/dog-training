import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    media: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      media: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  // return (
  //   <div className="max-w-2xl mx-auto py-8">
  //     <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
  //     <form onSubmit={handleSubmit} className="space-y-6">
  //       <div>
  //         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
  //         <input
  //           type="text"
  //           id="name"
  //           name="name"
  //           value={formData.name}
  //           onChange={handleChange}
  //           required
  //           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  //         />
  //       </div>

  //       <div>
  //         <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number:</label>
  //         <input
  //           type="tel"
  //           id="phone"
  //           name="phone"
  //           value={formData.phone}
  //           onChange={handleChange}
  //           required
  //           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  //         />
  //       </div>

  //       <div>
  //         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
  //         <input
  //           type="email"
  //           id="email"
  //           name="email"
  //           value={formData.email}
  //           onChange={handleChange}
  //           required
  //           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  //         />
  //       </div>

  //       <div>
  //         <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
  //         <textarea
  //           id="message"
  //           name="message"
  //           value={formData.message}
  //           onChange={handleChange}
  //           required
  //           rows="4"
  //           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  //         />
  //       </div>

  //       <div>
  //         <label htmlFor="media" className="block text-sm font-medium text-gray-700">Upload Media:</label>
  //         <input
  //           type="file"
  //           id="media"
  //           name="media"
  //           onChange={handleFileChange}
  //           accept="image/*,video/*"
  //           className="mt-1 block w-full text-sm text-gray-500
  //             file:mr-4 file:py-2 file:px-4
  //             file:rounded-md file:border-0
  //             file:text-sm file:font-semibold
  //             file:bg-blue-50 file:text-blue-700
  //             hover:file:bg-blue-100"
  //         />
  //       </div>

  //       <button
  //         type="submit"
  //         className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  //       >
  //         Send Message
  //       </button>
  //     </form>
  //   </div>
  // );
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg transform -skew-y-2"></div>
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-brand-blue font-semibold">Get in Touch</div>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Contact Us</h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Have questions about our training programs? We're here to help you and your furry friend on your journey to better behavior.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-brand-teal/10 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-blue">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 transition-colors bg-white"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand-blue">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring focus:ring-brand-teal/20 transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-blue">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 transition-colors bg-white"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-blue">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring focus:ring-brand-teal/20 transition-colors bg-white"
              />
            </div>

            <div>
              <label htmlFor="media" className="block text-sm font-medium text-brand-blue">Upload Media:</label>
              <input
                type="file"
                id="media"
                name="media"
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-white file:text-brand-blue
                  hover:file:bg-gray-50
                  transition-colors"
              />
            </div>

            <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-lg p-1 mt-8">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-blue to-brand-teal text-white py-3 px-6 rounded-md hover:bg-gradient-to-r hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-brand-blue transition-colors font-semibold text-lg"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;