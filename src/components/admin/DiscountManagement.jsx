import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import BackToDashboard from '../ui/BackToDashboard';

const DiscountManagement = () => {
  const { isAdmin, user } = useAuth();
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiresAt: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    if (isAdmin) {
      loadDiscountCodes();
    }
  }, []);

  const loadDiscountCodes = async () => {
    try {
      const { data, error } = await db.supabase
        .from('discount_codes')
        .select(`
          *,
          created_by_profile:users!created_by(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscountCodes(data || []);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      showAlertMessage('Failed to load discount codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const discountData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discountType,
        discount_value: parseFloat(formData.discountValue),
        is_active: formData.isActive,
        created_by: user.id,
        expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      const { error } = await db.supabase
        .from('discount_codes')
        .insert([discountData]);

      if (error) throw error;

      showAlertMessage('Discount code created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiresAt: '',
        usageLimit: '',
        isActive: true
      });
      loadDiscountCodes();

    } catch (error) {
      console.error('Error creating discount code:', error);
      if (error.code === '23505') { // Unique constraint violation
        showAlertMessage('A discount code with this name already exists', 'error');
      } else {
        showAlertMessage('Failed to create discount code', 'error');
      }
    }
  };

  const toggleCodeStatus = async (id, currentStatus) => {
    try {
      const { error } = await db.supabase
        .from('discount_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setDiscountCodes(prev => prev.map(code =>
        code.id === id ? { ...code, is_active: !currentStatus } : code
      ));

      showAlertMessage(
        `Discount code ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error updating discount code:', error);
      showAlertMessage('Failed to update discount code', 'error');
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const { error } = await db.supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDiscountCodes(prev => prev.filter(code => code.id !== id));
      showAlertMessage('Discount code deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting discount code:', error);
      showAlertMessage('Failed to delete discount code', 'error');
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const isExpired = (expiresAt) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  const isUsageLimitReached = (code) => {
    return code.usage_limit && code.times_used >= code.usage_limit;
  };

  if (!isAdmin) {
    return <div className="text-center py-8">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <BackToDashboard />
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discount Code Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage discount codes for your services
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showCreateForm ? 'Cancel' : 'Create New Code'}
          </button>
        </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Create New Discount Code
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="DISCOUNT10"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Value *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                      placeholder={formData.discountType === 'percentage' ? '10' : '25.00'}
                      required
                      className="block w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500 text-sm">
                        {formData.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="Leave empty for unlimited use"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {discountCodes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No discount codes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first discount code.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {discountCodes.map((code) => (
              <li key={code.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !code.is_active 
                          ? 'bg-gray-100 text-gray-800'
                          : isExpired(code.expires_at) || isUsageLimitReached(code)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {!code.is_active 
                          ? 'Inactive'
                          : isExpired(code.expires_at)
                          ? 'Expired'
                          : isUsageLimitReached(code)
                          ? 'Limit Reached'
                          : 'Active'
                        }
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {code.code}
                        </p>
                        <span className="ml-2 text-sm text-gray-500">
                          {code.discount_type === 'percentage' 
                            ? `${code.discount_value}% off`
                            : `${code.discount_value} off`
                          }
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>Used {code.times_used} times</span>
                        {code.usage_limit && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Limit: {code.usage_limit}</span>
                          </>
                        )}
                        {code.expires_at && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Expires: {new Date(code.expires_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCodeStatus(code.id, code.is_active)}
                      className={`text-sm font-medium ${
                        code.is_active 
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteCode(code.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DiscountManagement;