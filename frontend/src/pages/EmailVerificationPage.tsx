import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon
} from 'mdb-react-ui-kit';

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
        // Check if backend server is reachable
        try {
          await fetch('http://localhost:8081/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } catch {
          setStatus('error');
          setMessage('Backend server is not running. Please start the backend server on port 8081.');
          return;
        }
        
        // Check if email is already verified to prevent duplicate processing
        try {
          const statusResponse = await api.get(`/auth/check-verification-status?token=${token}`);
          if (statusResponse.data === true) {
            setStatus('success');
            setMessage('Email is already verified! You can now log in.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
            return;
          }
        } catch {
          // If status check fails, proceed with verification attempt
        }
        
        // Attempt email verification
        const response = await api.post(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: unknown) {
        // Handle database transaction errors that might occur after successful verification
        const responseErrorMessage = error instanceof Error && 'response' in error 
          ? (error as { response?: { data?: string; status?: number } }).response?.data || ''
          : '';
        
        // Check if verification actually succeeded despite database cleanup errors
        if (responseErrorMessage.includes('Row was updated or deleted by another transaction') || 
            responseErrorMessage.includes('unsaved-value mapping was incorrect')) {
          try {
            const statusResponse = await api.get(`/auth/check-verification-status?token=${token}`);
            if (statusResponse.data === true) {
              setStatus('success');
              setMessage('Email verified successfully! You can now log in.');
              setTimeout(() => {
                navigate('/login');
              }, 3000);
              return;
            }
          } catch {
            // Continue with normal error handling if status check fails
          }
        }
        
        setStatus('error');
        let errorMessage = 'Verification failed. Please try again.';
        
        // Extract meaningful error message from response
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: string; status?: number } };
          const responseData = responseError.response?.data;
          const status = responseError.response?.status;
          
          if (responseData) {
            errorMessage = responseData.replace('Error: ', '');
          } else if (status === 404) {
            errorMessage = 'Invalid verification link. Please request a new verification email.';
          } else if (status === 400) {
            errorMessage = 'This verification link has expired or is invalid. Please request a new one.';
          } else if (status === 0 || !status) {
            errorMessage = 'Cannot connect to backend server. Please make sure the backend is running on port 8081.';
          }
        } else if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to backend server. Please make sure the backend is running on port 8081.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <MDBContainer fluid>
      <MDBRow className='d-flex justify-content-center align-items-center h-100'>
        <MDBCol col='12'>
          <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
              <h2 className="fw-bold mb-2 text-center">
                {status === 'verifying' && 'Verifying Email...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </h2>
              <p className="text-muted mb-3 text-center">
                {message}
              </p>

              {status === 'verifying' && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Please wait while we verify your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="mt-4">
                  <div className="alert alert-success" role="alert">
                    <div className="d-flex align-items-center">
                      <MDBIcon icon="check-circle" className="text-success me-3" size="lg" />
                      <div>
                        <strong>Verification Successful!</strong><br />
                        Your email has been successfully verified. You will be redirected to the login page shortly.
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <MDBBtn 
                      color="success" 
                      size="lg" 
                      className="w-100 mb-3"
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </MDBBtn>
                    <p className="text-muted small">
                      Redirecting automatically in a few seconds...
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-4">
                  <div className="alert alert-danger" role="alert">
                    <div className="d-flex align-items-center">
                      <MDBIcon icon="exclamation-triangle" className="text-danger me-3" size="lg" />
                      <div>
                        <strong>Verification Failed</strong><br />
                        {message}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <MDBBtn 
                      color="success" 
                      size="lg" 
                      className="w-100 mb-3"
                      onClick={() => navigate('/register')}
                    >
                      Try Registering Again
                    </MDBBtn>
                    <MDBBtn 
                      color="primary" 
                      size="lg" 
                      className="w-100 mb-3"
                      outline
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </MDBBtn>
                  </div>
                </div>
              )}

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Need help?{' '}
                  <Link to="/contact" className="text-primary fw-bold">
                    Contact Support
                  </Link>
                </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default EmailVerificationPage;
