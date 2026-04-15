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
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<Language>("english");

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const statusRef = useRef<CallStatus>("inactive");
  const isSpeakingRef = useRef(false);

  // Keep statusRef in sync
  useEffect(() => { statusRef.current = status; }, [status]);

  const getVapi = () => {
    if (!vapiInstance && typeof window !== "undefined") {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
      vapiInstance = new Vapi(publicKey);
    }
    return vapiInstance;
  };

  const startAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const microphone = audioCtx.createMediaStreamSource(stream);
      microphone.connect(analyser);
      microphoneRef.current = microphone;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        setVolumeLevel((sum / bufferLength) / 255);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.error("Mic access denied:", e);
    }
  };

  const stopAudioContext = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    microphoneRef.current?.disconnect();
    audioContextRef.current?.close();
    setVolumeLevel(0);
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setStatus("connected");
    } catch (e) { /* Already started */ }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (e) {}
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    isSpeakingRef.current = true;
    setStatus("speaking");
    stopListening();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Prefer Indian English voice for clear, natural speech
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes("Google UK English Female"))
      || voices.find(v => v.lang === "en-IN")
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (onEnd) onEnd();
      else {
        startListening();
        startAudioContext();
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  }, [startListening, stopListening]);

  const setupRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-IN";

    recognitionRef.current.onresult = (event: any) => {
      let t = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        t += event.results[i][0].transcript;
      }
      setTranscript(t.trim());
    };

    recognitionRef.current.onerror = (e: any) => {
      if (e.error !== "no-speech") console.error("Recognition error:", e.error);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart only if still in connected state
      if (statusRef.current === "connected" && !isSpeakingRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    setupRecognition();

    const vapi = getVapi();
    if (vapi) {
      vapi.on("call-start", () => setStatus("connected"));
      vapi.on("call-end", () => setStatus("inactive"));
      vapi.on("error", (e: any) => { console.error(e); setStatus("inactive"); });
      vapi.on("volume-level", (v: number) => setVolumeLevel(v));
    }
  }, [setupRecognition]);

  const toggleMode = (newMode: AssistantMode) => {
    if (statusRef.current !== "inactive" && statusRef.current !== "ordered") stop();
    setMode(newMode);
  };

  const setLanguageMode = (lang: Language) => setLanguage(lang);

  const start = (greetingOverride?: string) => {
    setStatus("connecting");
    setTranscript("");
    if (mode === "vapi") {
      getVapi()?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "");
    } else {
      const greeting = greetingOverride || "Welcome to Bolke Order! What would you like to order today?";
      // Ensure voices are loaded
      const doSpeak = () => speak(greeting);
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = doSpeak;
      } else {
        doSpeak();
      }
    }
  };

  const stop = () => {
    synthRef.current?.cancel();
    isSpeakingRef.current = false;
    stopListening();
    stopAudioContext();
    setStatus("inactive");
    setTranscript("");
  };

  const updateStatus = (s: CallStatus) => setStatus(s);
  const clearTranscript = () => setTranscript("");

  return {
    mode, status, volumeLevel, transcript, language,
    toggleMode, start, stop, speak,
    startListening, stopListening: stopListening,
    updateStatus, clearTranscript, setLanguageMode,
    startAudioFeedback: startAudioContext,
  };
}
