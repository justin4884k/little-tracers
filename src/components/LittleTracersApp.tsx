"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Baby,
  BarChart3,
  BookOpen,
  Brush,
  Check,
  ChevronRight,
  Gift,
  HeartHandshake,
  Home,
  Mic,
  Play,
  Printer,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Timer,
  Trash2,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { allLessons, worlds } from "@/lib/content";
import { deleteNarrationClip, listNarrationClips, loadNarrationClip, saveNarrationClip } from "@/lib/narration-store";
import {
  applyLessonCompletion,
  defaultProgress,
  defaultSettings,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  summarizeProgress,
} from "@/lib/progress-store";
import { buildNarrationParts, chooseNaturalVoice } from "@/lib/speech";
import type { LearningWorld, NarrationClip, ProgressState, SettingsState, TraceLesson, WorldId } from "@/types/learning";

const TraceCanvas = dynamic(() => import("@/components/TraceCanvas").then((module) => module.TraceCanvas), {
  ssr: false,
  loading: () => <div className="canvas-loading">Warming up the tracing board...</div>,
});

type Screen = "home" | "play" | "progress" | "parents" | "support" | "settings";

const nav: Array<{ id: Screen; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "play", label: "Play", icon: Baby },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "parents", label: "Parents", icon: ShieldCheck },
  { id: "support", label: "Support", icon: HeartHandshake },
  { id: "settings", label: "Settings", icon: Settings },
];

export function LittleTracersApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [worldId, setWorldId] = useState<WorldId>("alphabet");
  const [lesson, setLesson] = useState<TraceLesson>(worlds[0].lessons[0]);
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [narrationClipIds, setNarrationClipIds] = useState<Set<string>>(new Set());
  const longPressRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    Promise.all([loadProgress(), loadSettings()]).then(([storedProgress, storedSettings]) => {
      setProgress(storedProgress);
      setSettings(storedSettings);
      setReady(true);
    });
    listNarrationClips().then((clips) => setNarrationClipIds(new Set(clips.map((clip) => clip.lessonId))));
  }, []);

  useEffect(() => {
    if (ready) saveProgress(progress);
  }, [progress, ready]);

  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  useEffect(() => {
    if (!settings.narration || typeof window === "undefined") return;

    let cancelled = false;
    let objectUrl: string | null = null;

    const playHumanClip = async () => {
      if (!settings.preferHumanVoice || !narrationClipIds.has(lesson.id)) return false;

      const clip = await loadNarrationClip(lesson.id);
      if (!clip || cancelled) return false;

      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      objectUrl = URL.createObjectURL(clip.audio);
      const audio = new Audio(objectUrl);
      audio.volume = settings.effectsVolume / 100;
      audioRef.current = audio;
      await audio.play().catch(() => undefined);
      return true;
    };

    const speak = () => {
      if (!("speechSynthesis" in window)) return;
      const selectedVoice = chooseNaturalVoice(window.speechSynthesis.getVoices());
      const parts = buildNarrationParts(lesson);
      window.speechSynthesis.cancel();

      parts.forEach((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice?.lang ?? "en-US";
        utterance.rate = index === 0 ? 0.72 : 0.76;
        utterance.pitch = index === 0 ? 1.02 : 1.08;
        utterance.volume = settings.effectsVolume / 100;
        window.speechSynthesis.speak(utterance);
      });
    };

    playHumanClip().then((playedHumanClip) => {
      if (cancelled || playedHumanClip || !("speechSynthesis" in window)) return;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speak();
        return;
      }

      window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
    });

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      window.speechSynthesis?.removeEventListener("voiceschanged", speak);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lesson, narrationClipIds, settings.effectsVolume, settings.narration, settings.preferHumanVoice]);

  const world = useMemo(() => worlds.find((item) => item.id === worldId) ?? worlds[0], [worldId]);
  const summary = useMemo(() => summarizeProgress(progress), [progress]);

  const completeLesson = (accuracy: number) => {
    setProgress((current) => applyLessonCompletion(current, lesson.id, accuracy, lesson.reward));
    setCelebration(`You earned 3 stars and a ${lesson.reward}!`);
    window.setTimeout(() => setCelebration(null), 2600);
  };

  const beginTeacherPress = () => {
    longPressRef.current = window.setTimeout(() => {
      setTeacherMode((value) => !value);
      setCelebration("Teacher tools unlocked");
    }, 1400);
  };

  const cancelTeacherPress = () => {
    if (longPressRef.current) window.clearTimeout(longPressRef.current);
  };

  return (
    <main
      className={[
        "app-shell",
        settings.highContrast ? "high-contrast" : "",
        settings.largeText ? "large-text" : "",
        settings.colorblind ? "colorblind" : "",
      ].join(" ")}
    >
      <AnimatePresence>
        {celebration ? (
          <motion.div className="toast" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
            <Sparkles size={24} />
            {celebration}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <aside className="side-nav" aria-label="Main menu">
        <button className="brand" onPointerDown={beginTeacherPress} onPointerUp={cancelTeacherPress} onPointerLeave={cancelTeacherPress}>
          <span className="brand-mark">Lt</span>
          <span>
            <strong>Little Tracers</strong>
            <small>free forever</small>
          </span>
        </button>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`nav-button ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
              <Icon size={28} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      <section className="content-stage">
        <AnimatePresence mode="wait">
          {screen === "home" && (
            <ScreenFrame key="home">
              <HomeScreen progress={progress} setScreen={setScreen} setWorldId={setWorldId} setLesson={setLesson} />
            </ScreenFrame>
          )}
          {screen === "play" && (
            <ScreenFrame key="play">
              <PlayScreen
                world={world}
                setWorldId={setWorldId}
                lesson={lesson}
                setLesson={setLesson}
                progress={progress}
                settings={settings}
                completeLesson={completeLesson}
              />
            </ScreenFrame>
          )}
          {screen === "progress" && (
            <ScreenFrame key="progress">
              <ProgressScreen progress={progress} summary={summary} />
            </ScreenFrame>
          )}
          {screen === "parents" && (
            <ScreenFrame key="parents">
              <ParentsScreen
                progress={progress}
                summary={summary}
                teacherMode={teacherMode}
                setTeacherMode={setTeacherMode}
                resetProgress={() => setProgress(defaultProgress)}
              />
            </ScreenFrame>
          )}
          {screen === "support" && (
            <ScreenFrame key="support">
              <SupportScreen />
            </ScreenFrame>
          )}
          {screen === "settings" && (
            <ScreenFrame key="settings">
              <SettingsScreen
                settings={settings}
                setSettings={setSettings}
                recordedLessonIds={narrationClipIds}
                onClipSaved={(clip) => {
                  saveNarrationClip(clip).then(() => {
                    setNarrationClipIds((ids) => new Set(ids).add(clip.lessonId));
                    setCelebration("Human voice saved for this lesson");
                  });
                }}
                onClipDeleted={(lessonId) => {
                  deleteNarrationClip(lessonId).then(() => {
                    setNarrationClipIds((ids) => {
                      const next = new Set(ids);
                      next.delete(lessonId);
                      return next;
                    });
                    setCelebration("Human voice removed");
                  });
                }}
              />
            </ScreenFrame>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="screen-frame" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
      {children}
    </motion.div>
  );
}

function HomeScreen({
  progress,
  setScreen,
  setWorldId,
  setLesson,
}: {
  progress: ProgressState;
  setScreen: (screen: Screen) => void;
  setWorldId: (id: WorldId) => void;
  setLesson: (lesson: TraceLesson) => void;
}) {
  return (
    <>
      <section className="hero-band">
        <div>
          <p className="micro-label">Handwriting practice for ages 3-6</p>
          <h1>Trace, sparkle, and play your way into writing.</h1>
          <p>Every lesson is free, offline-ready, and designed for tiny hands that are still learning control.</p>
          <button
            className="primary-action"
            onClick={() => {
              setScreen("play");
            }}
          >
            <Sparkles size={32} />
            Start Play
          </button>
        </div>
        <motion.div className="mascot-stage" animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 4 }}>
          <span className="mascot-face">A</span>
          <span className="mascot-pencil" />
        </motion.div>
      </section>

      <div className="world-grid">
        {worlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            onSelect={() => {
              setWorldId(world.id);
              setLesson(world.lessons[0]);
              setScreen("play");
            }}
            completed={world.lessons.filter((item) => progress.lessons[item.id]).length}
          />
        ))}
      </div>
    </>
  );
}

function PlayScreen({
  world,
  setWorldId,
  lesson,
  setLesson,
  progress,
  settings,
  completeLesson,
}: {
  world: LearningWorld;
  setWorldId: (id: WorldId) => void;
  lesson: TraceLesson;
  setLesson: (lesson: TraceLesson) => void;
  progress: ProgressState;
  settings: SettingsState;
  completeLesson: (accuracy: number) => void;
}) {
  return (
    <div className="play-layout">
      <section className="map-panel">
        <div className="section-heading">
          <div>
            <p className="micro-label">Choose a world</p>
            <h1>{world.title}</h1>
          </div>
          <select value={world.id} onChange={(event) => setWorldId(event.target.value as WorldId)} aria-label="Select world">
            {worlds.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="map" style={{ "--world": world.color, "--accent": world.accent } as React.CSSProperties}>
          <svg viewBox="0 0 450 260" aria-hidden="true">
            <path d={world.mapPath} />
          </svg>
          <div className="lesson-dots">
            {world.lessons.map((item, index) => (
              <motion.button
                key={item.id}
                className={`lesson-dot ${world.lessons.length > 12 ? "dense" : ""} ${lesson.id === item.id ? "selected" : ""}`}
                style={{
                  left: world.lessons.length > 12 ? `${5 + (index % 13) * 7.2}%` : `${10 + index * (78 / Math.max(world.lessons.length - 1, 1))}%`,
                  top: world.lessons.length > 12 ? `${18 + Math.floor(index / 13) * 19}%` : `${index % 2 === 0 ? 55 : 30}%`,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setLesson(item)}
              >
                <span>{item.shortTitle}</span>
                {progress.lessons[item.id] ? <Check size={18} /> : null}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lesson-strip">
          {world.lessons.map((item) => (
            <button key={item.id} className={item.id === lesson.id ? "selected" : ""} onClick={() => setLesson(item)}>
              <span>{item.shortTitle}</span>
              <small>{item.example ?? item.title}</small>
            </button>
          ))}
        </div>
      </section>

      <TraceCanvas
        key={lesson.id}
        lesson={lesson}
        assist={settings.tracingAssist}
        highContrast={settings.highContrast}
        leftHanded={settings.leftHanded}
        onComplete={completeLesson}
      />
    </div>
  );
}

function ProgressScreen({ progress, summary }: { progress: ProgressState; summary: ReturnType<typeof summarizeProgress> }) {
  const masteredLetters = allLessons.filter((lesson) => lesson.kind === "letter" && progress.lessons[lesson.id]?.bestAccuracy >= 84).length;
  const masteredNumbers = allLessons.filter((lesson) => lesson.kind === "number" && progress.lessons[lesson.id]?.bestAccuracy >= 84).length;

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="micro-label">Progress</p>
          <h1>Growing writer dashboard</h1>
        </div>
      </div>
      <div className="metric-grid">
        <Metric icon={Timer} label="Practice time" value={`${summary.practiceMinutes} min`} />
        <Metric icon={BookOpen} label="Letters mastered" value={`${masteredLetters}`} />
        <Metric icon={Star} label="Numbers mastered" value={`${masteredNumbers}`} />
        <Metric icon={Sparkles} label="Accuracy" value={`${summary.averageAccuracy}%`} />
      </div>
      <section className="reward-shelf">
        <h2>Reward shelf</h2>
        <div className="reward-row">
          <Reward label="Stars" value={progress.stars} />
          <Reward label="Stickers" value={progress.stickers.length} />
          <Reward label="Puzzle pieces" value={progress.puzzlePieces} />
          <Reward label="Pets" value={progress.pets.length} />
          <Reward label="Decorations" value={progress.decorations.length} />
        </div>
      </section>
    </>
  );
}

function ParentsScreen({
  progress,
  summary,
  teacherMode,
  setTeacherMode,
  resetProgress,
}: {
  progress: ProgressState;
  summary: ReturnType<typeof summarizeProgress>;
  teacherMode: boolean;
  setTeacherMode: (value: boolean) => void;
  resetProgress: () => void;
}) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="micro-label">Parents</p>
          <h1>Local-only learning notes</h1>
        </div>
        <button className="pill-button" onClick={() => setTeacherMode(!teacherMode)}>
          <ShieldCheck size={22} />
          {teacherMode ? "Hide teacher tools" : "Teacher mode"}
        </button>
      </div>
      <div className="metric-grid">
        <Metric icon={Timer} label="Practice time" value={`${summary.practiceMinutes} min`} />
        <Metric icon={BarChart3} label="Streak" value={`${progress.streak} day`} />
        <Metric icon={Check} label="Lessons tried" value={`${summary.completedCount}`} />
        <Metric icon={Sparkles} label="Average accuracy" value={`${summary.averageAccuracy}%`} />
      </div>
      <section className="parent-note">
        <h2>Favorite activities</h2>
        <p>{summary.favoriteActivities.length ? summary.favoriteActivities.join(", ") : "Favorites will appear after a few playful sessions."}</p>
      </section>
      {teacherMode ? (
        <section className="teacher-tools">
          <h2>Teacher tools</h2>
          <div className="tool-grid">
            <button><BookOpen size={26} /> Assign lessons</button>
            <button><Brush size={26} /> Free play</button>
            <button onClick={() => window.print()}><Printer size={26} /> Print worksheets</button>
            <button onClick={resetProgress}><RotateCcw size={26} /> Reset progress</button>
          </div>
        </section>
      ) : null}
    </>
  );
}

function SupportScreen() {
  return (
    <section className="support-panel">
      <p className="micro-label">Optional</p>
      <h1>Support Development</h1>
      <p>Little Tracers has no ads, subscriptions, paywalls, locked lessons, premium currency, or in-app purchases.</p>
      <div className="support-links">
        <a href="https://www.buymeacoffee.com/" target="_blank" rel="noreferrer">
          <Gift size={30} />
          Buy Me a Coffee
        </a>
        <a href="https://opencollective.com/" target="_blank" rel="noreferrer">
          <HeartHandshake size={30} />
          Open Collective
        </a>
      </div>
    </section>
  );
}

function SettingsScreen({
  settings,
  setSettings,
  recordedLessonIds,
  onClipSaved,
  onClipDeleted,
}: {
  settings: SettingsState;
  setSettings: (settings: SettingsState) => void;
  recordedLessonIds: Set<string>;
  onClipSaved: (clip: NarrationClip) => void;
  onClipDeleted: (lessonId: string) => void;
}) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => setSettings({ ...settings, [key]: value });

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="micro-label">Settings</p>
          <h1>Make tracing feel just right</h1>
        </div>
      </div>
      <div className="settings-grid">
        <Slider label="Music volume" value={settings.musicVolume} onChange={(value) => update("musicVolume", value)} />
        <Slider label="Sound effects" value={settings.effectsVolume} onChange={(value) => update("effectsVolume", value)} />
        <Slider label="Tracing assistance" value={settings.tracingAssist} onChange={(value) => update("tracingAssist", value)} />
        <Toggle icon={Volume2} label="Voice narration" checked={settings.narration} onChange={(value) => update("narration", value)} />
        <Toggle icon={Mic} label="Human voice first" checked={settings.preferHumanVoice} onChange={(value) => update("preferHumanVoice", value)} />
        <Toggle icon={Accessibility} label="Left-handed mode" checked={settings.leftHanded} onChange={(value) => update("leftHanded", value)} />
        <Toggle icon={Accessibility} label="High contrast" checked={settings.highContrast} onChange={(value) => update("highContrast", value)} />
        <Toggle icon={Accessibility} label="Large text" checked={settings.largeText} onChange={(value) => update("largeText", value)} />
        <Toggle icon={Accessibility} label="Colorblind palette" checked={settings.colorblind} onChange={(value) => update("colorblind", value)} />
        <label className="select-card">
          Difficulty
          <select value={settings.difficulty} onChange={(event) => update("difficulty", event.target.value as SettingsState["difficulty"])}>
            <option value="sprout">Sprout</option>
            <option value="growing">Growing</option>
            <option value="kindergarten">Kindergarten</option>
          </select>
        </label>
        <label className="select-card">
          Language
          <select value={settings.language} onChange={(event) => update("language", event.target.value as SettingsState["language"])}>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </label>
      </div>
      <VoiceStudio recordedLessonIds={recordedLessonIds} onClipSaved={onClipSaved} onClipDeleted={onClipDeleted} />
    </>
  );
}

function VoiceStudio({
  recordedLessonIds,
  onClipSaved,
  onClipDeleted,
}: {
  recordedLessonIds: Set<string>;
  onClipSaved: (clip: NarrationClip) => void;
  onClipDeleted: (lessonId: string) => void;
}) {
  const [lessonId, setLessonId] = useState(allLessons[0].id);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Record a warm grown-up voice for any lesson.");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const lesson = allLessons.find((item) => item.id === lessonId) ?? allLessons[0];
  const hasClip = recordedLessonIds.has(lesson.id);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("This browser cannot record audio here.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      onClipSaved({
        lessonId: lesson.id,
        mimeType: audio.type,
        audio,
        durationMs: 0,
        updatedAt: new Date().toISOString(),
      });
      setStatus("Saved. This lesson will use your real voice.");
    };

    recorder.start();
    setRecording(true);
    setStatus("Recording. Speak slowly and smile while you talk.");
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const preview = async () => {
    const clip = await loadNarrationClip(lesson.id);
    if (!clip) {
      setStatus("No human voice has been recorded for this lesson yet.");
      return;
    }
    const url = URL.createObjectURL(clip.audio);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play().catch(() => setStatus("Tap again if the browser blocked playback."));
  };

  return (
    <section className="voice-studio">
      <div className="section-heading">
        <div>
          <p className="micro-label">Human Voice Pack</p>
          <h2>Record real narration</h2>
        </div>
        <strong>{recordedLessonIds.size}/{allLessons.length}</strong>
      </div>
      <label className="select-card">
        Lesson
        <select value={lesson.id} onChange={(event) => setLessonId(event.target.value)}>
          {worlds.map((world) => (
            <optgroup key={world.id} label={world.title}>
              {world.lessons.map((item) => (
                <option key={item.id} value={item.id}>
                  {recordedLessonIds.has(item.id) ? "Recorded: " : ""}{item.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="script-card">
        <span>Script</span>
        <p>{buildNarrationParts(lesson).join(" ")}</p>
      </div>
      <div className="voice-actions">
        <button className={recording ? "recording" : ""} onClick={recording ? stopRecording : startRecording}>
          {recording ? <Square size={28} /> : <Mic size={28} />}
          {recording ? "Stop" : hasClip ? "Re-record" : "Record"}
        </button>
        <button onClick={preview}>
          <Play size={28} />
          Play
        </button>
        <button onClick={() => onClipDeleted(lesson.id)} disabled={!hasClip}>
          <Trash2 size={28} />
          Remove
        </button>
      </div>
      <p className="voice-status">{status}</p>
    </section>
  );
}

function WorldCard({ world, onSelect, completed }: { world: LearningWorld; onSelect: () => void; completed: number }) {
  return (
    <motion.button
      className="world-card"
      style={{ "--world": world.color, "--accent": world.accent } as React.CSSProperties}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
    >
      <span className="world-icon">{world.icon}</span>
      <strong>{world.title}</strong>
      <small>{world.subtitle}</small>
      <em>{completed}/{world.lessons.length}</em>
      <ChevronRight size={30} />
    </motion.button>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <article className="metric-card">
      <Icon size={32} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Reward({ label, value }: { label: string; value: number }) {
  return (
    <motion.div className="reward" whileHover={{ rotate: 1, scale: 1.03 }}>
      <Star size={30} />
      <strong>{value}</strong>
      <span>{label}</span>
    </motion.div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-card">
      <span>{label}</span>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}%</strong>
    </label>
  );
}

function Toggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button className={`toggle-card ${checked ? "checked" : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <Icon size={28} />
      <span>{label}</span>
      <strong>{checked ? "On" : "Off"}</strong>
    </button>
  );
}
