import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { MDBContainer, MDBInput, MDBBtn } from "mdb-react-ui-kit";
import api from "../api/client"; // Axios instance with token

/* ---------------- API call for creating project ---------------- */
async function createProject(project: { name: string; description: string }) {
  const res = await api.post("/projects", project);
  return res.data; // Expect ProjectDto { id, name, description, ... }
}

/* ---------------- Create Project Page ---------------- */
export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      // Redirect to the new project board after creation
      navigate(`/projects/${data.id}`);
    },
    onError: () => {
      setError("Failed to create project. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");
    mutation.mutate({ name, description });
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />
      <MDBContainer className="py-5" style={{ maxWidth: "600px" }}>
        <h3 className="mb-4">Create a New Project</h3>

        <MDBInput
          label="Project Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
          required
        />

        <MDBInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3"
        />

        {error && <div className="text-danger mb-3">{error}</div>}

        <MDBBtn onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Project"}
        </MDBBtn>
      </MDBContainer>
    </div>
  );
}
