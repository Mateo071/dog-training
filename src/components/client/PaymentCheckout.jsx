import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const PaymentCheckout = () => {
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [referralCode, setReferralCode] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const [formData, setFormData] = useState({
    serviceType: searchParams.get('service') || 'evaluation',
    amount: parseFloat(searchParams.get('amount')) || 75.00,
    discountCode: searchParams.get('discount') || '',
    referralCode: searchParams.get('referral') || ''
  });

  const services = [
    { id: 'evaluation', name: 'Initial Evaluation', price: 75.00, description: 'Comprehensive behavioral assessment' },
    { id: 'single_session', name: 'Single Training Session', price: 100.00, description: '60-minute training session' },
    { id: 'package_4', name: '4-Session Package', price: 350.00, description: 'Four 60-minute training sessions' },
    { id: 'package_8', name: '8-Session Package', price: 640.00, description: 'Eight 60-minute training sessions' },
    { id: 'intensive', name: 'Intensive Training Program', price: 1200.00, description: '2-week intensive program' }
  ];

  useEffect(() => {
    if (formData.discountCode) {
      validateDiscountCode(formData.discountCode);
    }
    if (formData.referralCode) {
      validateReferralCode(formData.referralCode);
    }
  }, [formData.discountCode, formData.referralCode]);


  const validateDiscountCode = async (code) => {
    if (!code) {
      setAppliedDiscount(null);
      return;
    }

    try {
      const { data, error } = await db.supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        showAlertMessage('Invalid discount code', 'error');
        setAppliedDiscount(null);
        return;
      }

      // Check if code has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        showAlertMessage('Discount code has expired', 'error');
        setAppliedDiscount(null);
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.times_used >= data.usage_limit) {
        showAlertMessage('Discount code has reached its usage limit', 'error');
        setAppliedDiscount(null);
        return;
      }

      setAppliedDiscount(data);
      showAlertMessage('Discount code applied successfully!', 'success');
    } catch (error) {
      console.error('Error validating discount code:', error);
      showAlertMessage('Error validating discount code', 'error');
    }
  };

  const validateReferralCode = async (code) => {
    if (!code) return;

    try {
      const { data, error } = await db.supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code)
        .eq('status', 'sent')
        .single();

      if (error || !data) {
        showAlertMessage('Invalid referral code', 'error');
        return;
      }

      setReferralCode(data);
      showAlertMessage('Referral code applied! You\'ll receive a discount.', 'success');
    } catch (error) {
      console.error('Error validating referral code:', error);
    }
  };

  const calculateTotal = () => {
    let total = formData.amount;
    
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        total = total - (total * appliedDiscount.discount_value / 100);
      } else {
        total = Math.max(0, total - appliedDiscount.discount_value);
      }
    } else if (referralCode) {
      // Apply referral discount (typically 10%)
      total = total - (total * (referralCode.discount_percentage || 10) / 100);
    }

    return Math.max(0, total);
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        serviceType: serviceId,
        amount: service.price
      }));
    }
  };

  const handleDiscountCodeApply = () => {
    validateDiscountCode(discountCode);
    setFormData(prev => ({ ...prev, discountCode }));
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment intent with Supabase Edge Function
      const { data, error } = await db.supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(calculateTotal() * 100), // Convert to cents
          currency: 'usd',
          service_type: formData.serviceType,
          profile_id: profile.id,
          discount_code_id: appliedDiscount?.id,
          referral_id: referralCode?.id
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        showAlertMessage('Payment setup failed. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      showAlertMessage('Payment processing failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const selectedServiceData = services.find(s => s.id === formData.serviceType);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Complete Your Payment
          </h3>

          {/* Service Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Service
            </label>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.serviceType === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleServiceChange(service.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${service.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Code (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleDiscountCodeApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{selectedServiceData?.name}</span>
                <span>${formData.amount.toFixed(2)}</span>
              </div>
              
              {appliedDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>
                    -{appliedDiscount.discount_type === 'percentage' 
                      ? `${appliedDiscount.discount_value}%` 
                      : `$${appliedDiscount.discount_value}`
                    }
                  </span>
                </div>
              )}
              
              {referralCode && !appliedDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Referral Discount</span>
                  <span>-{referralCode.discount_percentage}%</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment processing by Stripe. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
