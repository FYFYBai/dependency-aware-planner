import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { getAllProjects, getProjectCollaborators, type Project, type ProjectCollaborator } from "../api/projects";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from "mdb-react-ui-kit";
import { Users, Crown, Shield, Edit, Eye } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const projectColors = [
  { bg: "linear-gradient(135deg, #29353C 0%, #44576D 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #44576D 0%, #768A96 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #768A96 0%, #AAC7D8 100%)", text: "#29353C" },
  { bg: "linear-gradient(135deg, #AAC7D8 0%, #DFEBF6 100%)", text: "#29353C" },
  { bg: "linear-gradient(135deg, #DFEBF6 0%, #E6E6E6 100%)", text: "#29353C" },
  { bg: "linear-gradient(135deg, #29353C 0%, #768A96 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #44576D 0%, #AAC7D8 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #768A96 0%, #DFEBF6 100%)", text: "#29353C" },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const color = projectColors[index % projectColors.length];
  
  const { data: collaborators } = useQuery<ProjectCollaborator[]>({
    queryKey: ["collaborators", project.id],
    queryFn: () => getProjectCollaborators(project.id),
  });

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  // Determine user's role in this project
  const getUserRole = () => {
    if (!user || !collaborators) return null;
    
    // Check if user is the project owner (this would need to be added to the Project interface)
    // For now, we'll assume the first collaborator or check if user is in collaborators list
    const userCollaborator = collaborators.find(c => c.username === user.username);
    if (userCollaborator) {
      return userCollaborator.role;
    }
    return null;
  };

  const userRole = getUserRole();
  const collaboratorCount = collaborators?.length || 0;

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Shield size={14} className="me-1" />;
      case 'editor':
        return <Edit size={14} className="me-1" />;
      case 'viewer':
        return <Eye size={14} className="me-1" />;
      case 'owner':
        return <Crown size={14} className="me-1" />;
      default:
        return <Users size={14} className="me-1" />;
    }
  };

  const getRoleBadge = () => {
    if (!userRole) return null;
    
    const badgeClass = userRole === 'admin' ? 'bg-warning' : 
                      userRole === 'editor' ? 'bg-primary' :
                      userRole === 'viewer' ? 'bg-info' :
                      userRole === 'owner' ? 'bg-danger' : 'bg-secondary';
    
    return (
      <span className={`badge ${badgeClass} small`} style={{ fontSize: '0.7rem' }}>
        {getRoleIcon()}
        {userRole}
      </span>
    );
  };

  return (
    <MDBCol md={3} className="mb-4">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <MDBCard
          className="shadow-sm border-0 h-100"
          style={{
            borderRadius: "8px",
            cursor: "pointer",
            background: color.bg,
            minHeight: "140px",
          }}
          onClick={handleClick}
        >
          <MDBCardBody className="p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <MDBCardTitle
                  className="h5 mb-0"
                  style={{ color: color.text, fontWeight: "600" }}
                >
                  {project.name}
                </MDBCardTitle>
                {getRoleBadge()}
              </div>
              
              <MDBCardText
                className="small mb-2"
                style={{ 
                  color: color.text, 
                  opacity: 0.9,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {project.description || "No description"}
              </MDBCardText>
              
              {/* Collaboration info */}
              <div className="d-flex align-items-center" style={{ color: color.text, opacity: 0.8 }}>
                <Users size={12} className="me-1" />
                <small style={{ fontSize: '0.75rem' }}>
                  {collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}
                </small>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </motion.div>
    </MDBCol>
  );
}

function CreateProjectCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/projects/new");
  };

  return (
    <MDBCol md={3} className="mb-4">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <MDBCard
          className="shadow-sm border-0 h-100 d-flex align-items-center justify-content-center"
          style={{
            borderRadius: "8px",
            cursor: "pointer",
            background: "#f8f9fa",
            border: "2px dashed #dee2e6",
            minHeight: "140px",
          }}
          onClick={handleClick}
        >
          <MDBCardBody className="text-center">
            <div className="mb-2">
              <i className="fas fa-plus fa-2x text-muted"></i>
            </div>
            <MDBCardText className="text-muted mb-0" style={{ fontWeight: "500" }}>
              Create new project
            </MDBCardText>
          </MDBCardBody>
        </MDBCard>
      </motion.div>
    </MDBCol>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
        <Navbar />
        <MDBContainer fluid className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </MDBContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
        <Navbar />
        <MDBContainer fluid className="py-4">
          <div className="text-center">
            <h4 className="text-danger">Error loading projects</h4>
            <p className="text-muted">Please try again later.</p>
          </div>
        </MDBContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />
      <MDBContainer fluid className="py-4">
        {/* Header Section */}
        <div className="mb-4">
          <h2 className="mb-2" style={{ color: "#172b4d", fontWeight: "600" }}>
            Your Projects
          </h2>
          <p className="text-muted mb-0">
            Manage and organize your projects with drag-and-drop boards
          </p>
        </div>

        {/* Projects Grid */}
        <MDBRow>
          {projects?.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
          <CreateProjectCard />
        </MDBRow>

        {/* Empty State */}
        {projects?.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-folder-open fa-3x text-muted"></i>
            </div>
            <h4 className="text-muted mb-2">No projects yet</h4>
            <p className="text-muted mb-4">
              Create your first project to get started with project management
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              style={{ borderRadius: "6px" }}
              onClick={() => window.location.href = "/projects/new"}
            >
              <i className="fas fa-plus me-2"></i>Create Your First Project
            </motion.button>
          </div>
        )}
      </MDBContainer>
    </div>
  );
}
