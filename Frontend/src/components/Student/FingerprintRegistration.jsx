import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FingerprintRegistration = () => {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
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
        setError(errorData.error || 'Failed to check fingerprint status');
      }
    } catch (err) {
      console.error('Error checking fingerprint status:', err);
      setError('Failed to check fingerprint status');
    } finally {
      setLoading(false);
    }
  };

  const registerFingerprint = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setError('WebAuthn is not supported in this browser');
      return;
    }

    setIsRegistering(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Get registration options
      const optionsResponse = await fetch('http://localhost:8080/api/attendance/registration-options', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Convert Base64URL strings to ArrayBuffers
      const credentialCreationOptions = {
        publicKey: {
          challenge: base64URLToArrayBuffer(options.challenge),
          rp: options.rp,
          user: {
            ...options.user,
            id: base64URLToArrayBuffer(options.user.id),
          },
          pubKeyCredParams: options.pubKeyCredParams,
          authenticatorSelection: options.authenticatorSelection,
          timeout: options.timeout,
          attestation: options.attestation,
        },
      };

      // Step 2: Create credential
      setMessage('Please use your fingerprint sensor...');
      const credential = await navigator.credentials.create(credentialCreationOptions);

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Step 3: Send credential to server
      const registrationData = {
        id: credential.id,
        rawId: arrayBufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(credential.response.clientDataJSON),
          attestationObject: arrayBufferToBase64URL(credential.response.attestationObject),
        },
        userId: user.id,
      };

      const registerResponse = await fetch('http://localhost:8080/api/attendance/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || 'Failed to register fingerprint');
      }

      const result = await registerResponse.json();
      setMessage(result.message);
      setHasFingerprint(true);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Fingerprint registration failed');
    } finally {
      setIsRegistering(false);
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
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking fingerprint status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-fingerprint me-2"></i>
          Fingerprint Registration
        </h5>
      </div>
      <div className="card-body">
        {hasFingerprint ? (
          <div className="text-center">
            <div className="mb-3">
              <i className="fas fa-fingerprint fa-4x text-success"></i>
            </div>
            <h6 className="text-success">Fingerprint Registered</h6>
            <p className="text-muted">
              You can now use your fingerprint to mark attendance quickly and securely.
            </p>
            <div className="alert alert-info">
              <small>
                <i className="fas fa-info-circle me-1"></i>
                Only one fingerprint can be registered per user. To register a new fingerprint, 
                please contact your administrator.
              </small>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-3">
              <i className="fas fa-fingerprint fa-4x text-muted"></i>
            </div>
            <h6>Register Your Fingerprint</h6>
            <p className="text-muted mb-4">
              Register your fingerprint to quickly mark attendance without entering codes.
            </p>
            
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
              className="btn btn-primary"
              onClick={registerFingerprint}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Registering...
                </>
              ) : (
                <>
                  <i className="fas fa-fingerprint me-2"></i>
                  Register Fingerprint
                </>
              )}
            </button>
            
            <div className="alert alert-info mt-3">
              <small>
                <strong>Requirements:</strong>
                <ul className="list-unstyled mt-2 mb-0">
                  <li><i className="fas fa-check text-success me-2"></i>Modern browser with WebAuthn support</li>
                  <li><i className="fas fa-check text-success me-2"></i>Fingerprint sensor on your device</li>
                  <li><i className="fas fa-check text-success me-2"></i>HTTPS connection (localhost allowed)</li>
                </ul>
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FingerprintRegistration;