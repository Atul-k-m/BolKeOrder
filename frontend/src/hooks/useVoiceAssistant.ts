"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";

export type AssistantMode = "vapi" | "free";
export type CallStatus = "inactive" | "connecting" | "speaking" | "connected" | "ordered";
export type Language = "english" | "hindi";

let vapiInstance: Vapi | null = null;

export function useVoiceAssistant(defaultMode: AssistantMode = "free") {
  const [mode, setMode] = useState<AssistantMode>(defaultMode);
  const [status, setStatus] = useState<CallStatus>("inactive");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const statusRef = useRef<CallStatus>("inactive");
  const isSpeakingRef = useRef(false);
  const finalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFinalRef = useRef("");
  const lastErrorRef = useRef("");
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecognitionActiveRef = useRef(false);

  // Keep statusRef in sync synchronously to avoid stale closure bugs
  const updateStatus = useCallback((s: CallStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const getVapi = () => {
    if (!vapiInstance && typeof window !== "undefined") {
      vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
    }
    return vapiInstance;
  };

  // ---------------------------------------------------------------------------
  // Volume level: derived from onresult transcript activity, NOT AudioContext.
  // AudioContext competing for the mic was causing recognition to die silently.
  // ---------------------------------------------------------------------------
  const simulateVolume = useCallback((active: boolean) => {
    setVolumeLevel(active ? 0.6 : 0);
  }, []);

  // ---------------------------------------------------------------------------
  // Recognition
  // ---------------------------------------------------------------------------
  const safeStartRecognition = useCallback(() => {
    console.log("TRYING TO START MIC");
    if (!recognitionRef.current) return;
    if (isRecognitionActiveRef.current) return; // already running
    if (statusRef.current !== "connected") return; // MUST be connected to start!
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // "already started" is harmless — anything else log it
      if (!e?.message?.includes("already started")) {
        console.warn("recognition.start() error:", e?.message);
      }
    }
  }, []);

  const safeStopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    isRecognitionActiveRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try { recognitionRef.current.stop(); } catch (_) {}
    try { recognitionRef.current.abort(); } catch (_) {}
  }, []);

  const setupRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    const rec = new SR();
    // continuous: false avoids the Chrome silent-kill bug on localhost.
    // onend restarts it manually after each utterance — same UX, more stable.
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log("MIC STARTED");
      isRecognitionActiveRef.current = true;
    };

    rec.onaudiostart = () => {
      simulateVolume(true);
    };

    rec.onspeechstart = () => {
      simulateVolume(true);
    };

    rec.onspeechend = () => {
      simulateVolume(false);
    };

    rec.onaudioend = () => {
      simulateVolume(false);
    };

    rec.onresult = (event: any) => {
      console.log("RESULT EVENT:", event);
      let interim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += text;
        } else {
          interim += text;
        }
      }

      setInterimTranscript(interim);

      if (newFinal.trim()) {
        pendingFinalRef.current += " " + newFinal.trim();
        if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
        finalDebounceRef.current = setTimeout(() => {
          const flushed = pendingFinalRef.current.trim();
          pendingFinalRef.current = "";
          setInterimTranscript("");
          if (flushed) setFinalTranscript(flushed);
        }, 1200);
      }
    };

    rec.onerror = (e: any) => {
      lastErrorRef.current = e.error;
      isRecognitionActiveRef.current = false;
      if (e.error === "not-allowed") {
        console.error("Microphone permission denied.");
        updateStatus("inactive");
      }
      // no-speech and network are recoverable — handled in onend
    };

rec.onend = () => {
  console.log("Recognition Ended");
  isRecognitionActiveRef.current = false;
  simulateVolume(false);
};

    recognitionRef.current = rec;
  }, [simulateVolume, updateStatus, safeStartRecognition]);

  // ---------------------------------------------------------------------------
  // TTS
  // ---------------------------------------------------------------------------
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      isSpeakingRef.current = true;
      updateStatus("speaking");
      safeStopRecognition();

      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-IN";
      utt.rate = 0.88;
      utt.pitch = 1.0;
      utt.volume = 1;

      const voices = synthRef.current.getVoices();
      const preferred =
        voices.find((v) => v.name === "Google UK English Female") ||
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.startsWith("en-GB")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utt.voice = preferred;

      utt.onend = () => {
  isSpeakingRef.current = false;

  updateStatus("connected"); // IMPORTANT

  if (onEnd) {
    onEnd();
  } else {
    setTimeout(() => {
      safeStartRecognition();
    }, 600);
  }
};

      utt.onerror = (e) => {
        console.warn("TTS error:", e.error);
        isSpeakingRef.current = false;
        if (e.error === "canceled") return;
        setTimeout(() => {
          if (statusRef.current === "speaking") {
            updateStatus("connected");
          }
          if (onEnd) {
            onEnd();
          } else {
            if (statusRef.current === "connected") {
              safeStartRecognition();
            }
          }
        }, 600);
      };

      synthRef.current.speak(utt);
    },
    [updateStatus, safeStopRecognition, safeStartRecognition]
  );

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setupRecognition();

    const vapi = getVapi();
    if (vapi) {
      vapi.on("call-start", () => updateStatus("connected"));
      vapi.on("call-end", () => updateStatus("inactive"));
      vapi.on("error", (e: any) => {
        console.error("Vapi error:", e);
        updateStatus("inactive");
      });
      vapi.on("volume-level", (v: number) => setVolumeLevel(v));
    }

    return () => {
      safeStopRecognition();
      synthRef.current?.cancel();
      if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
    };
  }, [setupRecognition, updateStatus, safeStopRecognition]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  const start = useCallback(
    (greetingOverride?: string) => {
      updateStatus("connecting");
      setFinalTranscript("");
      setInterimTranscript("");
      pendingFinalRef.current = "";

      if (mode === "vapi") {
        getVapi()?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "");
        return;
      }

      const greeting =
        greetingOverride ||
        "Welcome to Bolke Order! What would you like to order today?";

      const doSpeak = () => {
        updateStatus("connected");
        speak(greeting);
      };

      if (
        typeof window !== "undefined" &&
        window.speechSynthesis.getVoices().length === 0
      ) {
        window.speechSynthesis.onvoiceschanged = doSpeak;
      } else {
        doSpeak();
      }
    },
    [mode, speak, updateStatus]
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    isSpeakingRef.current = false;
    if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
    pendingFinalRef.current = "";
    safeStopRecognition();
    setVolumeLevel(0);
    updateStatus("inactive");
    setFinalTranscript("");
    setInterimTranscript("");
  }, [safeStopRecognition, updateStatus]);

  const toggleMode = useCallback(
    (newMode: AssistantMode) => {
      if (
        statusRef.current !== "inactive" &&
        statusRef.current !== "ordered"
      ) {
        stop();
      }
      setMode(newMode);
    },
    [stop]
  );

  const clearFinalTranscript = useCallback(() => {
    setFinalTranscript("");
    pendingFinalRef.current = "";
  }, []);

  return {
    mode,
    status,
    volumeLevel,
    interimTranscript,
    finalTranscript,
    toggleMode,
    start,
    stop,
    speak,
    startListening: safeStartRecognition,
    stopListening: safeStopRecognition,
    updateStatus,
    clearFinalTranscript,
    setLanguageMode: (_lang: Language) => {},
    startAudioFeedback: () => {}, 
  };
}