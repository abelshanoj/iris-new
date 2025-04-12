import React, { createContext, useContext, useState, useRef } from 'react';
import { Audio } from 'expo-av';

type AudioContextType = {
  playbackInstance: Audio.Sound | null;
  setPlaybackInstance: (instance: Audio.Sound) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playbackInstance, setPlaybackInstance] = useState<Audio.Sound | null>(null);

  return (
    <AudioContext.Provider value={{ playbackInstance, setPlaybackInstance }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
