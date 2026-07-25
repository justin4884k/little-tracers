export type WorldId = "alphabet" | "numbers" | "shapes" | "colors" | "motor";

export type LessonKind = "letter" | "number" | "shape" | "color" | "motor";

export type RewardKind = "star" | "sticker" | "puzzle" | "pet" | "decoration";

export type Point = {
  x: number;
  y: number;
};

export type TraceStroke = {
  id: string;
  points: Point[];
  label: string;
};

export type TraceLesson = {
  id: string;
  title: string;
  shortTitle: string;
  kind: LessonKind;
  sound?: string;
  example?: string;
  prompt: string;
  glyph: string;
  strokes: TraceStroke[];
  reward: RewardKind;
};

export type LearningWorld = {
  id: WorldId;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  icon: string;
  mapPath: string;
  lessons: TraceLesson[];
};

export type SettingsState = {
  musicVolume: number;
  effectsVolume: number;
  narration: boolean;
  preferHumanVoice: boolean;
  difficulty: "sprout" | "growing" | "kindergarten";
  tracingAssist: number;
  language: "English" | "Spanish" | "French";
  leftHanded: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorblind: boolean;
};

export type NarrationClip = {
  lessonId: string;
  mimeType: string;
  audio: Blob;
  durationMs: number;
  updatedAt: string;
};

export type LessonProgress = {
  lessonId: string;
  completions: number;
  bestAccuracy: number;
  lastCompletedAt: string;
};

export type ProgressState = {
  practiceSeconds: number;
  streak: number;
  stars: number;
  stickers: string[];
  pets: string[];
  puzzlePieces: number;
  decorations: string[];
  lessons: Record<string, LessonProgress>;
  favorites: Record<string, number>;
};
