import React, { useState } from 'react';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';
import RoleSelector from './RoleSelector';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import Icon from 'components/AppIcon';

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
            className="rounded-lg"
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
            className="rounded-lg"
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
        className="text-foreground bg-background dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-300 rounded-lg"
      />

      {mode === 'login' && (
        <Input
          label={<span className="text-foreground">Password</span>}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="text-foreground bg-background dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-300 rounded-lg pr-10"
          error={errors.password}
          required
          disabled={isLoading}
          endAdornment={
            <span onClick={() => setShowPassword(v => !v)} role="button" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </span>
          }
        />
      )}

      {mode === 'register' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label={<span className="text-foreground">Password</span>}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="text-foreground bg-background dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-300 rounded-lg pr-10"
                error={errors.password}
                required
                disabled={isLoading}
                endAdornment={
                  <span onClick={() => setShowPassword(v => !v)} role="button" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </span>
                }
              />
            </div>
            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
                disabled={isLoading}
                className="rounded-lg pr-10"
                endAdornment={
                  <span onClick={() => setShowConfirmPassword(v => !v)} role="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </span>
                }
              />
            </div>
          </div>

          {formData.password.length > 0 && (
            <PasswordStrengthIndicator
              password={formData.password}
              isVisible={formData.password.length > 0}
            />
          )}

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
        className="rounded-lg glow-primary"
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );
};

export default AuthForm;
