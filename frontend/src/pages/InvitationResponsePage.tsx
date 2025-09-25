import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { CheckCircle, XCircle, Users, Clock } from "lucide-react";
import { acceptInvitation, declineInvitation } from "../api/projects";
import { useAuth } from "../hooks/useAuth";

interface InvitationResponseRequest {
  token: string;
  response: string;
}

export default function InvitationResponsePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [response, setResponse] = useState<"accept" | "decline" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    onSuccess: () => {
      setIsProcessing(false);
      setResponse("accept");
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error("Failed to accept invitation:", error);
      alert(`Failed to accept invitation: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (token: string) => declineInvitation(token),
    onSuccess: () => {
      setIsProcessing(false);
      setResponse("decline");
    },
    onError: (error: any) => {
      setIsProcessing(false);
      console.error("Failed to decline invitation:", error);
      alert(`Failed to decline invitation: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    },
  });

  const handleAccept = () => {
    if (!token) return;
    setIsProcessing(true);
    acceptMutation.mutate(token);
  };

  const handleDecline = () => {
    if (!token) return;
    setIsProcessing(true);
    declineMutation.mutate(token);
  };

  const handleContinue = () => {
    if (response === "accept") {
      navigate("/projects");
    } else {
      navigate("/dashboard");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <MDBContainer className="text-center">
          <XCircle size={64} className="text-danger mb-3" />
          <h3 className="text-danger">Invalid Invitation</h3>
          <p className="text-muted">This invitation link is not valid.</p>
          <MDBBtn onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </MDBBtn>
        </MDBContainer>
      </div>
    );
  }

  if (response === "accept") {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <MDBContainer className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle size={64} className="text-success mb-3" />
            <h3 className="text-success mb-3">Invitation Accepted!</h3>
            <p className="text-muted mb-4">
              You have successfully joined the project. You can now collaborate with the team.
            </p>
            <MDBBtn color="success" onClick={handleContinue}>
              <Users size={16} className="me-2" />
              View Projects
            </MDBBtn>
          </motion.div>
        </MDBContainer>
      </div>
    );
  }

  if (response === "decline") {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <MDBContainer className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <XCircle size={64} className="text-warning mb-3" />
            <h3 className="text-warning mb-3">Invitation Declined</h3>
            <p className="text-muted mb-4">
              You have declined the project invitation. You can always accept it later if you change your mind.
            </p>
            <MDBBtn onClick={handleContinue}>
              Go to Dashboard
            </MDBBtn>
          </motion.div>
        </MDBContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
      <MDBContainer className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MDBCard className="shadow-sm border-0" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <MDBCardBody className="p-4">
              <div className="mb-4">
                <Users size={48} className="text-primary mb-3" />
                <MDBCardTitle className="h4 mb-3">Project Invitation</MDBCardTitle>
                <p className="text-muted">
                  You have been invited to collaborate on a project. Would you like to accept or decline this invitation?
                </p>
              </div>

              {isProcessing ? (
                <div className="text-center">
                  <MDBSpinner size="lg" className="mb-3" />
                  <p className="text-muted">Processing your response...</p>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center">
                  <MDBBtn
                    color="success"
                    size="lg"
                    onClick={handleAccept}
                    disabled={isProcessing}
                  >
                    <CheckCircle size={20} className="me-2" />
                    Accept
                  </MDBBtn>
                  <MDBBtn
                    color="danger"
                    size="lg"
                    onClick={handleDecline}
                    disabled={isProcessing}
                  >
                    <XCircle size={20} className="me-2" />
                    Decline
                  </MDBBtn>
                </div>
              )}

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  <Clock size={14} className="me-1" />
                  This invitation will expire in 7 days
                </small>
              </div>
            </MDBCardBody>
          </MDBCard>
        </motion.div>
      </MDBContainer>
    </div>
  );
}
