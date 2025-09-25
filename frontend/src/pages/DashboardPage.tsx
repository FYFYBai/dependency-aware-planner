import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn } from 'mdb-react-ui-kit';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserInvitations, type ProjectInvitation } from '../api/projects';
import { motion } from 'framer-motion';
import { Mail, Users, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: invitations } = useQuery<ProjectInvitation[]>({
    queryKey: ["user-invitations"],
    queryFn: getUserInvitations,
  });

  const pendingInvitations = invitations?.filter(inv => inv.status === 'PENDING') || [];

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

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <MDBRow className='mt-4'>
            <MDBCol md={12}>
              <MDBCard className='shadow-sm border-0' style={{borderRadius: '8px'}}>
                <MDBCardBody className='p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <Mail size={24} className='text-warning me-2' />
                    <MDBCardTitle className='h4 mb-0 text-dark'>Pending Invitations</MDBCardTitle>
                  </div>
                  <MDBCardText className='text-muted mb-3'>
                    You have {pendingInvitations.length} pending project invitation{pendingInvitations.length !== 1 ? 's' : ''}.
                  </MDBCardText>
                  
                  <div className='list-group'>
                    {pendingInvitations.map((invitation) => (
                      <motion.div
                        key={invitation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className='list-group-item d-flex justify-content-between align-items-center border-0 bg-light mb-2 rounded'
                      >
                        <div>
                          <div className='fw-bold text-dark'>{invitation.projectName}</div>
                          <small className='text-muted'>
                            Invited by {invitation.invitedByUsername} • Role: {invitation.role}
                          </small>
                          <div className='mt-1'>
                            <span className='badge bg-warning'>
                              <Clock size={12} className='me-1' />
                              Pending
                            </span>
                          </div>
                        </div>
                        <MDBBtn
                          size='sm'
                          color='primary'
                          onClick={() => navigate(`/invitation/${invitation.id}`)}
                        >
                          <Users size={14} className='me-1' />
                          Respond
                        </MDBBtn>
                      </motion.div>
                    ))}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        )}
        
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
                  <button 
                    className='btn btn-outline-primary' 
                    style={{borderRadius: '6px'}}
                    onClick={() => navigate('/projects')}
                  >
                    <i className='fas fa-folder-open me-2'></i>View Projects
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
