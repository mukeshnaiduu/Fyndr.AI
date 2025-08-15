import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';

const SecurityTab = ({ userProfile, onUpdateProfile }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userProfile.twoFactorEnabled || false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Mumbai, Maharashtra',
      lastActive: '2 minutes ago',
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Pune, Maharashtra',
      lastActive: '1 hour ago',
      current: false,
      ip: '192.168.1.101'
    },
    {
      id: 3,
      device: 'Firefox on MacOS',
      location: 'Hyderabad, Telangana',
      lastActive: '2 days ago',
      current: false,
      ip: '10.0.0.50'
    }
  ]);

  const [errors, setErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength for new password
    if (name === 'newPassword') {
      calculatePasswordStrength(value);
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-error';
      case 2: return 'bg-warning';
      case 3: return 'bg-accent';
      case 4:
      case 5: return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (passwordStrength < 3) {
      newErrors.newPassword = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      setIsChangingPassword(true);

      // Simulate API call
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength(0);
        // Show success message
        alert('Password changed successfully!');
      }, 2000);
    }
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true);
    } else {
      // Disable 2FA
      setTwoFactorEnabled(false);
      setShowQRCode(false);
      setVerificationCode('');
    }
  };

  const handleTwoFactorVerification = () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
      alert('Two-factor authentication enabled successfully!');
    }
  };

  const handleTerminateSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const handleTerminateAllSessions = () => {
    setActiveSessions(prev => prev.filter(session => session.current));
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="glassmorphic p-6 rounded-squircle">
        <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
          <Icon name="Lock" size={20} className="mr-2" />
          Change Password
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={errors.currentPassword}
            required
            placeholder="Enter your current password"
          />

          <div className="space-y-2">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={errors.newPassword}
              required
              placeholder="Enter your new password"
            />

            {passwordData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-body font-body-medium ${passwordStrength < 3 ? 'text-error' : 'text-success'
                    }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full spring-transition ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className={passwordData.newPassword.length >= 8 ? 'text-success' : 'text-muted-foreground'}>
                    ✓ At least 8 characters
                  </p>
                  <p className={passwordData.newPassword.match(/[a-z]/) ? 'text-success' : 'text-muted-foreground'}>
                    ✓ Lowercase letter
                  </p>
                  <p className={passwordData.newPassword.match(/[A-Z]/) ? 'text-success' : 'text-muted-foreground'}>
                    ✓ Uppercase letter
                  </p>
                  <p className={passwordData.newPassword.match(/[0-9]/) ? 'text-success' : 'text-muted-foreground'}>
                    ✓ Number
                  </p>
                  <p className={passwordData.newPassword.match(/[^a-zA-Z0-9]/) ? 'text-success' : 'text-muted-foreground'}>
                    ✓ Special character
                  </p>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={errors.confirmPassword}
            required
            placeholder="Confirm your new password"
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="default"
              loading={isChangingPassword}
              iconName="Save"
              iconPosition="left"
              iconSize={16}
              className="glow-primary"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glassmorphic p-6 rounded-squircle">
        <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2" />
          Two-Factor Authentication
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-squircle">
            <div>
              <h4 className="font-body font-body-medium text-foreground">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={handleTwoFactorToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full spring-transition ${twoFactorEnabled ? 'bg-success' : 'bg-muted'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white spring-transition ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {showQRCode && (
            <div className="p-4 border border-border rounded-squircle space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-muted rounded-squircle mx-auto mb-4 flex items-center justify-center">
                  <Icon name="QrCode" size={64} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app
                </p>
                <p className="text-xs text-muted-foreground font-data bg-muted p-2 rounded">
                  Manual entry: JBSWY3DPEHPK3PXP
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Verification Code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <Button
                  variant="default"
                  onClick={handleTwoFactorVerification}
                  disabled={verificationCode.length !== 6}
                  iconName="Check"
                  iconPosition="left"
                  iconSize={16}
                  fullWidth
                >
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="flex items-center space-x-2 text-success">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-body font-body-medium">
                Two-factor authentication is enabled
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="glassmorphic p-6 rounded-squircle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-foreground flex items-center">
            <Icon name="Monitor" size={20} className="mr-2" />
            Active Sessions
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTerminateAllSessions}
            iconName="LogOut"
            iconPosition="left"
            iconSize={14}
            className="text-error hover:text-error border-error/20 hover:border-error/40"
          >
            Terminate All
          </Button>
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-squircle"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-squircle flex items-center justify-center">
                  <Icon
                    name={session.device.includes('iPhone') ? 'Smartphone' : 'Monitor'}
                    size={20}
                    className="text-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-body font-body-medium text-foreground">
                      {session.device}
                    </h4>
                    {session.current && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </p>
                  <p className="text-xs text-muted-foreground font-data">
                    IP: {session.ip}
                  </p>
                </div>
              </div>

              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  iconName="X"
                  iconSize={14}
                  className="text-error hover:text-error"
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="glassmorphic p-6 rounded-squircle">
        <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2" />
          Security Recommendations
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-warning/10 rounded-squircle">
            <Icon name="AlertCircle" size={16} className="text-warning mt-0.5" />
            <div>
              <h4 className="text-sm font-body font-body-medium text-foreground">
                Enable Two-Factor Authentication
              </h4>
              <p className="text-xs text-muted-foreground">
                Secure your account with an additional verification step
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-success/10 rounded-squircle">
            <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
            <div>
              <h4 className="text-sm font-body font-body-medium text-foreground">
                Strong Password
              </h4>
              <p className="text-xs text-muted-foreground">
                Your password meets security requirements
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-squircle">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <div>
              <h4 className="text-sm font-body font-body-medium text-foreground">
                Regular Security Checkups
              </h4>
              <p className="text-xs text-muted-foreground">
                Review your security settings monthly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
