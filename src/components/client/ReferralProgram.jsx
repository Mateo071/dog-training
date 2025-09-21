import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const ReferralProgram = () => {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [newReferralEmail, setNewReferralEmail] = useState('');
  const [sendingReferral, setSendingReferral] = useState(false);

  useEffect(() => {
    if (profile) {
      loadReferralData();
    }
  }, [profile]);

  const loadReferralData = async () => {
    try {
      // Check if user already has a referral code
      const { data: existingReferrals, error: referralError } = await db.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (referralError) throw referralError;

      if (existingReferrals && existingReferrals.length > 0) {
        setReferrals(existingReferrals);
        setReferralCode(existingReferrals[0].referral_code);
      } else {
        // Generate a new referral code
        await generateReferralCode();
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      showAlertMessage('Failed to load referral information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      // Generate a unique referral code based on user's name
      const firstName = profile.first_name || 'USER';
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newCode = `${firstName.toUpperCase()}${randomNum}`;

      // Create initial referral entry
      const { data, error } = await db.supabase
        .from('referrals')
        .insert([{
          referrer_id: profile.id,
          referral_code: newCode,
          referred_email: '', // This will be populated when someone uses the code
          status: 'sent'
        }])
        .select()
        .single();

      if (error) throw error;

      setReferralCode(newCode);
      setReferrals([data]);
    } catch (error) {
      console.error('Error generating referral code:', error);
      showAlertMessage('Failed to generate referral code', 'error');
    }
  };

  const sendReferral = async (e) => {
    e.preventDefault();
    
    if (!newReferralEmail) {
      showAlertMessage('Please enter an email address', 'error');
      return;
    }

    try {
      setSendingReferral(true);

      // Create a new referral entry for this specific email
      const { error } = await db.supabase
        .from('referrals')
        .insert([{
          referrer_id: profile.id,
          referral_code: referralCode,
          referred_email: newReferralEmail,
          status: 'sent'
        }]);

      if (error) throw error;

      // Send referral email via Supabase Edge Function
      const { error: emailError } = await db.supabase.functions.invoke('send-referral-email', {
        body: {
          referrer_name: `${profile.first_name} ${profile.last_name}`,
          referrer_email: profile.users?.email || 'client',
          referred_email: newReferralEmail,
          referral_code: referralCode
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the whole operation if email fails
      }

      showAlertMessage('Referral sent successfully!', 'success');
      setNewReferralEmail('');
      loadReferralData(); // Refresh the data

    } catch (error) {
      console.error('Error sending referral:', error);
      showAlertMessage('Failed to send referral', 'error');
    } finally {
      setSendingReferral(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      showAlertMessage('Referral code copied to clipboard!', 'success');
    }).catch(() => {
      showAlertMessage('Failed to copy referral code', 'error');
    });
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="mt-2 text-sm text-gray-700">
          Refer friends and earn rewards when they sign up for training
        </p>
      </div>


      {/* How it Works */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
        <h3 className="text-lg font-medium mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">1️⃣</div>
            <h4 className="font-medium">Share Your Code</h4>
            <p className="text-blue-100 text-sm">Send your unique referral code to friends</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">2️⃣</div>
            <h4 className="font-medium">They Sign Up</h4>
            <p className="text-blue-100 text-sm">Your friend gets 10% off their first service</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">3️⃣</div>
            <h4 className="font-medium">You Earn</h4>
            <p className="text-blue-100 text-sm">Receive $30 commission when they book</p>
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Referral Code</h3>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none text-xl font-mono text-center"
          />
          <button
            onClick={copyReferralCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Copy Code
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Share this code with friends, or use the form below to send a personalized invitation.
        </p>
      </div>

      {/* Send Referral */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Send a Referral</h3>
        <form onSubmit={sendReferral} className="flex space-x-2">
          <input
            type="email"
            value={newReferralEmail}
            onChange={(e) => setNewReferralEmail(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={sendingReferral}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingReferral ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Referral History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Referral History
          </h3>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>No referrals sent yet</p>
              <p className="text-sm">Start sharing your referral link to earn rewards!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {referrals.filter(r => r.referred_email).map((referral) => (
                  <li key={referral.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {referral.referred_email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Sent {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.status === 'converted' 
                            ? 'bg-green-100 text-green-800'
                            : referral.status === 'clicked'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.status === 'converted' ? '✅ Converted' :
                           referral.status === 'clicked' ? '👀 Clicked' : '📤 Sent'}
                        </span>
                        {referral.status === 'converted' && (
                          <span className="ml-2 text-sm font-medium text-green-600">
                            +${referral.commission_amount || 30}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;