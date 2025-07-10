import React, { useState } from 'react';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';
import RoleSelector from './RoleSelector';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const AuthForm = ({ mode, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: '',
    agreeToTerms: false,
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock credentials for different roles
  const mockCredentials = {
    job_seeker: { email: 'jobseeker@hirehub.ai', password: 'JobSeeker123!' },
    recruiter: { email: 'recruiter@hirehub.ai', password: 'Recruiter123!' },
    employer: { email: 'employer@hirehub.ai', password: 'Employer123!' },
    administrator: { email: 'admin@hirehub.ai', password: 'Admin123!' }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'register') {
      // First name validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      // Last name validation
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Role validation
      if (!formData.role) {
        newErrors.role = 'Please select your role';
      }

      // Terms validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check mock credentials for login
    if (mode === 'login') {
      const isValidCredentials = Object.values(mockCredentials).some(
        cred => cred.email === formData.email && cred.password === formData.password
      );

      if (!isValidCredentials) {
        setErrors({
          email: 'Invalid credentials. Try: jobseeker@hirehub.ai / JobSeeker123!',
          password: 'Invalid credentials. Try: jobseeker@hirehub.ai / JobSeeker123!'
        });
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'register' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            required
            disabled={isLoading}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            required
            disabled={isLoading}
          />
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        required
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          required
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <Checkbox
            label="Show password"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            size="sm"
          />
          {mode === 'login' && (
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 spring-transition"
            >
              Forgot password?
            </button>
          )}
        </div>
        
        {mode === 'register' && (
          <PasswordStrengthIndicator 
            password={formData.password} 
            isVisible={formData.password.length > 0}
          />
        )}
      </div>

      {mode === 'register' && (
        <>
          <div className="space-y-2">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
              disabled={isLoading}
            />
            <Checkbox
              label="Show confirm password"
              checked={showConfirmPassword}
              onChange={(e) => setShowConfirmPassword(e.target.checked)}
              size="sm"
            />
          </div>

          <RoleSelector
            selectedRole={formData.role}
            onRoleChange={(value) => handleInputChange('role', value)}
            error={errors.role}
          />

          <div className="space-y-3">
            <Checkbox
              label="I agree to the Terms of Service and Privacy Policy"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              error={errors.agreeToTerms}
              required
            />
          </div>
        </>
      )}

      {mode === 'login' && (
        <Checkbox
          label="Remember me"
          checked={formData.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
        />
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName={mode === 'login' ? "LogIn" : "UserPlus"}
        iconPosition="left"
        iconSize={18}
        className="glow-primary"
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      {/* Mock Credentials Helper */}
      <div className="glassmorphic p-4 rounded-squircle border border-accent/20">
        <h4 className="text-sm font-body font-body-semibold text-foreground mb-2">
          Demo Credentials:
        </h4>
        <div className="space-y-1 text-xs font-data">
          <div className="text-muted-foreground">Job Seeker: jobseeker@hirehub.ai / JobSeeker123!</div>
          <div className="text-muted-foreground">Recruiter: recruiter@hirehub.ai / Recruiter123!</div>
          <div className="text-muted-foreground">Employer: employer@hirehub.ai / Employer123!</div>
          <div className="text-muted-foreground">Admin: admin@hirehub.ai / Admin123!</div>
        </div>
      </div>
    </form>
  );
};

export default AuthForm;
