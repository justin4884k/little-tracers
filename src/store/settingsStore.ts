"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJsonStorage } from "./storage";
import { setVoiceMuted, setPreferredVoice } from "@/lib/speech";
import { setSoundMuted } from "@/lib/sounds";

interface SettingsState {
  voiceOn: boolean;
  soundOn: boolean;
  /** Chosen narration voice (voiceURI), or null to auto-pick the best one. */
  voiceURI: string | null;
  /** Teacher-assigned glyph ids shown as "Today's Mission" on the map. */
  mission: string[];
  setVoiceOn: (on: boolean) => void;
  setSoundOn: (on: boolean) => void;
  setVoiceURI: (voiceURI: string | null) => void;
  setMission: (glyphIds: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voiceOn: true,
      soundOn: true,
      voiceURI: null,
      mission: [],
      setVoiceOn: (on) => {
        setVoiceMuted(!on);
        set({ voiceOn: on });
      },
      setSoundOn: (on) => {
        setSoundMuted(!on);
        set({ soundOn: on });
      },
      setVoiceURI: (voiceURI) => {
        setPreferredVoice(voiceURI);
        set({ voiceURI });
      },
      setMission: (glyphIds) => set({ mission: glyphIds }),
    }),
    {
      name: "little-tracers-settings",
      storage: idbJsonStorage(),
      onRehydrateStorage: () => (state) => {
        // Keep the audio modules in sync with persisted settings.
        if (state) {
          setVoiceMuted(!state.voiceOn);
          setSoundMuted(!state.soundOn);
          setPreferredVoice(state.voiceURI);
        }
      },
    }
  )
);
