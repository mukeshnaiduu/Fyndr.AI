import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const BookingModal = ({ mentor, isOpen, onClose, onConfirmBooking }) => {
  const toINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('consultation');
  const [duration, setDuration] = useState('60');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen || !mentor) return null;

  const sessionTypes = [
    { value: 'consultation', label: 'One-time Consultation' },
    { value: 'mentorship', label: 'Ongoing Mentorship' },
    { value: 'group', label: 'Group Session' }
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' }
  ];

  const mockAvailableDates = [
    { value: '2025-07-10', label: 'Thu, Jul 10' },
    { value: '2025-07-11', label: 'Fri, Jul 11' },
    { value: '2025-07-12', label: 'Sat, Jul 12' },
    { value: '2025-07-13', label: 'Sun, Jul 13' },
    { value: '2025-07-14', label: 'Mon, Jul 14' }
  ];

  const mockAvailableTimes = [
    { value: '09:00', label: '9:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '16:00', label: '4:00 PM' }
  ];

  const calculatePrice = () => {
    const basePrice = mentor.hourlyRate;
    const durationMultiplier = parseInt(duration) / 60;
    let sessionMultiplier = 1;

    if (sessionType === 'mentorship') {
      sessionMultiplier = 0.85; // 15% discount
    } else if (sessionType === 'group') {
      sessionMultiplier = 0.6; // 40% discount
    }

    return Math.round(basePrice * durationMultiplier * sessionMultiplier);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      mentor,
      date: selectedDate,
      time: selectedTime,
      sessionType,
      duration: parseInt(duration),
      message,
      price: calculatePrice()
    };
    onConfirmBooking(bookingData);
    onClose();
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return sessionType && duration;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={mentor.avatar}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Book Session</h2>
              <p className="text-muted-foreground">with {mentor.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-4 border-b border-white/10">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Session Details</h3>

                <div className="space-y-4">
                  <Select
                    label="Session Type"
                    options={sessionTypes}
                    value={sessionType}
                    onChange={setSessionType}
                    required
                  />

                  <Select
                    label="Duration"
                    options={durationOptions}
                    value={duration}
                    onChange={setDuration}
                    required
                  />

                  <div className="glassmorphic rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Session Price:</span>
                      <span className="text-2xl font-bold text-primary">{toINR(calculatePrice())}</span>
                    </div>
                    {sessionType === 'mentorship' && (
                      <p className="text-sm text-green-500 mt-1">15% discount applied</p>
                    )}
                    {sessionType === 'group' && (
                      <p className="text-sm text-green-500 mt-1">40% group discount applied</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Date & Time</h3>

                <div className="space-y-4">
                  <Select
                    label="Available Dates"
                    options={mockAvailableDates}
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="Choose a date"
                    required
                  />

                  {selectedDate && (
                    <Select
                      label="Available Times"
                      options={mockAvailableTimes}
                      value={selectedTime}
                      onChange={setSelectedTime}
                      placeholder="Choose a time"
                      required
                    />
                  )}

                  {selectedDate && selectedTime && (
                    <div className="glassmorphic rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-foreground">
                        <Icon name="Calendar" size={20} className="text-primary" />
                        <span>
                          {mockAvailableDates.find(d => d.value === selectedDate)?.label} at{' '}
                          {mockAvailableTimes.find(t => t.value === selectedTime)?.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground mt-2">
                        <Icon name="Clock" size={16} />
                        <span>{duration} minutes session</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Message to Mentor (Optional)"
                    type="text"
                    placeholder="Tell the mentor what you'd like to discuss..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    description="Help your mentor prepare for the session"
                  />

                  {/* Booking Summary */}
                  <div className="glassmorphic rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-foreground">Booking Summary</h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session Type:</span>
                        <span className="text-foreground">
                          {sessionTypes.find(s => s.value === sessionType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground">{duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <span className="text-foreground">
                          {mockAvailableDates.find(d => d.value === selectedDate)?.label} at{' '}
                          {mockAvailableTimes.find(t => t.value === selectedTime)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2">
                        <span className="font-medium text-foreground">Total Price:</span>
                        <span className="font-bold text-primary text-lg">{toINR(calculatePrice())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center space-x-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevStep}>
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {step < 3 ? (
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={!isStepValid()}
              >
                Next
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleConfirmBooking}
                iconName="Calendar"
                iconPosition="left"
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
