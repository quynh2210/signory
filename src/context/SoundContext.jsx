import React, { createContext, useContext, useState, useEffect } from 'react';
import soundEngine from '../services/audioService';
import { getAppSettings } from '../services/dbService';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem('signory_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('signory_sound_volume');
    return saved !== null ? parseFloat(saved) : 0.7;
  });

  const [customSounds, setCustomSounds] = useState(() => {
    try {
      const saved = localStorage.getItem('signory_custom_sounds');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Load custom sound configurations from settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAppSettings();
        if (settings) {
          const loadedSounds = {
            correct: settings.soundCorrectUrl || '',
            incorrect: settings.soundIncorrectUrl || '',
            letter: settings.soundLetterUrl || '',
            badge: settings.soundBadgeUrl || '',
            complete: settings.soundCompleteUrl || ''
          };
          setCustomSounds(loadedSounds);
          localStorage.setItem('signory_custom_sounds', JSON.stringify(loadedSounds));
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
    localStorage.setItem('signory_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    soundEngine.setVolume(volume);
    localStorage.setItem('signory_sound_volume', volume.toString());
  }, [volume]);

  const toggleSound = () => {
    setSoundEnabledState(prev => {
      const next = !prev;
      if (next) soundEngine.playClick();
      return next;
    });
  };

  const setVolume = (val) => {
    setVolumeState(val);
  };

  const updateCustomSounds = (sounds) => {
    setCustomSounds(sounds);
    localStorage.setItem('signory_custom_sounds', JSON.stringify(sounds));
  };

  const playCorrect = () => soundEngine.playCorrect(customSounds.correct || null);
  const playIncorrect = () => soundEngine.playIncorrect(customSounds.incorrect || null);
  const playClick = () => soundEngine.playClick();
  const playLetter = (offset) => {
    if (customSounds.letter) {
      soundEngine.playCustomAudio(customSounds.letter);
    } else {
      soundEngine.playLetter(offset);
    }
  };
  const playComplete = () => soundEngine.playComplete(customSounds.complete || null);
  const playBadge = () => {
    if (customSounds.badge) {
      soundEngine.playCustomAudio(customSounds.badge);
    } else {
      soundEngine.playBadge();
    }
  };

  return (
    <SoundContext.Provider value={{
      soundEnabled,
      toggleSound,
      volume,
      setVolume,
      customSounds,
      updateCustomSounds,
      playCorrect,
      playIncorrect,
      playClick,
      playLetter,
      playComplete,
      playBadge
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
