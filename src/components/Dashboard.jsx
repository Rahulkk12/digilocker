import React, { useState, useEffect, useRef } from 'react';
import {
  FaShieldAlt, FaSignOutAlt, FaHome, FaFolderOpen, FaCloudUploadAlt,
  FaUserCircle, FaSearch, FaFilePdf, FaFileImage, FaTrashAlt,
  FaDownload, FaEye, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaFileAlt, FaPen, FaCamera, FaCrown, FaStar, FaRocket
} from 'react-icons/fa';
import { FaIdCard } from 'react-icons/fa';
import './Dashboard.css';
import KycUpdate from './KycUpdate';

// ─── Constants ───────────────────────────────────────────────────
const DOCS_KEY = 'digiLockerDocuments';
const PLAN_KEY = 'digiLockerPlan';
const PHOTO_KEY = 'digiLockerProfilePhoto';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

// ─── Plan Definitions (INR ₹) ────────────────────────────────────
const PLANS = {
  free:    { id: 'free',    name: 'Free',    price: 0,   storage: 1 * 1024 * 1024 * 1024,  label: '1 GB',  features: ['1 GB Cloud Storage', 'Upload up to 10 files', 'Basic document viewer', 'Standard support'] },
  premium: { id: 'premium', name: 'Premium', price: 199, storage: 50 * 1024 * 1024 * 1024, label: '50 GB', features: ['50 GB Cloud Storage', 'Unlimited uploads', 'HD document preview', 'Priority 24/7 support', 'Document sharing', 'Advanced analytics'] }
};

// ─── Helpers ─────────────────────────────────────────────────────
const getFileType = (mime) => {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/')) return 'Image';
  return 'File';
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });


// ═══════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════
const Dashboard = ({ onLogout }) => {
  // ─── Core state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [profilePhoto, setProfilePhoto] = useState(null);

  // ─── Upload state ──────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ─── UI state ──────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '' });
  const [showPlanModal, setShowPlanModal] = useState(false);

  const profilePhotoRef = useRef(null);

  // ─── Load persisted data on mount ──────────────────────────────
  useEffect(() => {
    const activeUser = localStorage.getItem('activeDigiLockerUser');
    if (activeUser) setUser(JSON.parse(activeUser));

    const saved = localStorage.getItem(DOCS_KEY);
    if (saved) setDocuments(JSON.parse(saved));

    const plan = localStorage.getItem(PLAN_KEY);
    if (plan) setCurrentPlan(plan);

    const photo = localStorage.getItem(PHOTO_KEY);
    if (photo) setProfilePhoto(photo);
  }, []);

  // ─── Persist documents ────────────────────────────────────────
  useEffect(() => { localStorage.setItem(DOCS_KEY, JSON.stringify(documents)); }, [documents]);

  // ─── Toast auto-dismiss ───────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // ─── Computed values ──────────────────────────────────────────
  const getUserFirstName = () => user ? user.name.split(' ')[0] : 'User';
  const totalSize = documents.reduce((s, d) => s + (d.size || 0), 0);
  const plan = PLANS[currentPlan];
  const storagePercent = Math.min((totalSize / plan.storage) * 100, 100);
  const storageExceeded = totalSize >= plan.storage;

  // ═══════════════════════════════════════════════════════════════
  // FILE UPLOAD (real FileReader → localStorage)
  // ═══════════════════════════════════════════════════════════════
  const processFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('error', `"${file.name}" is not supported. Use PDF, JPEG, or PNG.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', `"${file.name}" exceeds the 10 MB per-file limit.`);
      return;
    }
    // Check storage quota
    if (totalSize + file.size > plan.storage) {
      showToast('error', `Storage limit reached (${plan.label}). Upgrade your plan to continue uploading.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDocuments(prev => [{
        id: Date.now().toString(),
        name: file.name,
        type: getFileType(file.type),
        mimeType: file.type,
        size: file.size,
        date: new Date().toISOString(),
        data: reader.result
      }, ...prev]);
      setIsUploading(false);
      showToast('success', `"${file.name}" uploaded successfully!`);
      setActiveTab('documents');
    };
    reader.onerror = () => { setIsUploading(false); showToast('error', `Failed to read "${file.name}".`); };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const handleBrowse = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); e.target.value = ''; };

  // ─── Delete & Download ────────────────────────────────────────
  const handleDelete = (id) => { setDocuments(p => p.filter(d => d.id !== id)); showToast('success', 'Document deleted.'); if (previewDoc?.id === id) setPreviewDoc(null); };
  const handleDownload = (doc) => { const a = document.createElement('a'); a.href = doc.data; a.download = doc.name; document.body.appendChild(a); a.click(); document.body.removeChild(a); };

  // ═══════════════════════════════════════════════════════════════
  // EDIT PROFILE
  // ═══════════════════════════════════════════════════════════════
  const openEditModal = () => {
    if (user) setEditForm({ name: user.name, email: user.email, mobile: user.mobile });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSave = () => {
    if (!editForm.name || !editForm.email || !editForm.mobile) {
      showToast('error', 'All fields are required.');
      return;
    }
    // Update user object in both state and localStorage
    const updated = { ...user, name: editForm.name, email: editForm.email, mobile: editForm.mobile };
    setUser(updated);
    localStorage.setItem('activeDigiLockerUser', JSON.stringify(updated));
    // Also update in the users array
    const users = JSON.parse(localStorage.getItem('digiLockerUsers') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx] = updated; localStorage.setItem('digiLockerUsers', JSON.stringify(users)); }
    setShowEditModal(false);
    showToast('success', 'Profile updated successfully!');
  };

  // ═══════════════════════════════════════════════════════════════
  // PROFILE PHOTO UPLOAD
  // ═══════════════════════════════════════════════════════════════
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('error', 'Please select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('error', 'Profile photo must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result);
      localStorage.setItem(PHOTO_KEY, reader.result);
      showToast('success', 'Profile photo updated!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ═══════════════════════════════════════════════════════════════
  // SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════
  const handleUpgrade = (planId) => {
    setCurrentPlan(planId);
    localStorage.setItem(PLAN_KEY, planId);
    setShowPlanModal(false);
    showToast('success', planId === 'premium' ? '🎉 Upgraded to Premium! You now have 50 GB.' : 'Switched to the Free plan.');
  };

  // ═══════════════════════════════════════════════════════════════
  // AVATAR COMPONENT (reusable)
  // ═══════════════════════════════════════════════════════════════
  const Avatar = ({ size = 45, editable = false }) => (
    <div className={`avatar-wrapper ${editable ? 'editable' : ''}`} style={{ width: size, height: size }}>
      {profilePhoto
        ? <img src={profilePhoto} alt="Profile" className="avatar-img" style={{ width: size, height: size }} />
        : <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{getUserFirstName().charAt(0)}</div>
      }
      {editable && (
        <>
          <div className="avatar-overlay" onClick={() => profilePhotoRef.current?.click()}>
            <FaCamera />
          </div>
          <input ref={profilePhotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="dashboard-layout">

      {/* ─── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><FaTimes /></button>
        </div>
      )}

      {/* ─── Preview Modal ───────────────────────────────────── */}
      {previewDoc && (
        <div className="preview-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="preview-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="preview-header"><h3>{previewDoc.name}</h3><button className="preview-close" onClick={() => setPreviewDoc(null)}><FaTimes /></button></div>
            <div className="preview-body">
              {previewDoc.type === 'Image' ? <img src={previewDoc.data} alt={previewDoc.name} className="preview-image" />
                : previewDoc.mimeType === 'application/pdf' ? <iframe src={previewDoc.data} title={previewDoc.name} className="preview-pdf" />
                : <p className="preview-unsupported">Preview not available.</p>}
            </div>
            <div className="preview-footer">
              <button className="btn btn-primary btn-sm" onClick={() => handleDownload(previewDoc)}><FaDownload /> Download</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(previewDoc.id)}><FaTrashAlt /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Profile Modal ──────────────────────────────── */}
      {showEditModal && (
        <div className="preview-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="preview-header"><h3>Edit Profile</h3><button className="preview-close" onClick={() => setShowEditModal(false)}><FaTimes /></button></div>
            <div className="edit-modal-body">
              {/* Photo section inside modal */}
              <div className="edit-photo-section">
                <Avatar size={90} editable />
                <p className="edit-photo-hint">Click the camera icon to change photo</p>
              </div>
              <div className="edit-form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="edit-input" placeholder="John Doe" />
              </div>
              <div className="edit-form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="edit-input" placeholder="john@example.com" />
              </div>
              <div className="edit-form-group">
                <label>Mobile Number</label>
                <input type="tel" name="mobile" value={editForm.mobile} onChange={handleEditChange} className="edit-input" placeholder="9876543210" />
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Upgrade Plan Modal ──────────────────────────────── */}
      {showPlanModal && (
        <div className="preview-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="plan-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="preview-header"><h3>Choose Your Plan</h3><button className="preview-close" onClick={() => setShowPlanModal(false)}><FaTimes /></button></div>
            <div className="plan-modal-body">
              {/* Free Plan Card */}
              <div className={`plan-card ${currentPlan === 'free' ? 'current' : ''}`}>
                <div className="plan-card-header free-header">
                  <FaStar className="plan-card-icon" />
                  <h3>Free</h3>
                </div>
                <div className="plan-price"><span className="currency">₹</span><span className="amount">0</span><span className="period">/month</span></div>
                <ul className="plan-features">
                  {PLANS.free.features.map((f, i) => <li key={i}><FaCheckCircle className="check-icon" /> {f}</li>)}
                </ul>
                {currentPlan === 'free'
                  ? <button className="btn btn-outline btn-full" disabled>Current Plan</button>
                  : <button className="btn btn-outline btn-full" onClick={() => handleUpgrade('free')}>Downgrade</button>}
              </div>

              {/* Premium Plan Card */}
              <div className={`plan-card premium ${currentPlan === 'premium' ? 'current' : ''}`}>
                <div className="plan-popular-badge">Most Popular</div>
                <div className="plan-card-header premium-header">
                  <FaCrown className="plan-card-icon" />
                  <h3>Premium</h3>
                </div>
                <div className="plan-price"><span className="currency">₹</span><span className="amount">199</span><span className="period">/month</span></div>
                <ul className="plan-features">
                  {PLANS.premium.features.map((f, i) => <li key={i}><FaCheckCircle className="check-icon" /> {f}</li>)}
                </ul>
                {currentPlan === 'premium'
                  ? <button className="btn btn-primary btn-full" disabled>Current Plan</button>
                  : <button className="btn btn-primary btn-full" onClick={() => handleUpgrade('premium')}><FaRocket /> Upgrade Now</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo"><FaShieldAlt className="logo-icon" /><span className="logo-text">DigiLocker</span></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><FaHome className="nav-icon" /> Dashboard</button>
          <button className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}><FaFolderOpen className="nav-icon" /> My Documents</button>
          <button className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}><FaCloudUploadAlt className="nav-icon" /> Upload Document</button>
          <button className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}><FaIdCard className="nav-icon" /> KYC Update</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><FaUserCircle className="nav-icon" /> Profile</button>
        </nav>
        {/* Sidebar storage meter */}
        <div className="sidebar-storage">
          <div className="storage-label"><span>Storage</span><span>{formatSize(totalSize)} / {plan.label}</span></div>
          <div className="storage-bar-bg"><div className={`storage-bar-fill ${storagePercent > 90 ? 'danger' : storagePercent > 70 ? 'warn' : ''}`} style={{ width: `${storagePercent}%` }}></div></div>
          {currentPlan === 'free' && <button className="upgrade-sidebar-btn" onClick={() => setShowPlanModal(true)}><FaCrown /> Upgrade</button>}
        </div>
        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={onLogout}><FaSignOutAlt className="nav-icon" /> Logout</button>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <header className="dashboard-header glass-panel">
          <div className="header-search"><FaSearch className="search-icon" /><input type="text" placeholder="Search documents..." className="search-input" /></div>
          <div className="header-profile">
            <span className="welcome-text">Welcome, <strong>{getUserFirstName()}</strong> 👋</span>
            {currentPlan === 'premium' && <span className="header-badge-premium"><FaCrown /> Pro</span>}
            <Avatar size={42} />
          </div>
        </header>

        <div className="dashboard-content animate-fadeInUp">

          {/* ═══════ OVERVIEW ═══════ */}
          {activeTab === 'overview' && (
            <>
              <h2 className="content-title">Dashboard Overview</h2>

              {/* Storage warning banner */}
              {storageExceeded && (
                <div className="storage-warning">
                  <FaExclamationTriangle /> <strong>Storage full!</strong> You've used all {plan.label}. Upgrade to continue uploading.
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowPlanModal(true)}>Upgrade</button>
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-card glass-panel" style={{ '--gradient': 'var(--primary-gradient)' }}><div className="stat-info"><h3>Total Documents</h3><h2>{documents.length}</h2></div><FaFolderOpen className="stat-icon" /></div>
                <div className="stat-card glass-panel" style={{ '--gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}><div className="stat-info"><h3>Images</h3><h2>{documents.filter(d => d.type === 'Image').length}</h2></div><FaFileImage className="stat-icon" /></div>
                <div className="stat-card glass-panel" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}><div className="stat-info"><h3>Storage Used</h3><h2>{formatSize(totalSize)}</h2></div><FaCloudUploadAlt className="stat-icon" /></div>
              </div>

              {/* Storage progress bar */}
              <div className="storage-overview glass-panel mt-4">
                <div className="section-head"><h3>Storage Usage</h3><span className="storage-plan-tag">{plan.name} Plan – {plan.label}</span></div>
                <div className="storage-bar-lg-bg">
                  <div className={`storage-bar-lg-fill ${storagePercent > 90 ? 'danger' : storagePercent > 70 ? 'warn' : ''}`} style={{ width: `${storagePercent}%` }}></div>
                </div>
                <div className="storage-bar-labels"><span>{formatSize(totalSize)} used</span><span>{plan.label} total</span></div>
                {currentPlan === 'free' && <button className="btn btn-outline btn-sm mt-3" onClick={() => setShowPlanModal(true)}><FaRocket /> Need more space? Upgrade to Premium</button>}
              </div>

              {/* Recent uploads */}
              <div className="recent-activity glass-panel mt-4">
                <div className="section-head"><h3>Recent Uploads</h3><button className="btn-text" onClick={() => setActiveTab('documents')}>View All</button></div>
                {documents.length === 0
                  ? <div className="empty-state"><FaFileAlt /><p>No documents yet. <span className="link-text" onClick={() => setActiveTab('upload')}>Upload your first file!</span></p></div>
                  : <div className="table-responsive"><table className="doc-table"><thead><tr><th>Document Name</th><th>Type</th><th>Date Uploaded</th><th>Actions</th></tr></thead><tbody>
                    {documents.slice(0, 4).map(doc => (
                      <tr key={doc.id}>
                        <td><div className="doc-cell-name">{doc.type === 'PDF' ? <FaFilePdf className="text-red" /> : <FaFileImage className="text-blue" />}{doc.name}</div></td>
                        <td><span className={`badge ${doc.type.toLowerCase()}`}>{doc.type}</span></td>
                        <td>{formatDate(doc.date)}</td>
                        <td><div className="action-btns"><button className="icon-btn" title="Preview" onClick={() => setPreviewDoc(doc)}><FaEye /></button><button className="icon-btn" title="Download" onClick={() => handleDownload(doc)}><FaDownload /></button><button className="icon-btn danger" title="Delete" onClick={() => handleDelete(doc.id)}><FaTrashAlt /></button></div></td>
                      </tr>
                    ))}
                  </tbody></table></div>
                }
              </div>
            </>
          )}

          {/* ═══════ DOCUMENTS ═══════ */}
          {activeTab === 'documents' && (
            <>
              <div className="section-head"><h2 className="content-title">My Documents</h2><button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>+ Upload New</button></div>
              {documents.length === 0
                ? <div className="empty-state-large glass-panel"><FaFolderOpen className="empty-icon" /><h3>Your vault is empty</h3><p>Upload your first document to get started.</p><button className="btn btn-primary mt-3" onClick={() => setActiveTab('upload')}>Upload Document</button></div>
                : <div className="recent-activity glass-panel mt-4"><div className="table-responsive"><table className="doc-table"><thead><tr><th>Document Name</th><th>Type</th><th>Size</th><th>Date Uploaded</th><th>Actions</th></tr></thead><tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td><div className="doc-cell-name">{doc.type === 'PDF' ? <FaFilePdf className="text-red" /> : <FaFileImage className="text-blue" />}{doc.name}</div></td>
                      <td><span className={`badge ${doc.type.toLowerCase()}`}>{doc.type}</span></td>
                      <td>{formatSize(doc.size)}</td>
                      <td>{formatDate(doc.date)}</td>
                      <td><div className="action-btns"><button className="icon-btn" title="Preview" onClick={() => setPreviewDoc(doc)}><FaEye /></button><button className="icon-btn" title="Download" onClick={() => handleDownload(doc)}><FaDownload /></button><button className="icon-btn danger" title="Delete" onClick={() => handleDelete(doc.id)}><FaTrashAlt /></button></div></td>
                    </tr>
                  ))}
                </tbody></table></div></div>
              }
            </>
          )}

          {/* ═══════ UPLOAD ═══════ */}
          {activeTab === 'upload' && (
            <>
              <h2 className="content-title">Upload a Document</h2>
              <p className="content-subtitle">Securely store files into your encrypted vault.</p>

              {/* Storage exceeded warning */}
              {storageExceeded && (
                <div className="storage-warning mb-4">
                  <FaExclamationTriangle /> <strong>Storage full!</strong> Delete some files or upgrade your plan.
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowPlanModal(true)}>Upgrade</button>
                </div>
              )}

              <div className={`upload-zone glass-panel ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''} ${storageExceeded ? 'disabled' : ''}`}
                onDragOver={!storageExceeded ? handleDragOver : undefined}
                onDragLeave={!storageExceeded ? handleDragLeave : undefined}
                onDrop={!storageExceeded ? handleDrop : undefined}>
                {isUploading
                  ? <div className="upload-progress"><div className="upload-spinner"></div><h3>Reading and storing your file...</h3><p>This will only take a moment.</p></div>
                  : <>
                    <div className="upload-icon-pulse"><FaCloudUploadAlt /></div>
                    <h3>{storageExceeded ? 'Storage limit reached' : 'Drag & Drop your files here'}</h3>
                    <p>{storageExceeded ? 'Upgrade to Premium for 50 GB of space.' : 'or click to browse from your device'}</p>
                    {!storageExceeded && <>
                      <input ref={fileInputRef} type="file" id="file-upload" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleBrowse} />
                      <label htmlFor="file-upload" className="btn btn-primary mt-3">Browse Files</label>
                    </>}
                    <div className="upload-limits"><span>Supported: PDF, JPEG, PNG</span><span>Max per file: 10 MB</span><span>Plan limit: {plan.label}</span></div>
                  </>}
              </div>
            </>
          )}

          {/* ═══════ PROFILE ═══════ */}
          {activeTab === 'profile' && user && (
            <>
              <h2 className="content-title">Account Profile</h2>

              <div className="profile-card glass-panel mt-4">
                <div className="profile-header">
                  <Avatar size={100} editable />
                  <div className="profile-info">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <div className="profile-badges">
                      <span className="badge verified">Verified User</span>
                      {currentPlan === 'premium' && <span className="badge premium-badge"><FaCrown /> Premium</span>}
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm edit-profile-btn" onClick={openEditModal}><FaPen /> Edit Profile</button>
                </div>

                <div className="profile-details mt-4">
                  <div className="detail-group"><label>Mobile Number</label><p>{user.mobile}</p></div>
                  <div className="detail-group"><label>Account Created</label><p>{new Date(user.createdAt).toLocaleDateString()}</p></div>
                  <div className="detail-group"><label>Storage Used</label><p>{formatSize(totalSize)} of {plan.label}</p></div>
                  <div className="detail-group"><label>Current Plan</label><p>{plan.name} {currentPlan === 'premium' && '✨'}</p></div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="subscription-section mt-4">
                <div className="section-head"><h3>Subscription Plan</h3></div>
                <div className="plan-cards-inline">
                  {/* Current plan summary */}
                  <div className={`plan-inline-card glass-panel ${currentPlan === 'premium' ? 'premium-active' : ''}`}>
                    <div className="plan-inline-top">
                      {currentPlan === 'premium' ? <FaCrown className="plan-inline-icon gold" /> : <FaStar className="plan-inline-icon" />}
                      <div>
                        <h4>{plan.name} Plan</h4>
                        <p className="plan-inline-price">₹{plan.price}<span>/month</span></p>
                      </div>
                    </div>
                    <div className="plan-inline-storage">
                      <div className="storage-bar-lg-bg"><div className={`storage-bar-lg-fill ${storagePercent > 90 ? 'danger' : storagePercent > 70 ? 'warn' : ''}`} style={{ width: `${storagePercent}%` }}></div></div>
                      <div className="storage-bar-labels"><span>{formatSize(totalSize)}</span><span>{plan.label}</span></div>
                    </div>
                    <button className="btn btn-primary btn-full mt-3" onClick={() => setShowPlanModal(true)}>
                      {currentPlan === 'free' ? <><FaRocket /> Upgrade to Premium</> : 'Manage Plan'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════ KYC UPDATE ═══════ */}
          {activeTab === 'kyc' && (
            <KycUpdate showToast={showToast} />
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
