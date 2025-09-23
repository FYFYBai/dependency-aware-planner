import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        // First check if user is already verified
        console.log('Checking verification status for token:', token);
        try {
          const statusResponse = await api.get(`/auth/check-verification-status?token=${token}`);
          
          if (statusResponse.data === true) {
            setStatus('success');
            setMessage('Your email is already verified! You can now log in.');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
            return;
          }
        } catch (statusError) {
          // If status check fails, continue with verification attempt
          console.log('Status check failed, proceeding with verification:', statusError);
        }

        // If not verified, proceed with verification
        console.log('Verifying token:', token);
        const response = await api.post(`/auth/verify-email?token=${token}`);
        console.log('Response:', response);
        
        setStatus('success');
        setMessage(response.data);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: unknown) {
        console.error('Verification error:', error);
        setStatus('error');
        
        let errorMessage = 'Verification failed. Please try again.';
        
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: string; status?: number } };
          const responseData = responseError.response?.data;
          const status = responseError.response?.status;
          
          if (responseData) {
            // Extract the actual error message from the response
            errorMessage = responseData.replace('Error: ', '');
          } else if (status === 404) {
            errorMessage = 'Invalid verification link. Please request a new verification email.';
          } else if (status === 400) {
            errorMessage = 'This verification link has expired or is invalid. Please request a new one.';
          }
        }
        
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="mt-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Your email has been successfully verified! You will be redirected to the login page shortly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => navigate('/resend-verification')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
