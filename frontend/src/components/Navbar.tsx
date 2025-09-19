import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBCollapse,
} from 'mdb-react-ui-kit';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [openBasic, setOpenBasic] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpenBasic(false); // Close mobile menu
  };

  return (
    <MDBNavbar expand='lg' light bgColor='light' className='shadow-sm'>
      <MDBContainer fluid>
        <MDBNavbarBrand 
          href='#' 
          className='fw-bold text-primary'
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
          style={{ cursor: 'pointer' }}
        >
          Dependency Planner
        </MDBNavbarBrand>

        <MDBNavbarToggler
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
          onClick={() => setOpenBasic(!openBasic)}
        >
          <MDBIcon icon='bars' fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar open={openBasic}>
          <div className='d-flex align-items-center w-100'>
            {/* Navigation Links */}
            <MDBNavbarNav className='d-flex flex-row me-4'>
              <MDBNavbarItem className='me-3'>
                <MDBNavbarLink 
                  active 
                  aria-current='page' 
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Dashboard
                </MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-3'>
                <MDBNavbarLink 
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Projects
                </MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-3'>
                <MDBNavbarLink 
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Tasks
                </MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-4'>
                <MDBNavbarLink 
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Analytics
                </MDBNavbarLink>
              </MDBNavbarItem>
            </MDBNavbarNav>

            {/* Right side - User Menu only */}
            <div className='d-flex align-items-center ms-auto'>
              {/* User Dropdown */}
              {user ? (
                <MDBDropdown>
                  <MDBDropdownToggle
                    tag='a'
                    className='nav-link d-flex align-items-center text-decoration-none'
                    role='button'
                    style={{ color: '#333' }}
                  >
                    <MDBIcon icon='user-circle' size='lg' className='me-2' />
                    <span className='d-none d-md-inline'>{user.email}</span>
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    <MDBDropdownItem header>
                      <div className='text-center'>
                        <div className='fw-bold'>{user.email}</div>
                      </div>
                    </MDBDropdownItem>
                    <MDBDropdownItem divider />
                    <MDBDropdownItem link href='#'>
                      <MDBIcon icon='user' className='me-2' />
                      Profile
                    </MDBDropdownItem>
                    <MDBDropdownItem link href='#'>
                      <MDBIcon icon='cog' className='me-2' />
                      Settings
                    </MDBDropdownItem>
                    <MDBDropdownItem divider />
                    <MDBDropdownItem link onClick={handleLogout}>
                      <MDBIcon icon='sign-out-alt' className='me-2' />
                      Logout
                    </MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              ) : (
                <div className='d-flex gap-2'>
                  <MDBBtn 
                    color='primary' 
                    size='sm' 
                    outline
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </MDBBtn>
                  <MDBBtn 
                    color='primary' 
                    size='sm'
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </MDBBtn>
                </div>
              )}
            </div>
          </div>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
}