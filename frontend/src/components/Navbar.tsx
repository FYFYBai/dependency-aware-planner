import { useState } from 'react';
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

  const handleLogout = () => {
    logout();
    setOpenBasic(false); // Close mobile menu
  };

  return (
    <MDBNavbar expand='lg' light bgColor='light' className='shadow-sm'>
      <MDBContainer fluid>
        <MDBNavbarBrand href='#' className='fw-bold text-primary'>
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
                <MDBNavbarLink active aria-current='page' href='#'>
                  Dashboard
                </MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-3'>
                <MDBNavbarLink href='#'>Projects</MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-3'>
                <MDBNavbarLink href='#'>Tasks</MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem className='me-4'>
                <MDBNavbarLink href='#'>Analytics</MDBNavbarLink>
              </MDBNavbarItem>
            </MDBNavbarNav>

            {/* Search Bar - positioned after Analytics with spacing */}
            <div className='flex-grow-1 d-flex justify-content-center'>
              <form className='d-flex input-group' style={{ maxWidth: '400px' }}>
                <input 
                  type='search' 
                  className='form-control' 
                  placeholder='Search projects, tasks...' 
                  aria-label='Search' 
                />
                <MDBBtn color='primary' type='submit'>
                  <MDBIcon icon='search' />
                </MDBBtn>
              </form>
            </div>

            {/* Right side - User Menu only */}
            <div className='d-flex align-items-center ms-4'>
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
                        <div className='fw-bold'>{user.username}</div>
                        <div className='text-muted small'>{user.email}</div>
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
                  <MDBBtn color='primary' size='sm' href='/login' outline>
                    Login
                  </MDBBtn>
                  <MDBBtn color='primary' size='sm' href='/register'>
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