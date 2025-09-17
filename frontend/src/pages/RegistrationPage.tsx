import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
  MDBCheckbox
} from 'mdb-react-ui-kit';

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      await register({
        username: formData.email, // Using email as username since no separate username field
        email: formData.email,
        password: formData.password
      });
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <MDBContainer fluid>
      <MDBRow className='d-flex justify-content-center align-items-center h-100'>
        <MDBCol col='12'>
          <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
              <h2 className="fw-bold mb-2 text-center">Sign up</h2>
              <p className="text-muted mb-3 text-center">Please enter your details to create an account!</p>

              {generalError && (
                <div className="alert alert-danger" role="alert">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <MDBInput 
                  wrapperClass='mb-4 w-100' 
                  label='Email address' 
                  id='email' 
                  type='email' 
                  size="lg"
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                />
                {errors.email && (
                  <div className="text-danger small mb-3">{errors.email}</div>
                )}

                <MDBInput 
                  wrapperClass='mb-4 w-100' 
                  label='Create Password' 
                  id='password' 
                  type={showPassword ? 'text' : 'password'} 
                  size="lg"
                  value={formData.password}
                  onChange={handleInputChange}
                  name="password"
                />
                {errors.password && (
                  <div className="text-danger small mb-3">{errors.password}</div>
                )}

                <MDBInput 
                  wrapperClass='mb-4 w-100' 
                  label='Confirm Password' 
                  id='confirmPassword' 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  size="lg"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  name="confirmPassword"
                />
                {errors.confirmPassword && (
                  <div className="text-danger small mb-3">{errors.confirmPassword}</div>
                )}

                <div className="d-flex justify-content-between mb-4">
                  <MDBCheckbox 
                    name='rememberMe' 
                    id='rememberMe' 
                    label='Remember me' 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link to="/forgot-password" className="text-primary">
                    Forgot password?
                  </Link>
                </div>

                <MDBBtn 
                  size='lg' 
                  type="submit" 
                  disabled={isLoading}
                  className="w-100 mb-4"
                >
                  {isLoading ? 'Creating account...' : 'Register'}
                </MDBBtn>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-bold">
                    Sign in
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

export default RegistrationPage;
