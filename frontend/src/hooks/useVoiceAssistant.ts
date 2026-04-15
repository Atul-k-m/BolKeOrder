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

  // Separated interim (show in UI) vs final (send to engine)
  const [interimTranscript, setInterimTranscript] = useState(""); // partial words, display only
  const [finalTranscript, setFinalTranscript] = useState("");     // complete sentences, process these

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const statusRef = useRef<CallStatus>("inactive");
  const isSpeakingRef = useRef(false);
  const finalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFinalRef = useRef(""); // accumulate final words between debounce flushes

  useEffect(() => { statusRef.current = status; }, [status]);

  const getVapi = () => {
    if (!vapiInstance && typeof window !== "undefined") {
      vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
    }
    return vapiInstance;
  };

  const startAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const mic = ctx.createMediaStreamSource(stream);
      mic.connect(analyser);
      microphoneRef.current = mic;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setVolumeLevel(avg / 255);
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { console.error("Mic denied:", e); }
  };

  const stopAudioContext = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    microphoneRef.current?.disconnect();
    audioContextRef.current?.close();
    setVolumeLevel(0);
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setStatus("connected"); } catch (_) {}
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (_) {}
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    isSpeakingRef.current = true;
    setStatus("speaking");
    stopListening();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN";
    utt.rate = 0.88;   // Slower, more deliberate — easier to follow
    utt.pitch = 1.0;
    utt.volume = 1;

    const voices = synthRef.current.getVoices();
    // Prefer natural Indian-English or UK English female voice
    const preferred =
      voices.find(v => v.name === "Google UK English Female") ||
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.startsWith("en-GB")) ||
      voices.find(v => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;

    utt.onend = () => {
      isSpeakingRef.current = false;
      if (onEnd) onEnd();
      else { startListening(); startAudioContext(); }
    };
    utt.onerror = () => {
      isSpeakingRef.current = false;
      if (onEnd) onEnd();
    };
    synthRef.current.speak(utt);
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
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event: any) => {
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

      // Always show interim in UI so user sees their words
      setInterimTranscript(interim);

      // Accumulate final results — debounce before exposing to engine
      // This prevents processing every half-spoken word
      if (newFinal.trim()) {
        pendingFinalRef.current += " " + newFinal.trim();

        // Debounce: wait 1.5s of no-more-final before flushing
        if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
        finalDebounceRef.current = setTimeout(() => {
          const flushed = pendingFinalRef.current.trim();
          pendingFinalRef.current = "";
          setInterimTranscript(""); // clear interim on flush
          if (flushed) setFinalTranscript(flushed);
        }, 1500);
      }
    };

    recognitionRef.current.onerror = (e: any) => {
      if (e.error !== "no-speech") console.error("Recognition error:", e.error);
    };

    recognitionRef.current.onend = () => {
      if (statusRef.current === "connected" && !isSpeakingRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
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

  const start = (greetingOverride?: string) => {
    setStatus("connecting");
    setFinalTranscript("");
    setInterimTranscript("");
    pendingFinalRef.current = "";
    if (mode === "vapi") {
      getVapi()?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "");
    } else {
      const greeting = greetingOverride || "Welcome to Bolke Order! What would you like to order today?";
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
    if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
    pendingFinalRef.current = "";
    stopListening();
    stopAudioContext();
    setStatus("inactive");
    setFinalTranscript("");
    setInterimTranscript("");
  };

  const clearFinalTranscript = () => {
    setFinalTranscript("");
    pendingFinalRef.current = "";
  };

  return {
    mode, status, volumeLevel,
    interimTranscript,  // show this in the chat bubble as the user is speaking
    finalTranscript,    // process this in the conversation engine (debounced)
    toggleMode, start, stop, speak,
    startListening, stopListening,
    updateStatus: (s: CallStatus) => setStatus(s),
    clearFinalTranscript,
    setLanguageMode: (_lang: Language) => {},
    startAudioFeedback: startAudioContext,
  };
}
