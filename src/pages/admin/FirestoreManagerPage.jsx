import { useEffect, useState } from "react";
import { Loader } from "../../common/loader/Loader";
import SectionTitle from "../../common/sectionTitle/SectionTitle";
import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
  getMetadata
} from "firebase/storage";
import { storage } from "../../services/firebase";

const FirestoreManagerPage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path = '') => {
    try {
      setLoading(true);
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      // Process files
      const filesData = await Promise.all(
        result.items.map(async (itemRef) => {
          try {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            return {
              name: itemRef.name,
              url: url,
              size: metadata.size,
              contentType: metadata.contentType,
              fullPath: itemRef.fullPath,
              isPublic: true // Firebase Storage URLs are publicly accessible
            };
          } catch (error) {
            console.error("Error getting file data:", error);
            return null;
          }
        })
      );

      // Process folders (prefixes)
      const foldersData = result.prefixes.map((prefixRef) => ({
        name: prefixRef.name,
        fullPath: prefixRef.fullPath,
        isFolder: true
      }));

      setFiles(filesData.filter(file => file !== null));
      setFolders(foldersData);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const newProgress = {};
    selectedFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    try {
        console.log("Uploading files to path:", currentPath);
      for (const file of selectedFiles) {
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        const storageRef = ref(storage, filePath);
        console.log(`Uploading ${file.name} to ${filePath}`);
        await uploadBytes(storageRef, file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      // Refresh the file list
      await fetchFiles(currentPath);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName, fullPath) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const fileRef = ref(storage, fullPath);
      await deleteObject(fileRef);
      await fetchFiles(currentPath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const openInNewWindow = (url) => {
    window.open(url, '_blank');
  };

  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
  };

  const navigateUp = () => {
    if (currentPath) {
      const pathParts = currentPath.split('/').filter(p => p);
      pathParts.pop();
      setCurrentPath(pathParts.join('/') + (pathParts.length > 0 ? '/' : ''));
    }
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    const parts = currentPath.split('/').filter(p => p);
    const breadcrumbs = [{ name: 'Root', path: '' }];
    let currentPathBuild = '';
    parts.forEach((part, index) => {
      currentPathBuild += part + '/';
      breadcrumbs.push({ name: part, path: currentPathBuild });
    });
    return breadcrumbs;
  };

  const createFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || !folderName.trim()) return;

    try {
      const placeholderPath = currentPath
        ? `${currentPath}/${folderName}/.keep`
        : `${folderName}/.keep`;
        console.log("Creating folder with placeholder at:", placeholderPath);

      const placeholderRef = ref(storage, placeholderPath);
      const placeholderBlob = new Blob([''], { type: 'text/plain' });

      await uploadBytes(placeholderRef, placeholderBlob);
      await deleteObject(placeholderRef);

      await fetchFiles(currentPath);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder. Please try again.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) return '🖼️';
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('video')) return '🎥';
    if (contentType?.includes('audio')) return '🎵';
    return '📁';
  };

  return (
    <div className="firestore-manager">
      <SectionTitle title="File Manager" />

      {/* Breadcrumbs */}
      <div className="breadcrumbs" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        {getBreadcrumbs().map((crumb, index) => (
          <span key={crumb.path}>
            <button
              onClick={() => setCurrentPath(crumb.path)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0',
                fontSize: '14px'
              }}
            >
              {crumb.name}
            </button>
            {index < getBreadcrumbs().length - 1 && <span style={{ margin: '0 5px' }}> / </span>}
          </span>
        ))}
      </div>

      {/* File Upload Section */}
      <div className="upload-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Upload Files</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <button
            onClick={createFolder}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Create Folder
          </button>
        </div>
        {uploading && (
          <div>
            <p>Uploading...</p>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                {fileName}: {progress}%
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="loader-wrapper">
          <Loader isLoading={loading} />
        </div>
      )}

      {/* Files Grid */}
      <div className="files-grid" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'flex-start'
      }}>
        {/* Render Folders First */}
        {folders.map((folder) => (
          <div key={folder.fullPath} className="folder-card" style={{
            width: '250px',
            height: '120px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: '#f8f9fa'
          }}
          onClick={() => navigateToFolder(folder.fullPath)}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              📁
            </div>
            <h4 style={{
              fontSize: '14px',
              margin: '0',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              {folder.name}
            </h4>
          </div>
        ))}

        {/* Render Files */}
        {files.map((file) => (
          <div key={file.fullPath} className="file-card" style={{
            width: '250px',
            height: '300px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {/* File Preview */}
            <div className="file-preview" style={{
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              {file.contentType?.startsWith('image/') && !file.contentType.includes('pdf') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div style={{ fontSize: '48px' }}>
                  {getFileIcon(file.contentType)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="file-info" style={{ flex: 1, margin: '10px 0' }}>
              <h4 style={{
                fontSize: '14px',
                margin: '0 0 5px 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </h4>
              <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>
                Type: {file.contentType || 'Unknown'}
              </p>
              <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>
                Size: {formatFileSize(file.size)}
              </p>
              <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>
                Status: {file.isPublic ? 'Public' : 'Private'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="file-actions" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <button
                onClick={() => openInNewWindow(file.url)}
                style={{
                  padding: '5px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Open in New Window
              </button>
              <button
                onClick={() => copyToClipboard(file.url)}
                style={{
                  padding: '5px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Copy URL
              </button>
              <button
                onClick={() => handleDelete(file.name, file.fullPath)}
                style={{
                  padding: '5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && folders.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {currentPath ? `No files or folders in ${currentPath}` : 'No files or folders found.'}
        </p>
      )}
    </div>
  );
};

export default FirestoreManagerPage;
