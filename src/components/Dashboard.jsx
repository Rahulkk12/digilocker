import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaSignOutAlt, FaHome, FaFolderOpen, FaCloudUploadAlt, FaUserCircle, FaSearch, FaFilePdf, FaFileImage, FaEllipsisH } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  
  // Dummy Document Data
  const [documents, setDocuments] = useState([
    { id: 1, name: "Aadhaar_Card.pdf", type: "PDF", date: "Oct 12, 2025", size: "1.2 MB" },
    { id: 2, name: "Driving_License.jpg", type: "Image", date: "Sep 05, 2025", size: "840 KB" },
    { id: 3, name: "Class_12_Marksheet.pdf", type: "PDF", date: "Aug 20, 2024", size: "2.5 MB" },
    { id: 4, name: "COVID_Vaccine_Cert.pdf", type: "PDF", date: "Jan 10, 2024", size: "450 KB" }
  ]);
  
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const activeUser = localStorage.getItem('activeDigiLockerUser');
    if (activeUser) {
      setUser(JSON.parse(activeUser));
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Frontend MOCK upload logic
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const newDoc = {
        id: Date.now(),
        name: files[0].name,
        type: files[0].type.includes('pdf') ? 'PDF' : 'Image',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: (files[0].size / 1024 / 1024).toFixed(1) + ' MB'
      };
      setDocuments([newDoc, ...documents]);
      setActiveTab('documents'); // Auto redirect to documents
      alert(`Successfully simulated upload of ${files[0].name}`);
    }
  };

  const getUserFirstName = () => {
    if (!user) return "User";
    return user.name.split(' ')[0];
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <FaShieldAlt className="logo-icon" />
          <span className="logo-text">DigiLocker</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaHome className="nav-icon" /> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FaFolderOpen className="nav-icon" /> My Documents
          </button>
          <button 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FaCloudUploadAlt className="nav-icon" /> Upload Document
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUserCircle className="nav-icon" /> Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={onLogout}>
            <FaSignOutAlt className="nav-icon" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-header glass-panel">
          <div className="header-search">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search documents..." className="search-input" />
          </div>
          <div className="header-profile">
            <span className="welcome-text">Welcome, <strong>{getUserFirstName()}</strong> 👋</span>
            <div className="avatar">
              {getUserFirstName().charAt(0)}
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="dashboard-content animate-fadeInUp">
          
          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <>
              <h2 className="content-title">Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card glass-panel" style={{ '--gradient': 'var(--primary-gradient)' }}>
                  <div className="stat-info">
                    <h3>Total Documents</h3>
                    <h2>{documents.length}</h2>
                  </div>
                  <FaFolderOpen className="stat-icon" />
                </div>
                <div className="stat-card glass-panel" style={{ '--gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <div className="stat-info">
                    <h3>Verified By Govt.</h3>
                    <h2>2</h2>
                  </div>
                  <FaShieldAlt className="stat-icon" />
                </div>
                <div className="stat-card glass-panel" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <div className="stat-info">
                    <h3>Uploaded Files</h3>
                    <h2>{documents.length - 2}</h2>
                  </div>
                  <FaCloudUploadAlt className="stat-icon" />
                </div>
              </div>

              <div className="recent-activity glass-panel mt-4">
                <div className="section-head">
                  <h3>Recent Activity</h3>
                  <button className="btn-text" onClick={() => setActiveTab('documents')}>View All</button>
                </div>
                <div className="table-responsive">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Date Uploaded</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.slice(0, 3).map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="doc-cell-name">
                              {doc.type === 'PDF' ? <FaFilePdf className="text-red" /> : <FaFileImage className="text-blue" />}
                              {doc.name}
                            </div>
                          </td>
                          <td><span className={`badge ${doc.type.toLowerCase()}`}>{doc.type}</span></td>
                          <td>{doc.date}</td>
                          <td><FaEllipsisH className="action-icon" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Documents Tab Content */}
          {activeTab === 'documents' && (
            <>
              <div className="section-head">
                <h2 className="content-title">My Documents</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>+ New Document</button>
              </div>
              <div className="recent-activity glass-panel mt-4">
                <div className="table-responsive">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Date Uploaded</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="doc-cell-name">
                              {doc.type === 'PDF' ? <FaFilePdf className="text-red" /> : <FaFileImage className="text-blue" />}
                              {doc.name}
                            </div>
                          </td>
                          <td><span className={`badge ${doc.type.toLowerCase()}`}>{doc.type}</span></td>
                          <td>{doc.size}</td>
                          <td>{doc.date}</td>
                          <td><FaEllipsisH className="action-icon" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Upload Tab Content */}
          {activeTab === 'upload' && (
            <>
              <h2 className="content-title">Upload a Document</h2>
              <p className="content-subtitle">Securely store files into your encrypted vault.</p>
              
              <div 
                className={`upload-zone glass-panel ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-icon-pulse">
                  <FaCloudUploadAlt />
                </div>
                <h3>Drag & Drop your files here</h3>
                <p>or click to browse from your device</p>
                
                <input type="file" id="file-upload" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files.length) {
                    alert(`Simulating upload of ${e.target.files[0].name}`);
                    setActiveTab('documents');
                  }
                }} />
                <label htmlFor="file-upload" className="btn btn-primary mt-3">Browse Files</label>
                
                <div className="upload-limits">
                  <span>Supported formats: PDF, JPEG, PNG</span>
                  <span>Max file size: 10MB</span>
                </div>
              </div>
            </>
          )}

          {/* Profile Tab Content */}
          {activeTab === 'profile' && user && (
            <>
              <h2 className="content-title">Account Profile</h2>
              <div className="profile-card glass-panel mt-4">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {getUserFirstName().charAt(0)}
                  </div>
                  <div className="profile-info">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className="badge verified">Verified User</span>
                  </div>
                </div>
                <div className="profile-details mt-4">
                  <div className="detail-group">
                    <label>Mobile Number</label>
                    <p>{user.mobile}</p>
                  </div>
                  <div className="detail-group">
                    <label>Account Created</label>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-group">
                    <label>Storage Used</label>
                    <p>4.6 MB of 1GB</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
