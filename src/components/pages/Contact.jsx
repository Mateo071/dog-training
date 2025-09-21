import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { analytics } from '../../configuration.jsx';
import { logEvent } from 'firebase/analytics';

const useAlert = () => {
  const [alert, setAlert] = useState({ show: false, text: '', type: 'danger' });

  const showAlert = ({ text, type = 'danger' }) => setAlert({ show: true, text, type });
  const hideAlert = () => setAlert({ show: false, text: '', type: 'danger' });

  return { alert, showAlert, hideAlert };
};

function Contact() {
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Track page view on component mount
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: 'Contact Form',
        page_location: window.location.href
      });
    }
  }, []);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    program: '',
    message: '',
    dogName: '',
    dogBreed: '',
    dogBirthDate: '',
    dogSex: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send contact form data to Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          contactData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            program: formData.program,
            dogName: formData.dogName,
            dogBreed: formData.dogBreed,
            dogBirthDate: formData.dogBirthDate,
            dogSex: formData.dogSex,
            message: formData.message
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit contact form');
      }

      // Track successful form submission
      if (analytics) {
        logEvent(analytics, 'form_submit', {
          form_name: 'contact_form',
          program: formData.program,
          has_dog_info: !!(formData.dogName && formData.dogBreed)
        });
      }

      setLoading(false);
      showAlert({
        show: true,
        text: "Thank you for your message! We'll be in touch soon to schedule your free evaluation 🐶",
        type: "success",
      });

      // Clear form immediately on success
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        program: '',
        message: '',
        dogName: '',
        dogBreed: '',
        dogBirthDate: '',
        dogSex: '',
      });

      setTimeout(() => {
        hideAlert();
      }, 3000);

    } catch (error) {
      setLoading(false);
      console.error('Submission error:', error);

      showAlert({
        show: true,
        text: "Sorry, please try again or email us at floresdogtrainer@gmail.com 🐕",
        type: "danger",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Back Arrow */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-brand-blue hover:text-brand-teal transition-colors duration-200 mb-8 group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        {
          alert.show && <Alert {...alert} />
        }
        
        {/* Hero Header Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-2xl transform -skew-y-1"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
            <div className="p-8 md:p-12 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-4">
                🐕 Get Started Today
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent mb-6">
                Free Evaluation
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Schedule your complimentary evaluation session! Tell us about you and your dog, and we'll help you create a personalized training plan that brings out the best in your furry friend.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
            <div className="bg-gradient-to-r from-brand-blue/5 to-brand-teal/5 p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Let's Get to Know You & Your Dog</h2>
              <p className="text-gray-600 text-center mt-2">Fill out the form below to schedule your free evaluation session</p>
            </div>
            
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-100">
                  <h3 className="flex items-center text-lg font-semibold text-brand-blue mb-6">
                    <span className="bg-brand-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Your Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder='John'
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all bg-white hover:border-brand-blue/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder='Smith'
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all bg-white hover:border-brand-teal/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder='(123) 456-7890'
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all bg-white hover:border-brand-blue/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder='john.smith@gmail.com'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all bg-white hover:border-brand-teal/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Dog Information Section */}
                <div className="bg-gradient-to-r from-brand-teal/10 to-brand-blue/10 rounded-xl p-6 border border-brand-teal/20">
                  <h3 className="flex items-center text-lg font-semibold text-brand-teal mb-6">
                    <span className="bg-brand-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                    🐕 Tell us about your dog
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="dogName" className="block text-sm font-semibold text-gray-700">Dog's Name</label>
                      <input
                        type="text"
                        id="dogName"
                        name="dogName"
                        placeholder='Buddy'
                        value={formData.dogName}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all bg-white hover:border-brand-teal/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dogBreed" className="block text-sm font-semibold text-gray-700">Breed</label>
                      <input
                        type="text"
                        id="dogBreed"
                        name="dogBreed"
                        placeholder='Golden Retriever'
                        value={formData.dogBreed}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all bg-white hover:border-brand-teal/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dogBirthDate" className="block text-sm font-semibold text-gray-700">Birth Date</label>
                      <input
                        type="date"
                        id="dogBirthDate"
                        name="dogBirthDate"
                        value={formData.dogBirthDate}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all bg-white hover:border-brand-blue/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dogSex" className="block text-sm font-semibold text-gray-700">Sex</label>
                      <select
                        id="dogSex"
                        name="dogSex"
                        value={formData.dogSex}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all bg-white hover:border-brand-blue/50 appearance-none bg-white">
                        <option value="">Select sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="dropdown" className="block text-sm font-semibold text-gray-700">Program of Interest</label>
                      <select
                        id="dropdown"
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all bg-white hover:border-brand-teal/50 appearance-none bg-white">
                        <option value="">Select a program</option>
                        <option value="puppyFoundations">Puppy Foundation Program</option>
                        <option value="adultDogTraining">Basic Obedience Training</option>
                        <option value="advancedTraining">Advanced Training & Behavior Modification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Training Goals Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="flex items-center text-lg font-semibold text-orange-700 mb-6">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                    🎯 Training Goals
                  </h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Tell us about your training goals</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder='What behaviors would you like to work on? Any specific challenges or goals for your dog? The more details you provide, the better we can help!'
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-orange-300 resize-none"
                    />
                  </div>
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

                {/* Submit Button */}
                <div className="bg-gradient-to-r from-brand-blue/5 to-brand-teal/5 rounded-xl p-6 border border-brand-blue/10">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
                    <p className="text-gray-600">Submit your information and we'll contact you within 24 hours to schedule your free evaluation!</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-teal text-white py-4 px-8 rounded-xl hover:from-brand-blue/90 hover:to-brand-teal/90 focus:outline-none focus:ring-4 focus:ring-brand-blue/25 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling your free evaluation...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        🐕 Schedule My Free Evaluation
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;