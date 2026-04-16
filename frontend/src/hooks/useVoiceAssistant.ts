"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";

export type AssistantMode = "vapi" | "free";
export type CallStatus =
  | "inactive"
  | "connecting"
  | "speaking"
  | "connected"
  | "ordered";
export type Language = "english" | "hindi";

// Singleton Vapi instance — avoids re-creating on re-renders
let vapiInstance: Vapi | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Callback types for Vapi event bridging
// The page passes these in so Vapi events can drive conversationEngine updates
// ─────────────────────────────────────────────────────────────────────────────
export type VapiTranscriptHandler = (role: "user" | "assistant", text: string) => void;
export type VapiFunctionCallHandler = (name: string, args: Record<string, unknown>) => void;

export interface VoiceAssistantOptions {
  defaultMode?: AssistantMode;
  onVapiTranscript?: VapiTranscriptHandler;
  onVapiFunctionCall?: VapiFunctionCallHandler;
  onVapiCallEnd?: () => void;
}

export function useVoiceAssistant(
  defaultModeOrOptions: AssistantMode | VoiceAssistantOptions = "free"
) {
  // Normalise argument — accept either string shorthand or options object
  const opts: VoiceAssistantOptions =
    typeof defaultModeOrOptions === "string"
      ? { defaultMode: defaultModeOrOptions }
      : defaultModeOrOptions;

  const {
    defaultMode = "free",
    onVapiTranscript,
    onVapiFunctionCall,
    onVapiCallEnd,
  } = opts;

  const [mode, setMode] = useState<AssistantMode>(defaultMode);
  const [status, setStatus] = useState<CallStatus>("inactive");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  // ── Refs ────────────────────────────────────────────────────────────────────
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const statusRef = useRef<CallStatus>("inactive");
  const isSpeakingRef = useRef(false);
  const finalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFinalRef = useRef("");
  const lastErrorRef = useRef("");
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const modeRef = useRef<AssistantMode>(defaultMode);

  // Keep refs current so event handlers never close over stale values
  const onVapiTranscriptRef = useRef(onVapiTranscript);
  const onVapiFunctionCallRef = useRef(onVapiFunctionCall);
  const onVapiCallEndRef = useRef(onVapiCallEnd);
  useEffect(() => { onVapiTranscriptRef.current = onVapiTranscript; }, [onVapiTranscript]);
  useEffect(() => { onVapiFunctionCallRef.current = onVapiFunctionCall; }, [onVapiFunctionCall]);
  useEffect(() => { onVapiCallEndRef.current = onVapiCallEnd; }, [onVapiCallEnd]);

  // ── Status helper ──────────────────────────────────────────────────────────
  const updateStatus = useCallback((s: CallStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ── Singleton Vapi ─────────────────────────────────────────────────────────
  const getVapi = useCallback((): Vapi | null => {
    if (typeof window === "undefined") return null;
    if (!vapiInstance) {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
      if (!key) {
        console.error("[Vapi] NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set.");
        return null;
      }
      vapiInstance = new Vapi(key);
    }
    return vapiInstance;
  }, []);

  // ── Volume simulation (free mode) ─────────────────────────────────────────
  const simulateVolume = useCallback((active: boolean) => {
    setVolumeLevel(active ? 0.6 : 0);
  }, []);

  // ── Free-mode recognition ──────────────────────────────────────────────────
  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isRecognitionActiveRef.current) return;
    if (statusRef.current !== "connected") return;
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      if (!e?.message?.includes("already started")) {
        console.warn("[SR] start() error:", e?.message);
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
      console.warn("[SR] Web Speech API not supported.");
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart = () => { isRecognitionActiveRef.current = true; };
    rec.onaudiostart = () => { simulateVolume(true); };
    rec.onspeechstart = () => { simulateVolume(true); };
    rec.onspeechend = () => { simulateVolume(false); };
    rec.onaudioend = () => { simulateVolume(false); };

    rec.onresult = (event: any) => {
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
        console.error("[SR] Microphone permission denied.");
        updateStatus("inactive");
      }
    };

    rec.onend = () => {
      isRecognitionActiveRef.current = false;
      simulateVolume(false);
    };

    recognitionRef.current = rec;
  }, [simulateVolume, updateStatus]);

  // ── Free-mode TTS ──────────────────────────────────────────────────────────
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
        updateStatus("connected");
        if (onEnd) {
          onEnd();
        } else {
          setTimeout(() => safeStartRecognition(), 600);
        }
      };

      utt.onerror = (e) => {
        console.warn("[TTS] error:", e.error);
        isSpeakingRef.current = false;
        if (e.error === "canceled") return;
        setTimeout(() => {
          if (statusRef.current === "speaking") updateStatus("connected");
          if (onEnd) {
            onEnd();
          } else if (statusRef.current === "connected") {
            safeStartRecognition();
          }
        }, 600);
      };

      synthRef.current.speak(utt);
    },
    [updateStatus, safeStopRecognition, safeStartRecognition]
  );

  // ── Wire up Vapi events once ───────────────────────────────────────────────
  useEffect(() => {
    setupRecognition();

    const vapi = getVapi();
    if (!vapi) return;

    const onCallStart = () => {
      console.log("[Vapi] call-start");
      updateStatus("connected");
    };

    const onCallEnd = () => {
      console.log("[Vapi] call-end");
      // Only go inactive if we weren't manually set to ordered
      if (statusRef.current !== "ordered") {
        updateStatus("inactive");
      }
      onVapiCallEndRef.current?.();
    };

    const onError = (e: any) => {
      console.error("[Vapi] error:", e);
      // Attempt graceful fallback
      if (modeRef.current === "vapi") {
        console.warn("[Vapi] Falling back to free mode due to error.");
        setMode("free");
        modeRef.current = "free";
      }
      updateStatus("inactive");
    };

    const onVolumeLevel = (v: number) => setVolumeLevel(v);

    // ── Key: message events carry transcripts AND function calls ──────────────
    const onMessage = (msg: any) => {
      // Vapi sends { type: "transcript", role, transcriptType, transcript }
      if (msg.type === "transcript") {
        const role: "user" | "assistant" =
          msg.role === "user" ? "user" : "assistant";
        const text: string = msg.transcript || "";

        if (!text.trim()) return;

        if (msg.transcriptType === "final") {
          // Bridge final transcript into the hook's state so page can consume it
          if (role === "user") {
            // Expose as finalTranscript so page's useEffect picks it up
            setFinalTranscript(text);
          }
          // Always call the external handler (for both user + assistant turns)
          onVapiTranscriptRef.current?.(role, text);
        } else {
          // Interim — show in UI
          if (role === "user") {
            setInterimTranscript(text);
          }
        }
      }

      // Vapi sends { type: "function-call", functionCall: { name, parameters } }
      if (msg.type === "function-call" && msg.functionCall) {
        onVapiFunctionCallRef.current?.(
          msg.functionCall.name,
          msg.functionCall.parameters ?? {}
        );
      }

      // Status signals
      if (msg.type === "speech-start") {
        updateStatus("speaking");
        setVolumeLevel(0.7);
      }
      if (msg.type === "speech-end") {
        updateStatus("connected");
        setVolumeLevel(0);
        setInterimTranscript("");
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("message", onMessage);

    return () => {
      safeStopRecognition();
      synthRef.current?.cancel();
      if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);

      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("error", onError);
      vapi.off("volume-level", onVolumeLevel);
      vapi.off("message", onMessage);
    };
  }, [setupRecognition, updateStatus, safeStopRecognition, getVapi]);

  // ── Public: start ──────────────────────────────────────────────────────────
  const start = useCallback(
    (greetingOverride?: string) => {
      updateStatus("connecting");
      setFinalTranscript("");
      setInterimTranscript("");
      pendingFinalRef.current = "";

      if (mode === "vapi") {
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
        if (!assistantId) {
          console.error("[Vapi] NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set.");
          updateStatus("inactive");
          return;
        }

        const overrides: any = {
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are BolKeOrder, a natural and polite food ordering assistant.
1. Start exactly by saying: "Welcome to BolKeOrder! What do you wanna order today?"
2. When the user lists items, verbally confirm them naturally and ask "Anything else?".
3. If the user indicates they are done (e.g. saying "No", "I don't need it", or "That's it"), tell them: "Alright, give me a moment to find the best price for your order." Then IMMEDIATELY call the "complete_order" function with their items. Do not ask for confirmation before calling the function.
4. Speak naturally in a mix of Hindi and English. Do NOT proactively mention you are comparing platforms until they are done ordering.`
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "complete_order",
                  description: "Call this when the user is done adding items and says they don't want anything else.",
                  parameters: {
                    type: "object",
                    properties: {
                      items: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of food items the user has ordered"
                      }
                    },
                    required: ["items"]
                  }
                }
              }
            ],
            temperature: 0.4
          }
        };

        getVapi()?.start(assistantId, overrides);
        return;
      }

      // ── Free mode ────────────────────────────────────────────────────────
      const greeting =
        greetingOverride ||
        "Welcome to BolKeOrder! What would you like to order today?";

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
    [mode, speak, updateStatus, getVapi]
  );

  // ── Public: stop ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (modeRef.current === "vapi") {
      try { getVapi()?.stop(); } catch (_) {}
    }
    synthRef.current?.cancel();
    isSpeakingRef.current = false;
    if (finalDebounceRef.current) clearTimeout(finalDebounceRef.current);
    pendingFinalRef.current = "";
    safeStopRecognition();
    setVolumeLevel(0);
    updateStatus("inactive");
    setFinalTranscript("");
    setInterimTranscript("");
  }, [safeStopRecognition, updateStatus, getVapi]);

  // ── Public: toggleMode ────────────────────────────────────────────────────
  const toggleMode = useCallback(
    (newMode: AssistantMode) => {
      if (
        statusRef.current !== "inactive" &&
        statusRef.current !== "ordered"
      ) {
        stop();
      }
      modeRef.current = newMode;
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
    // No-ops kept for API compatibility
    setLanguageMode: (_lang: Language) => {},
    startAudioFeedback: () => {},
  };
}