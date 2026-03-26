import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaIdCard, FaCloudUploadAlt, FaCamera, FaCheckCircle,
  FaTimes, FaArrowRight, FaArrowLeft, FaFilePdf, FaFileImage,
  FaRedo, FaSpinner, FaExclamationTriangle, FaShieldAlt,
  FaTrashAlt, FaVideo
} from 'react-icons/fa';
import './KycUpdate.css';

// ─── Constants ───────────────────────────────────────────────────
const KYC_KEY = 'digiLockerKyc';
const MAX_DOC_SIZE = 2 * 1024 * 1024; // 2 MB limit for KYC docs
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

// ─── Step definitions ────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Aadhaar Details', icon: <FaIdCard /> },
  { id: 2, label: 'Upload Document', icon: <FaCloudUploadAlt /> },
  { id: 3, label: 'Live Photo', icon: <FaCamera /> }
];

// ─── Aadhaar formatting helper ───────────────────────────────────
const formatAadhaar = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const KycUpdate = ({ showToast }) => {
  // ─── State ─────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [docFile, setDocFile] = useState(null);       // { name, type, data (base64) }
  const [docError, setDocError] = useState('');
  const [livePhoto, setLivePhoto] = useState(null);   // base64 data URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState('not_verified'); // not_verified | pending | verified
  const [existingKyc, setExistingKyc] = useState(null);

  // ─── Camera state & refs ───────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false); // true once video is playing

  // ─── Load existing KYC data ────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(KYC_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setExistingKyc(data);
      setKycStatus(data.status || 'pending');
      setAadhaar(formatAadhaar(data.aadhaar || ''));
      if (data.document) setDocFile(data.document);
      if (data.livePhoto) setLivePhoto(data.livePhoto);
    }
  }, []);

  // ─── Cleanup camera on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      // Stop all camera tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ─── KEY FIX: Attach stream to video element when both are available ──
  // This useEffect fires whenever cameraActive changes. When the video
  // element renders (because cameraActive is true), we attach the stream.
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      // Handle the video playing event to confirm camera is ready
      const handlePlaying = () => setCameraReady(true);
      video.addEventListener('playing', handlePlaying);

      video.play().catch((err) => {
        console.error('Video play failed:', err);
        setCameraError('Could not play camera stream. Please try again.');
      });

      return () => {
        video.removeEventListener('playing', handlePlaying);
      };
    }
  }, [cameraActive]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1 — Aadhaar Number Validation
  // ═══════════════════════════════════════════════════════════════
  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaar(formatted);
    setAadhaarError('');
  };

  const validateStep1 = () => {
    const digits = aadhaar.replace(/\s/g, '');
    if (!digits) { setAadhaarError('Aadhaar number is required.'); return false; }
    if (digits.length !== 12) { setAadhaarError('Aadhaar must be exactly 12 digits.'); return false; }
    if (!/^\d{12}$/.test(digits)) { setAadhaarError('Aadhaar must contain only digits.'); return false; }
    return true;
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 2 — Document Upload
  // ═══════════════════════════════════════════════════════════════
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocError('');

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setDocError('Only PDF, JPG, and PNG files are accepted.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      setDocError('File size must be under 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocFile({
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Image',
        mimeType: file.type,
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDoc = () => setDocFile(null);

  const validateStep2 = () => {
    if (!docFile) { setDocError('Please upload your Aadhaar card.'); return false; }
    return true;
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 3 — Camera: Start, Capture, Stop, Retake
  // ═══════════════════════════════════════════════════════════════

  /**
   * startCamera — Requests camera permission, stores the stream,
   * then sets cameraActive=true so the <video> element renders.
   * The useEffect above will then attach the stream to the video.
   */
  const startCamera = useCallback(async () => {
    // Reset state
    setCameraError('');
    setCameraReady(false);
    setCameraLoading(true);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      // Store the stream in ref
      streamRef.current = stream;

      // Set cameraActive so the <video> element renders in the DOM
      // The useEffect will then attach the stream to videoRef
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraLoading(false);
      setCameraActive(false);

      // User-friendly error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permission in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect a webcam and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is being used by another application. Please close other apps using the camera.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please check your device settings.');
      }
    }
  }, []);

  /**
   * stopCamera — Stops all tracks and resets camera state
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  /**
   * capturePhoto — Grabs current video frame onto a hidden canvas
   * and converts it to a base64 PNG data URL
   */
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error('Video or canvas ref not available');
      return;
    }

    // Make sure video has actual dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Camera is still initializing. Please wait a moment and try again.');
      return;
    }

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Mirror the image horizontally for a natural selfie look
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Convert canvas to base64 PNG
    const dataUrl = canvas.toDataURL('image/png');

    // Verify we got a valid image (not empty)
    if (!dataUrl || dataUrl === 'data:,') {
      setCameraError('Failed to capture image. Please try again.');
      return;
    }

    // Save the captured photo and stop the camera
    setLivePhoto(dataUrl);

    // Also save immediately to localStorage for persistence
    localStorage.setItem('kyc_live_photo', dataUrl);

    stopCamera();
  }, [stopCamera]);

  /**
   * retakePhoto — Clears the captured photo and restarts the camera
   */
  const retakePhoto = useCallback(() => {
    setLivePhoto(null);
    localStorage.removeItem('kyc_live_photo');
    // Small delay to allow React to re-render before starting camera
    setTimeout(() => startCamera(), 100);
  }, [startCamera]);

  const validateStep3 = () => {
    if (!livePhoto) {
      setCameraError('Please capture a live photo.');
      return false;
    }
    return true;
  };

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  const goNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Auto-start camera when entering step 3
      if (nextStep === 3 && !livePhoto) {
        // Delay to allow the step 3 UI to render first
        setTimeout(() => startCamera(), 500);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      if (currentStep === 3) stopCamera();
      setCurrentStep(prev => prev - 1);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SUBMIT KYC
  // ═══════════════════════════════════════════════════════════════
  const handleSubmitKyc = () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const kycData = {
        aadhaar: aadhaar.replace(/\s/g, ''),
        document: docFile,
        livePhoto: livePhoto,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem(KYC_KEY, JSON.stringify(kycData));
      setExistingKyc(kycData);
      setKycStatus('pending');
      setIsSubmitting(false);
      showToast('success', 'KYC submitted successfully! Verification is in progress. ✅');
    }, 2000);
  };

  // ─── Re-submit / Edit KYC ─────────────────────────────────────
  const handleResubmit = () => {
    setCurrentStep(1);
    setKycStatus('not_verified');
    setExistingKyc(null);
    setLivePhoto(null);
    localStorage.removeItem('kyc_live_photo');
  };

  // ─── Status badge component ────────────────────────────────────
  const StatusBadge = () => {
    const map = {
      not_verified: { label: 'Not Verified', cls: 'status-not-verified' },
      pending:      { label: 'Pending Review', cls: 'status-pending' },
      verified:     { label: 'Verified', cls: 'status-verified' }
    };
    const s = map[kycStatus];
    return <span className={`kyc-status-badge ${s.cls}`}>{s.label}</span>;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER — Already Submitted View
  // ═══════════════════════════════════════════════════════════════
  if (existingKyc && kycStatus !== 'not_verified') {
    return (
      <div className="kyc-page">
        <h2 className="content-title">KYC Verification</h2>

        <div className="kyc-status-card glass-panel">
          <div className="kyc-status-header">
            <div className={`kyc-status-icon-wrap ${kycStatus}`}>
              {kycStatus === 'verified' ? <FaCheckCircle /> : <FaShieldAlt />}
            </div>
            <div>
              <h3>KYC Status: <StatusBadge /></h3>
              <p className="kyc-submitted-date">
                Submitted on {new Date(existingKyc.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Summary grid */}
          <div className="kyc-summary-grid">
            <div className="kyc-summary-item">
              <label>Aadhaar Number</label>
              <p>{formatAadhaar(existingKyc.aadhaar)}</p>
            </div>
            <div className="kyc-summary-item">
              <label>Uploaded Document</label>
              <p>{existingKyc.document?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Preview row */}
          <div className="kyc-preview-row">
            {existingKyc.document && existingKyc.document.mimeType !== 'application/pdf' && (
              <div className="kyc-thumb-card">
                <span className="kyc-thumb-label">Aadhaar Card</span>
                <img src={existingKyc.document.data} alt="Aadhaar" className="kyc-thumb-img" />
              </div>
            )}
            {existingKyc.livePhoto && (
              <div className="kyc-thumb-card">
                <span className="kyc-thumb-label">Live Photo</span>
                <img src={existingKyc.livePhoto} alt="Live Capture" className="kyc-thumb-img" />
              </div>
            )}
          </div>

          <button className="btn btn-outline mt-3" onClick={handleResubmit}>
            <FaRedo /> Re-submit KYC
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — KYC Form (Stepper)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="kyc-page">
      <div className="kyc-title-row">
        <h2 className="content-title">KYC Verification</h2>
        <StatusBadge />
      </div>
      <p className="content-subtitle">Complete the steps below to verify your identity.</p>

      {/* ─── Stepper ─────────────────────────────────────────── */}
      <div className="kyc-stepper">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div
              className={`kyc-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              onClick={() => {
                if (step.id < currentStep) {
                  if (currentStep === 3) stopCamera();
                  setCurrentStep(step.id);
                }
              }}
            >
              <div className="kyc-step-circle">
                {currentStep > step.id ? <FaCheckCircle /> : step.icon}
              </div>
              <span className="kyc-step-label">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`kyc-step-line ${currentStep > step.id ? 'filled' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ─── Step Content ────────────────────────────────────── */}
      <div className="kyc-form-card glass-panel">

        {/* STEP 1 — Aadhaar Input */}
        {currentStep === 1 && (
          <div className="kyc-step-content animate-fadeInUp">
            <div className="kyc-step-header">
              <FaIdCard className="kyc-step-icon" />
              <div>
                <h3>Enter Your Aadhaar Number</h3>
                <p>Your 12-digit Aadhaar number issued by UIDAI</p>
              </div>
            </div>

            <div className="kyc-form-group">
              <label htmlFor="aadhaar-input">Aadhaar Number</label>
              <div className={`kyc-input-wrapper ${aadhaarError ? 'has-error' : ''}`}>
                <FaIdCard className="kyc-input-icon" />
                <input
                  id="aadhaar-input"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={handleAadhaarChange}
                  maxLength={14}
                  className="kyc-input"
                />
                {aadhaar && (
                  <span className={`kyc-digit-counter ${aadhaar.replace(/\s/g, '').length === 12 ? 'valid' : ''}`}>
                    {aadhaar.replace(/\s/g, '').length}/12
                  </span>
                )}
              </div>
              {aadhaarError && <span className="kyc-error"><FaExclamationTriangle /> {aadhaarError}</span>}
            </div>

            <div className="kyc-info-box">
              <FaShieldAlt />
              <p>Your Aadhaar data is securely stored locally on your device and is never transmitted to any server.</p>
            </div>
          </div>
        )}

        {/* STEP 2 — Document Upload */}
        {currentStep === 2 && (
          <div className="kyc-step-content animate-fadeInUp">
            <div className="kyc-step-header">
              <FaCloudUploadAlt className="kyc-step-icon" />
              <div>
                <h3>Upload Aadhaar Card</h3>
                <p>Upload a clear scan or photo of your Aadhaar card (front side)</p>
              </div>
            </div>

            {docFile ? (
              <div className="kyc-doc-preview">
                <div className="kyc-doc-info">
                  {docFile.type === 'PDF' ? <FaFilePdf className="text-red" /> : <FaFileImage className="text-blue" />}
                  <span className="kyc-doc-name">{docFile.name}</span>
                  <button className="icon-btn danger" onClick={removeDoc} title="Remove"><FaTrashAlt /></button>
                </div>
                {docFile.mimeType !== 'application/pdf' && (
                  <img src={docFile.data} alt="Aadhaar preview" className="kyc-doc-img-preview" />
                )}
                {docFile.mimeType === 'application/pdf' && (
                  <div className="kyc-pdf-placeholder">
                    <FaFilePdf />
                    <span>PDF Document Uploaded</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="kyc-upload-area">
                <div className="kyc-upload-icon-wrap"><FaCloudUploadAlt /></div>
                <h4>Drag & drop or click to upload</h4>
                <p>Accepted: JPG, PNG, PDF (max 2 MB)</p>
                <input type="file" id="kyc-doc-upload" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleDocUpload} />
                <label htmlFor="kyc-doc-upload" className="btn btn-primary mt-3">Choose File</label>
              </div>
            )}
            {docError && <span className="kyc-error mt-3"><FaExclamationTriangle /> {docError}</span>}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3 — Live Photo Capture (FIXED)
            ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="kyc-step-content animate-fadeInUp">
            <div className="kyc-step-header">
              <FaCamera className="kyc-step-icon" />
              <div>
                <h3>Capture Live Photo</h3>
                <p>Take a clear selfie for identity verification</p>
              </div>
            </div>

            <div className="kyc-camera-area">

              {/* ── STATE A: Photo already captured ─────────────── */}
              {livePhoto ? (
                <div className="kyc-captured-wrap">
                  <div className="kyc-captured-badge"><FaCheckCircle /> Photo Captured</div>
                  <img src={livePhoto} alt="Captured selfie" className="kyc-captured-img" />
                  <button className="btn btn-outline btn-sm mt-3" onClick={retakePhoto}>
                    <FaRedo /> Retake Photo
                  </button>
                </div>

              /* ── STATE B: Camera loading (getting permission) ── */
              ) : cameraLoading ? (
                <div className="kyc-camera-placeholder">
                  <div className="kyc-camera-loading-spinner"></div>
                  <h4>Starting Camera...</h4>
                  <p>Please allow camera access when prompted by your browser.</p>
                </div>

              /* ── STATE C: Camera is active — show live feed ──── */
              ) : cameraActive ? (
                <div className="kyc-video-wrap">
                  {/* The video element — stream is attached via useEffect */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="kyc-video-feed"
                  />

                  {/* Face guide overlay */}
                  <div className="kyc-video-overlay">
                    <div className="kyc-face-guide"></div>
                    <span className="kyc-face-hint">Position your face within the oval</span>
                  </div>

                  {/* Camera status indicator */}
                  {!cameraReady && (
                    <div className="kyc-camera-initializing">
                      <FaSpinner className="spinner" /> Initializing...
                    </div>
                  )}

                  {/* Capture button — only enabled when camera feed is ready */}
                  <button
                    className="kyc-capture-btn"
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    type="button"
                  >
                    <div className="capture-btn-inner">
                      <FaCamera /> Capture Photo
                    </div>
                  </button>
                </div>

              /* ── STATE D: Camera not yet started ────────────── */
              ) : (
                <div className="kyc-camera-placeholder">
                  <div className="kyc-camera-icon-container">
                    <FaVideo className="kyc-camera-big-icon" />
                  </div>
                  <h4>Camera Preview</h4>
                  <p>Click the button below to enable your camera and take a selfie.</p>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={startCamera}
                    type="button"
                  >
                    <FaCamera /> Start Camera
                  </button>
                </div>
              )}

              {/* Camera error message */}
              {cameraError && (
                <div className="kyc-camera-error mt-3">
                  <FaExclamationTriangle />
                  <span>{cameraError}</span>
                  <button className="btn btn-outline btn-sm" onClick={startCamera}>
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Hidden canvas used for capturing frame from video */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {/* ─── Navigation Buttons ────────────────────────────── */}
        <div className="kyc-nav-buttons">
          {currentStep > 1 && (
            <button className="btn btn-outline" onClick={goBack}>
              <FaArrowLeft /> Previous
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < 3 ? (
            <button className="btn btn-primary" onClick={goNext}>
              Next Step <FaArrowRight />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmitKyc} disabled={isSubmitting}>
              {isSubmitting ? <><FaSpinner className="spinner" /> Submitting...</> : <><FaCheckCircle /> Submit KYC</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycUpdate;
