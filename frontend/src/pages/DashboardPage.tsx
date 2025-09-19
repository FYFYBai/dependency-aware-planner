import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from 'mdb-react-ui-kit';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className='min-h-screen' style={{background: '#f8f9fa'}}>
      <Navbar />
      <MDBContainer fluid className='py-4'>
        <MDBRow>
          <MDBCol md={12}>
            <MDBCard className='shadow-sm border-0' style={{borderRadius: '8px'}}>
              <MDBCardBody className='p-4'>
                <MDBCardTitle className='h3 mb-3 text-dark'>
                  Welcome back, {user?.username || 'User'}!
                </MDBCardTitle>
                <MDBCardText className='text-muted'>
                  This is your dependency-aware project planner dashboard. Here you can manage your projects, 
                  track dependencies, and monitor progress.
                </MDBCardText>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
        
        <MDBRow className='mt-4'>
          <MDBCol md={12}>
            <MDBCard className='shadow-sm border-0' style={{borderRadius: '8px'}}>
              <MDBCardBody className='p-4'>
                <MDBCardTitle className='h4 mb-3 text-dark'>Getting Started</MDBCardTitle>
                <MDBCardText className='text-muted'>
                  Welcome to your dependency-aware project planner! Here you can:
                </MDBCardText>
                <ul className='list-unstyled mt-3'>
                  <li className='mb-2 text-dark'>
                    <i className='fas fa-check-circle text-success me-2'></i>
                    Create and manage your projects
                  </li>
                  <li className='mb-2 text-dark'>
                    <i className='fas fa-check-circle text-success me-2'></i>
                    Track task dependencies and relationships
                  </li>
                  <li className='mb-2 text-dark'>
                    <i className='fas fa-check-circle text-success me-2'></i>
                    Monitor project progress and analytics
                  </li>
                  <li className='mb-2 text-dark'>
                    <i className='fas fa-check-circle text-success me-2'></i>
                    Collaborate with your team members
                  </li>
                </ul>
                <div className='mt-4'>
                  <button 
                    className='btn btn-primary me-3' 
                    style={{borderRadius: '6px'}}
                    onClick={() => navigate('/projects/new')}
                  >
                    <i className='fas fa-plus me-2'></i>Create New Project
                  </button>
                  <button className='btn btn-outline-primary' style={{borderRadius: '6px'}}>
                    <i className='fas fa-chart-bar me-2'></i>View Analytics
                  </button>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
