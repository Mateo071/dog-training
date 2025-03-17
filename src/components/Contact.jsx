import React, { useState } from 'react';
import emailjs from "@emailjs/browser";
import Alert from '../components/Alert'

const useAlert = () => {
  const [alert, setAlert] = useState({ show: false, text: '', type: 'danger' });

  const showAlert = ({ text, type = 'danger' }) => setAlert({ show: true, text, type });
  const hideAlert = () => setAlert({ show: false, text: '', type: 'danger' });

  return { alert, showAlert, hideAlert };
};

function Contact() {
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    program: '',
    message: '',
    // media: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleFileChange = (e) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     media: e.target.files[0]
  //   }));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          to_name: "Flores Dog Training",
          from_email: formData.email,
          to_email: "floresdogtrainer@gmail.com",
          phone: formData.phone,
          program: formData.program,
          message: formData.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          showAlert({
            show: true,
            text: "Thank you for your message 🐶",
            type: "success",
          });

          setTimeout(() => {
            hideAlert(false);
            setFormData({
              name: '',
              phone: '',
              email: '',
              program: '',
              message: '',
            });
          }, [3000]);
        },
        (error) => {
          setLoading(false);
          console.error(error);

          showAlert({
            show: true,
            text: "Sorry, please try again or email us at floresdogtrainer@gmail.com 🐕",
            type: "danger",
          });
        }
      );
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      {
        alert.show && <Alert {...alert} />
      }
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
                  placeholder='John Smith'
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
                  placeholder='(123) 456-7890'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-teal/20 transition-colors bg-white"
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-blue">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder='john.smith@gmail.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 transition-colors bg-white"
                />
              </div>

              <div>
                <label htmlFor="dropdown" className="block text-sm font-medium text-brand-blue">Program of interest:</label>
                <select
                  type="text"
                  id="dropdown"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 transition-colors bg-white">
                  <option value="">Select a program</option>
                  <option value="puppyTraining">Puppy Training</option>
                  <option value="adultDogTraining">Adult Dog Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-blue">Message:</label>
              <textarea
                id="message"
                name="message"
                placeholder='Please tell us some info about your dog and what you are looking for...'
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring focus:ring-brand-teal/20 transition-colors bg-white"
              />
            </div>

            {/* <div>
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
            </div> */}

            <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-lg p-1 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-blue to-brand-teal text-white py-3 px-6 rounded-md hover:bg-gradient-to-r hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-brand-blue transition-colors font-semibold text-lg"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;