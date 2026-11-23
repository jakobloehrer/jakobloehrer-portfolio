import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { FieldList } from "./fields";
import {
  PROJECT_GROUPS,
  emptyProject,
  fromFirestore,
  toFirestore,
  validateProject,
} from "./projectSchema";
import "./ProjectForm.scss";

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "new");

  const [project, setProject] = useState(emptyProject);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [errors, setErrors] = useState([]);

  const onBusy = (delta) => setPendingUploads((n) => n + delta);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProject = async () => {
      const snap = await getDoc(doc(db, "projects", id));
      if (snap.exists()) {
        setProject(fromFirestore(snap.data()));
      } else {
        console.error("Project not found!");
        navigate("/admin/projects/new");
      }
      setLoading(false);
    };
    fetchProject();
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProject(project);
    setErrors(validationErrors);
    if (validationErrors.length) return;

    setSaving(true);
    try {
      const data = toFirestore(project);
      if (isEdit) {
        await updateDoc(doc(db, "projects", id), data);
      } else {
        await addDoc(collection(db, "projects"), data);
      }
      navigate("/admin");
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  };

  if (loading) return <p className="project-form">Loading…</p>;

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="pf-header">
        <h2>{isEdit ? "Edit Project" : "Create New Project"}</h2>
        <button type="button" onClick={() => navigate("/admin")}>
          Cancel
        </button>
      </div>

      {PROJECT_GROUPS.map((group) => (
        <fieldset key={group.title} className="pf-group">
          <legend>{group.title}</legend>
          <FieldList fields={group.fields} data={project} onChange={setProject} onBusy={onBusy} />
        </fieldset>
      ))}

      {errors.length > 0 && (
        <ul className="pf-errors">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <div className="pf-footer">
        <button type="submit" className="pf-primary" disabled={saving || pendingUploads > 0}>
          {pendingUploads > 0 ? "Uploading…" : saving ? "Saving…" : isEdit ? "Update Project" : "Create Project"}
        </button>
        {isEdit && (
          <button type="button" className="pf-danger" onClick={handleDelete}>
            Delete Project
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;
