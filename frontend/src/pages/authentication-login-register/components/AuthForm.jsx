import React, { useState } from 'react';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';
import RoleSelector from './RoleSelector';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const AuthForm = ({ mode, onSubmit, isLoading, errors = {} }) => {
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock credentials for different roles
  const mockCredentials = {
    job_seeker: { email: 'jobseeker@fyndrai.com', password: 'JobSeeker123!' },
    recruiter: { email: 'recruiter@fyndrai.com', password: 'Recruiter123!' },
    company: { email: 'company@fyndrai.com', password: 'Company123!' },
    administrator: { email: 'admin@fyndrai.com', password: 'Admin123!' }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto bg-white/95 dark:bg-neutral-900 dark:shadow-xl rounded-squircle p-6 shadow-lg">
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
        label={<span className="text-foreground">Email Address</span>}
        type="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        required
        disabled={isLoading}
        className="text-foreground bg-background dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-300"
      />
      {errors.email && (
        <p className="text-xs text-error mt-1">{errors.email}</p>
      )}

      <Input
        label={<span className="text-foreground">Password</span>}
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        className="text-foreground bg-background dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-300"
        error={errors.password}
        required
        disabled={isLoading}
      />
      <Checkbox
        label="Show password"
        checked={showPassword}
        onChange={(e) => setShowPassword(e.target.checked)}
        size="sm"
      />
      {errors.password && (
        <p className="text-xs text-error mt-1">{errors.password}</p>
      )}

      {formData.password.length > 0 && (
        <PasswordStrengthIndicator
          password={formData.password}
          isVisible={formData.password.length > 0}
        />
      )}

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
            {errors.confirmPassword && (
              <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <RoleSelector
            selectedRole={formData.role}
            onRoleChange={(value) => handleInputChange('role', value)}
            error={errors.role}
          />
          {errors.role && (
            <p className="text-xs text-error mt-1">{errors.role}</p>
          )}

          <div className="space-y-3">
            <Checkbox
              label="I agree to the Terms of Service and Privacy Policy"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              error={errors.agreeToTerms}
              required
            />
            {errors.agreeToTerms && (
              <p className="text-xs text-error mt-1">{errors.agreeToTerms}</p>
            )}
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
    </form>
  );
};

export default AuthForm;
