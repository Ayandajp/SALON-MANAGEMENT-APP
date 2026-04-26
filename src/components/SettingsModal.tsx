import { useState, useRef, useEffect } from 'react';
import { Upload, X, Scissors, Lock, LogOut } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getSalonSettings, saveSalonSettings, logout } from '../utils/storage';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import type { SalonSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const MAX_NAME_LENGTH = 50;
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_LOGO_DIMENSION = 200;

export function SettingsModal({ isOpen, onClose, onUpdate }: SettingsModalProps) {
  const [settings, setSettings] = useState<SalonSettings>({ name: 'Glam & Co. Salon', logo: '' });
  const [salonName, setSalonName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();
  const { settings: appSettings, changePin } = useSettings();

  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinErrors, setPinErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSettings = async () => {
      const settingsData = await getSalonSettings();
      setSettings(settingsData);
      setSalonName(settingsData.name);
    };
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_LOGO_DIMENSION) {
              height = (height * MAX_LOGO_DIMENSION) / width;
              width = MAX_LOGO_DIMENSION;
            }
          } else {
            if (height > MAX_LOGO_DIMENSION) {
              width = (width * MAX_LOGO_DIMENSION) / height;
              height = MAX_LOGO_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      error('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await resizeImage(file);
      const updated = { ...settings, logo: base64 };
      setSettings(updated);
      await saveSalonSettings(updated);
      success('Logo uploaded successfully');
      onUpdate();
    } catch (err) {
      error('Failed to process image. Please try another file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    const updated = { ...settings, logo: undefined };
    setSettings(updated);
    await saveSalonSettings(updated);
    success('Logo removed');
    onUpdate();
  };

  const handleSaveName = async () => {
    if (!salonName.trim()) {
      error('Salon name cannot be empty');
      return;
    }
    if (salonName.length > MAX_NAME_LENGTH) {
      error(`Salon name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }
    const updated = { ...settings, name: salonName.trim() };
    setSettings(updated);
    await saveSalonSettings(updated);
    success('Salon name updated');
    onUpdate();
    onClose();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    success('Logged out successfully');
    window.location.href = '/login';
  };

  const validatePinChange = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentPin) {
      errors.currentPin = 'Current PIN is required';
    } else if (currentPin !== appSettings.pin) {
      errors.currentPin = 'Current PIN is incorrect';
    }

    if (!newPin) {
      errors.newPin = 'New PIN is required';
    } else if (newPin.length !== 4) {
      errors.newPin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(newPin)) {
      errors.newPin = 'PIN must contain only numbers';
    } else if (newPin === '0000') {
      errors.newPin = 'Please choose a more secure PIN than 0000';
    }

    if (!confirmPin) {
      errors.confirmPin = 'Please confirm your new PIN';
    } else if (confirmPin !== newPin) {
      errors.confirmPin = 'PINs do not match';
    }

    setPinErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePinChange = () => {
    if (!validatePinChange()) return;

    changePin(newPin);
    success('PIN changed successfully');
    setShowPinChange(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinErrors({});
  };

  const handleCancelPinChange = () => {
    setShowPinChange(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-4">
            Salon Information
          </h3>
          
          <div className="mb-4">
            <label className="text-caption font-medium text-text-primary dark:text-white mb-2 block">
              Salon Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border-2 border-border dark:border-dark-border flex items-center justify-center bg-surface dark:bg-dark-surface overflow-hidden">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Salon logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Scissors className="w-8 h-8 text-text-secondary dark:text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  loading={isUploading}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Logo from Computer'}
                </Button>
                {settings.logo && (
                  <Button
                    variant="danger"
                    onClick={handleRemoveLogo}
                    className="w-full"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>
            <p className="text-caption text-text-secondary dark:text-gray-400 mt-2">
              Accepts: PNG, JPG, SVG • Max 2MB • Auto-resized to 200x200px
            </p>
          </div>

          <Input
            label="Salon Name"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            placeholder="Enter salon name"
            maxLength={MAX_NAME_LENGTH}
          />
          <p className="text-caption text-text-secondary dark:text-gray-400 mt-1 text-right">
            {salonName.length}/{MAX_NAME_LENGTH} characters
          </p>

          <Button onClick={handleSaveName} className="w-full mt-4">
            Save Salon Settings
          </Button>
        </div>

        <div className="border-t border-border dark:border-dark-border pt-4">
          <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-4">
            Security
          </h3>
          
          {!showPinChange ? (
            <Button 
              variant="secondary" 
              onClick={() => setShowPinChange(true)}
              className="w-full mb-3"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change PIN
            </Button>
          ) : (
            <div className="space-y-4 mb-4">
              <Input
                label="Current PIN"
                type="password"
                value={currentPin}
                onChange={(e) => {
                  setCurrentPin(e.target.value);
                  setPinErrors(prev => ({ ...prev, currentPin: '' }));
                }}
                placeholder="Enter current PIN"
                maxLength={4}
                error={pinErrors.currentPin}
              />
              <Input
                label="New PIN"
                type="password"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  setPinErrors(prev => ({ ...prev, newPin: '' }));
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                error={pinErrors.newPin}
              />
              <Input
                label="Confirm PIN"
                type="password"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setPinErrors(prev => ({ ...prev, confirmPin: '' }));
                }}
                placeholder="Confirm new PIN"
                maxLength={4}
                error={pinErrors.confirmPin}
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancelPinChange} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handlePinChange} className="flex-1">
                  Change PIN
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="border-t border-border dark:border-dark-border pt-4">
          <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-4">
            Account
          </h3>
          <Button 
            variant="danger" 
            onClick={handleLogout}
            loading={isLoggingOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <p className="text-caption text-text-secondary dark:text-gray-400 mt-2 text-center">
            Sign out of your account
          </p>
        </div>
      </div>
    </Modal>
  );
}