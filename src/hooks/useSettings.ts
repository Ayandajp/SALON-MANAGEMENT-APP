import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import type { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    isUnlocked: false,
    pin: '0000',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const unlock = () => {
    updateSettings({ isUnlocked: true });
  };

  const lock = () => {
    updateSettings({ isUnlocked: false });
  };

  const changePin = async (newPin: string) => {
    await updateSettings({ pin: newPin });
  };

  return {
    settings,
    updateSettings,
    toggleDarkMode,
    unlock,
    lock,
    changePin,
  };
}