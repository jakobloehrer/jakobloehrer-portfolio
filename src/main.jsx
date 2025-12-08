import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import "./index.scss";
import AdminPage from "./pages/admin/AdminPage";
import ProjectForm from "./pages/admin/projectForm/ProjectForm";
import DmiArtifactPage from "./pages/dmi-artifact/DmiArtifactPage";
import ProjectPage from "./pages/project/ProjectPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          }
        />
        <Route path="/work/dmi-history" element={<DmiArtifactPage />} />
        <Route path="/work/:id" element={<ProjectPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
