import { useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { LANGUAGES, SECTION_TYPES, emptySection, getIn, setIn } from "./projectSchema";

/* ---------- individual inputs ---------- */

const LocalizedInput = ({ value = {}, onChange, multiline }) => {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="pf-localized">
      {LANGUAGES.map((lang) => (
        <div key={lang} className="pf-localized-row">
          <span className="pf-lang">{lang.toUpperCase()}</span>
          <Input
            type="text"
            rows={multiline ? 6 : undefined}
            value={value[lang] || ""}
            onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
};

// Uploads image or video files to Firebase Storage (resumable, with progress).
const MediaInput = ({ value, onChange, folder, onBusy, kind = "image" }) => {
  const [progress, setProgress] = useState(null); // null = idle, 0-100 = uploading

  const handleFile = (file) => {
    if (!file) return;
    setProgress(0);
    onBusy(1);

    const storageRef = ref(getStorage(), `projects/${folder}/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    });

    const done = () => {
      setProgress(null);
      onBusy(-1);
    };

    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error("Upload failed:", err);
        alert(`${kind} upload failed.`);
        done();
      },
      async () => {
        onChange(await getDownloadURL(task.snapshot.ref));
        done();
      }
    );
  };

  const uploading = progress !== null;

  return (
    <div className="pf-image">
      {value &&
        (kind === "video" ? (
          <video src={value} controls preload="metadata" />
        ) : (
          <img src={value} alt="" />
        ))}
      <div className="pf-image-actions">
        <input type="file" accept={`${kind}/*`} disabled={uploading} onChange={(e) => handleFile(e.target.files[0])} />
        {uploading && (
          <>
            <progress max="100" value={progress} />
            <span>{progress}%</span>
          </>
        )}
        {value && !uploading && (
          <button type="button" className="pf-icon-btn" onClick={() => onChange("")} title={`Remove ${kind}`}>
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

const TagsInput = ({ value = [], onChange }) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="pf-tags">
      <div className="pf-tag-list">
        {value.map((tag) => (
          <span key={tag} className="pf-tag">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
              <FiX />
            </button>
          </span>
        ))}
      </div>
      <div className="pf-inline">
        <input
          type="text"
          value={draft}
          placeholder="Add a tag and press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add}>
          <FiPlus /> Add
        </button>
      </div>
    </div>
  );
};

const SectionsInput = ({ value = [], onChange, onBusy }) => {
  const update = (index, section) => onChange(value.map((s, i) => (i === index ? section : s)));
  const remove = (index) => {
    if (window.confirm("Remove this widget?")) onChange(value.filter((_, i) => i !== index));
  };
  const move = (index, dir) => {
    const next = [...value];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next);
  };

  return (
    <div className="pf-sections">
      {value.length === 0 && <p className="pf-hint">No widgets yet.</p>}

      {value.map((section, index) => {
        const config = SECTION_TYPES[section.type];
        return (
          <div key={index} className="pf-section-card">
            <div className="pf-section-header">
              <strong>
                {index + 1}. {config?.label ?? section.type}
              </strong>
              <div className="pf-inline">
                <button type="button" className="pf-icon-btn" disabled={index === 0} onClick={() => move(index, -1)} title="Move up">
                  <FiArrowUp />
                </button>
                <button type="button" className="pf-icon-btn" disabled={index === value.length - 1} onClick={() => move(index, 1)} title="Move down">
                  <FiArrowDown />
                </button>
                <button type="button" className="pf-icon-btn pf-danger" onClick={() => remove(index)} title="Remove">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {config ? (
              <FieldList
                fields={config.fields}
                data={section.content}
                onChange={(content) => update(index, { ...section, content })}
                onBusy={onBusy}
              />
            ) : (
              <p className="pf-hint">Unknown widget type "{section.type}" – it will be saved unchanged.</p>
            )}
          </div>
        );
      })}

      <div className="pf-inline">
        {Object.entries(SECTION_TYPES).map(([type, { label }]) => (
          <button key={type} type="button" onClick={() => onChange([...value, emptySection(type)])}>
            <FiPlus /> {label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- generic renderer ---------- */

const FieldInput = ({ field, value, onChange, onBusy }) => {
  switch (field.type) {
    case "localized":
      return <LocalizedInput value={value} onChange={onChange} multiline={field.multiline} />;
    case "image":
    case "video":
      return <MediaInput kind={field.type} value={value} onChange={onChange} folder={field.folder} onBusy={onBusy} />;
    case "tags":
      return <TagsInput value={value} onChange={onChange} />;
    case "sections":
      return <SectionsInput value={value} onChange={onChange} onBusy={onBusy} />;
    case "textarea":
      return <textarea rows={6} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    default: // text | url | date
      return <input type={field.type} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  }
};

export const FieldList = ({ fields, data, onChange, onBusy }) =>
  fields.map((field) => (
    <div key={field.key} className="pf-field">
      {field.label && (
        <label className="pf-label">
          {field.label}
          {field.required && <span className="pf-required"> *</span>}
          {field.hint && <span className="pf-hint"> ({field.hint})</span>}
        </label>
      )}
      <FieldInput
        field={field}
        value={getIn(data, field.key)}
        onChange={(v) => onChange(setIn(data, field.key, v))}
        onBusy={onBusy}
      />
    </div>
  ));
