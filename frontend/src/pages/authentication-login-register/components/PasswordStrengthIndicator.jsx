import React from 'react';
import Icon from 'components/AppIcon';

const PasswordStrengthIndicator = ({ password, isVisible }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    const strengthLevels = {
      0: { label: '', color: '', width: '0%' },
      1: { label: 'Very Weak', color: 'bg-error', width: '20%' },
      2: { label: 'Weak', color: 'bg-warning', width: '40%' },
      3: { label: 'Fair', color: 'bg-warning', width: '60%' },
      4: { label: 'Good', color: 'bg-success', width: '80%' },
      5: { label: 'Strong', color: 'bg-success', width: '100%' }
    };
    
    return { ...strengthLevels[score], checks };
  };

  if (!isVisible || !password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-caption text-muted-foreground">
            Password Strength
          </span>
          {strength.label && (
            <span className={`text-xs font-body font-body-medium ${
              strength.color === 'bg-error' ? 'text-error' :
              strength.color === 'bg-warning' ? 'text-warning' : 'text-success'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full spring-transition ${strength.color}`}
            style={{ width: strength.width }}
          ></div>
        </div>
      </div>

      {/* Requirements Checklist */}
      {strength.checks && (
        <div className="space-y-1">
          <span className="text-xs font-caption text-muted-foreground">
            Requirements:
          </span>
          <div className="grid grid-cols-1 gap-1">
            {[
              { key: 'length', label: 'At least 8 characters' },
              { key: 'lowercase', label: 'One lowercase letter' },
              { key: 'uppercase', label: 'One uppercase letter' },
              { key: 'number', label: 'One number' },
              { key: 'special', label: 'One special character' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Icon
                  name={strength.checks[key] ? "CheckCircle" : "Circle"}
                  size={12}
                  className={`${
                    strength.checks[key] ? 'text-success' : 'text-muted-foreground'
                  } spring-transition`}
                />
                <span className={`text-xs ${
                  strength.checks[key] ? 'text-success' : 'text-muted-foreground'
                } spring-transition`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
