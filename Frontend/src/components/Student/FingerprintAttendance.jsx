import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FingerprintAttendance = ({ onAttendanceMarked }) => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkFingerprintStatus();
  }, [user]);

  const checkFingerprintStatus = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/attendance/fingerprint-status/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasFingerprint(data.hasFingerprint);
      } else {
        const errorData = await response.json();
        console.error('Fingerprint status error:', errorData.error);
        setHasFingerprint(false);
      }
    } catch (err) {
      console.error('Error checking fingerprint status:', err);
      setHasFingerprint(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyFingerprint = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setError('WebAuthn is not supported in this browser');
      return;
    }

    setIsVerifying(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Get authentication options
      const optionsResponse = await fetch('http://localhost:8080/api/attendance/authentication-options', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Convert Base64URL strings to ArrayBuffers
      const credentialRequestOptions = {
        publicKey: {
          challenge: base64URLToArrayBuffer(options.challenge),
          timeout: options.timeout,
          rpId: options.rpId,
          allowCredentials: options.allowCredentials.map(cred => ({
            ...cred,
            id: base64URLToArrayBuffer(cred.id),
          })),
          userVerification: options.userVerification,
        },
      };

      // Step 2: Get assertion
      setMessage('Please use your fingerprint sensor...');
      const assertion = await navigator.credentials.get(credentialRequestOptions);

      if (!assertion) {
        throw new Error('Failed to get assertion');
      }

      // Step 3: Send assertion to server
      const authenticationData = {
        id: assertion.id,
        rawId: arrayBufferToBase64URL(assertion.rawId),
        type: assertion.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(assertion.response.clientDataJSON),
          authenticatorData: arrayBufferToBase64URL(assertion.response.authenticatorData),
          signature: arrayBufferToBase64URL(assertion.response.signature),
          userHandle: assertion.response.userHandle ? 
            arrayBufferToBase64URL(assertion.response.userHandle) : null,
        },
        userId: user.id,
      };

      const verifyResponse = await fetch('http://localhost:8080/api/attendance/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authenticationData),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Failed to verify fingerprint');
      }

      const result = await verifyResponse.json();
      setMessage(result.message);
      
      // Notify parent component
      if (onAttendanceMarked) {
        onAttendanceMarked();
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Fingerprint verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Utility functions for Base64URL conversion
  const base64URLToArrayBuffer = (base64URL) => {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  };

  const arrayBufferToBase64URL = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Checking fingerprint status...</p>
      </div>
    );
  }

  if (!hasFingerprint) {
    return (
      <div className="text-center p-3">
        <i className="fas fa-fingerprint fa-2x text-muted mb-2"></i>
        <p className="text-muted">No fingerprint registered</p>
        <small className="text-muted">
          Please register your fingerprint first to use this feature.
        </small>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-3">
        <i className={`fas fa-fingerprint fa-4x ${message ? 'text-success' : 'text-primary'}`}></i>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {message && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle me-2"></i>
          {message}
        </div>
      )}
      
      <button
        className={`btn ${message ? 'btn-success' : 'btn-primary'} btn-lg`}
        onClick={verifyFingerprint}
        disabled={isVerifying || !!message}
      >
        {isVerifying ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Verifying...
          </>
        ) : message ? (
          <>
            <i className="fas fa-check me-2"></i>
            Attendance Marked
          </>
        ) : (
          <>
            <i className="fas fa-fingerprint me-2"></i>
            Use Fingerprint
          </>
        )}
      </button>
      
      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Touch your fingerprint sensor when prompted
        </small>
      </div>
    </div>
  );
};

export default FingerprintAttendance;