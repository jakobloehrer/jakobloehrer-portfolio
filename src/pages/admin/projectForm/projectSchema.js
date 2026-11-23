/**
 * Single source of truth for the project form.
 *
 * To add new data to a project, add a field to PROJECT_GROUPS.
 * To add a new widget type, add an entry to SECTION_TYPES (and render it in ProjectPage.jsx).
 *
 * Field config:
 *   key        dot-path into the project / section content, e.g. "text.title"
 *   label      label shown in the form
 *   type       text | url | date | textarea | localized | image | video | tags | sections
 *   required   validated on save (localized: every language must be filled)
 *   multiline  (localized only) use textareas instead of inputs
 *   folder     (image / video) storage folder below "projects/"
 *   hint       optional helper text
 */

export const LANGUAGES = ["de", "en"];

export const SECTION_TYPES = {
  image: {
    label: "Image",
    fields: [
      { key: "imageUrl", label: "Image", type: "image", folder: "sectionImages", required: true },
      { key: "title", label: "Caption", type: "text" },
    ],
  },
  video: {
    label: "Video",
    fields: [
      { key: "videoUrl", label: "Video", type: "video", folder: "sectionVideos", required: true, hint: "MP4 recommended" },
      { key: "posterUrl", label: "Preview image", type: "image", folder: "sectionVideos/posters", hint: "Optional – first frame is used otherwise" },
      { key: "title", label: "Caption", type: "text" },
    ],
  },
  link: {
    label: "Link",
    fields: [
      { key: "linkUrl", label: "URL", type: "url", required: true },
      { key: "text", label: "Link text", type: "localized" },
    ],
  },
};

export const PROJECT_GROUPS = [
  {
    title: "General",
    fields: [
      { key: "title", label: "Title", type: "localized", required: true },
      { key: "projectDate", label: "Project date", type: "date", hint: "Optional" },
      { key: "thumbnailUrl", label: "Thumbnail", type: "image", folder: "thumbnails" },
      { key: "tags", label: "Tags", type: "tags" },
    ],
  },
  {
    title: "Introduction",
    fields: [
      { key: "text.title", label: "Heading", type: "localized", hint: "Optional" },
      { key: "text", label: "Text", type: "localized", multiline: true },
    ],
  },
  {
    title: "Widgets",
    fields: [{ key: "sections", type: "sections" }],
  },
];

export const emptyProject = () => ({
  title: { de: "", en: "" },
  text: { de: "", en: "" },
  thumbnailUrl: "",
  projectDate: "",
  tags: [],
  sections: [],
});

export const emptySection = (type) => ({ type, content: {} });

/* ---------- path helpers ---------- */

export const getIn = (obj, path) =>
  path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

export const setIn = (obj, path, value) => {
  const [head, ...rest] = path.split(".");
  return {
    ...obj,
    [head]: rest.length ? setIn(obj?.[head] ?? {}, rest.join("."), value) : value,
  };
};

/* ---------- Firestore <-> form conversion ---------- */

// Firestore stores tags as {0: "a", 1: "b"}; the form works with arrays.
export const fromFirestore = (data) => ({
  ...emptyProject(),
  ...data,
  title: { ...emptyProject().title, ...data.title },
  text: { ...emptyProject().text, ...data.text },
  projectDate: data.projectDate || "",
  tags: Object.values(data.tags || {}),
  sections: Object.values(data.sections || {}),
});

export const toFirestore = (project) => ({
  ...project,
  projectDate: project.projectDate || null,
  tags: Object.fromEntries(project.tags.map((tag, i) => [i, tag])),
});

/* ---------- validation ---------- */

const isEmpty = (field, value) => {
  if (field.type === "localized") return LANGUAGES.some((l) => !value?.[l]?.trim());
  if (Array.isArray(value)) return value.length === 0;
  return !String(value ?? "").trim();
};

const checkFields = (fields, data, prefix) =>
  fields
    .filter((f) => f.required && isEmpty(f, getIn(data, f.key)))
    .map((f) => `${prefix}${f.label} is required`);

export const validateProject = (project) => [
  ...PROJECT_GROUPS.flatMap((g) => checkFields(g.fields, project, "")),
  ...project.sections.flatMap((s, i) =>
    checkFields(SECTION_TYPES[s.type]?.fields || [], s.content, `Widget ${i + 1} (${s.type}): `)
  ),
];
