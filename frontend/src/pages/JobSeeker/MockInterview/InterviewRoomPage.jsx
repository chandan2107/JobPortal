import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Vapi from "@vapi-ai/web";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Clock,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Key,
  HelpCircle,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Session state from navigation or fetched
  const [session, setSession] = useState(location.state?.session || null);
  const [vapiAssistant, setVapiAssistant] = useState(location.state?.vapiAssistant || null);
  const [vapiPublicKey, setVapiPublicKey] = useState(
    location.state?.vapiPublicKey || import.meta.env.VITE_VAPI_PUBLIC_KEY || ""
  );

  // Vapi instance & call status
  const vapiRef = useRef(null);
  const [callStatus, setCallStatus] = useState("initializing"); // "initializing" | "connecting" | "active" | "ended" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  // Real-time live captions
  const [liveAiText, setLiveAiText] = useState("");
  const [liveUserText, setLiveUserText] = useState("");

  // Cumulative transcript
  const [transcript, setTranscript] = useState([]);
  const transcriptRef = useRef([]);
  transcriptRef.current = transcript;

  // Elapsed timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const secondsElapsedRef = useRef(0);
  secondsElapsedRef.current = secondsElapsed;
  const timerRef = useRef(null);

  // Dynamic Interviewer Name
  const interviewerName =
    session?.interviewerName ||
    (session?.voiceId === "luna"
      ? "Sarah"
      : session?.voiceId === "asteria"
      ? "Asteria"
      : "Alex");

  // Webcam self-preview
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Manual API Key entry if not in env
  const [customKeyModal, setCustomKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState("");

  // Scroll to bottom of chat
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveAiText, liveUserText]);

  // Load session & public key if not passed in route state
  useEffect(() => {
    const initSessionData = async () => {
      try {
        if (!session) {
          const res = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_BY_ID(id));
          if (res.data?.session) {
            setSession(res.data.session);
          }
        }

        if (!vapiPublicKey) {
          const configRes = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_CONFIG);
          if (configRes.data?.vapiPublicKey) {
            setVapiPublicKey(configRes.data.vapiPublicKey);
          } else {
            // Need public key from user
            setCustomKeyModal(true);
          }
        }
      } catch (err) {
        console.error("Error loading session:", err);
      }
    };

    initSessionData();
  }, [id]);

  // Initialize Webcam Preview (staggered slightly to avoid hardware lock collision with microphone preflight)
  useEffect(() => {
    let activeStream = null;
    let timeoutId = null;

    const startCamera = async () => {
      if (cameraEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: false,
          });
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (camErr) {
          console.warn("Camera preview not permitted or unavailable:", camErr);
          setCameraEnabled(false);
        }
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    // Stagger camera request slightly so audio preflight claims mic first without device contention
    timeoutId = setTimeout(() => {
      startCamera();
    }, 600);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraEnabled]);

  // Start Call once public key and assistant are ready
  useEffect(() => {
    if (!vapiPublicKey || !vapiAssistant) return;

    let isCleanedUp = false;
    let vapi = null;
    try {
      vapi = new Vapi(vapiPublicKey);
      vapiRef.current = vapi;
      setCallStatus("connecting");
      setErrorMessage("");

      // Register Vapi Listeners
      vapi.on("call-start", () => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        setErrorMessage("");
        setCallStatus("active");
        toast.success("AI Interviewer joined the room!");
        // Start Timer
        timerRef.current = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
      });

      vapi.on("call-end", () => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        setCallStatus("ended");
        clearInterval(timerRef.current);
        handleEndCallCleanup();
      });

      vapi.on("speech-start", () => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        // AI started speaking
        setIsAiSpeaking(true);
      });

      vapi.on("speech-end", () => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        setIsAiSpeaking(false);
      });

      vapi.on("volume-level", (volume) => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        setVolumeLevel(volume || 0);
      });

      vapi.on("message", (message) => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        if (message.type === "transcript") {
          const isUser = message.role === "user";
          const isAi = message.role === "assistant";

          if (isUser) {
            setIsUserSpeaking(true);
            setTimeout(() => setIsUserSpeaking(false), 2000);
          }

          if (message.transcriptType === "partial") {
            if (isAi) setLiveAiText(message.transcript);
            if (isUser) setLiveUserText(message.transcript);
          } else if (message.transcriptType === "final") {
            const newEntry = {
              role: isAi ? "ai" : "user",
              text: message.transcript,
              timestamp: secondsElapsedRef.current,
            };

            setTranscript((prev) => [...prev, newEntry]);

            if (isAi) setLiveAiText("");
            if (isUser) setLiveUserText("");
          }
        }
      });

      vapi.on("error", (error) => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        console.error("Vapi call error:", error);
        let msg =
          error?.message ||
          "Failed to connect to voice engine. Please check your mic permissions and Vapi credentials.";
        if (
          error?.type === "microphone-preflight-AbortError" ||
          error?.stage === "microphone-preflight"
        ) {
          msg =
            "Microphone access was interrupted or another application is using your mic. Please make sure your mic is allowed in browser settings and click Retry Call.";
        }
        setErrorMessage(msg);
        setCallStatus("error");
      });

      // Launch the call with the assistant configuration
      vapi.start(vapiAssistant).catch((startErr) => {
        if (isCleanedUp || vapiRef.current !== vapi) return;
        console.error("vapi.start error:", startErr);
      });
    } catch (err) {
      if (!isCleanedUp) {
        console.error("Vapi init error:", err);
        setErrorMessage(err.message || "Could not start voice session.");
        setCallStatus("error");
      }
    }

    return () => {
      isCleanedUp = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (vapiRef.current === vapi) {
        vapiRef.current = null;
      }
      if (vapi) {
        try {
          vapi.stop();
        } catch (e) {}
      }
    };
  }, [vapiPublicKey, vapiAssistant]);

  // Clean up and save transcript when call ends
  const handleEndCallCleanup = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    const currentTranscript = transcriptRef.current;
    if (currentTranscript.length > 0) {
      try {
        await axiosInstance.post(
          API_PATHS.MOCK_INTERVIEW.SAVE_TRANSCRIPT(id),
          {
            transcript: currentTranscript,
            duration: secondsElapsedRef.current,
          }
        );
      } catch (saveErr) {
        console.error("Failed to save transcript:", saveErr);
      }
    }

    navigate(`/mock-interview/${id}/report`, { replace: true });
  };

  const handleEndInterviewManual = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    } else {
      handleEndCallCleanup();
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const nextMuted = !isMuted;
      vapiRef.current.setMuted(nextMuted);
      setIsMuted(nextMuted);
      toast(nextMuted ? "Microphone Muted" : "Microphone Active", {
        icon: nextMuted ? "🔇" : "🎤",
      });
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen bg-[#090c15] text-zinc-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Bar Header */}
      <header className="h-16 px-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide flex items-center gap-2">
              <span>{session?.role || "Mock Interview"}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {session?.difficulty || "Fresher"}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span>{session?.interviewType || "Mixed"} Round</span>
              <span>•</span>
              <span>{session?.questionCount || 5} Questions</span>
            </div>
          </div>
        </div>

        {/* Live Call Indicator & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                callStatus === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : callStatus === "connecting"
                  ? "bg-amber-500 animate-ping"
                  : "bg-zinc-500"
              }`}
            />
            <span className="text-zinc-300 font-semibold">{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleEndInterviewManual}
            className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Dual Stage (AI Interviewer Panel + Candidate Panel) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Stage: AI Interviewer */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
              isAiSpeaking ? "opacity-30" : "opacity-10"
            } bg-[radial-gradient(circle_at_center,#3b82f6_0%,transparent_70%)]`}
          />

          {/* Top Stage Tag */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>{interviewerName} • AI Senior Interviewer</span>
            </div>
            {isAiSpeaking ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                Speaking
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400">
                Listening
              </span>
            )}
          </div>

          {/* Center: Dynamic Animated Holographic Audio Orb */}
          <div className="flex-1 flex flex-col items-center justify-center my-6 z-10">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <motion.div
                animate={{
                  scale: isAiSpeaking ? [1, 1.25, 1] : 1,
                  opacity: isAiSpeaking ? [0.4, 0.8, 0.4] : 0.2,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                className="absolute w-44 h-44 rounded-full bg-blue-500/20 blur-xl"
              />

              {/* Middle Core Glow */}
              <motion.div
                animate={{
                  scale: isAiSpeaking ? 1 + volumeLevel * 0.5 : 1,
                }}
                transition={{ duration: 0.1 }}
                className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#0d1222] flex items-center justify-center relative overflow-hidden">
                  <Bot className="w-12 h-12 text-blue-400" />
                  {/* Frequency Wave Ripple overlay */}
                  {isAiSpeaking && (
                    <motion.div
                      animate={{ y: [-15, 15, -15] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Speaking Status Text */}
            <div className="mt-4 text-xs font-medium text-zinc-400">
              {callStatus === "connecting" ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Connecting to Vapi Voice Assistant...
                </span>
              ) : isAiSpeaking ? (
                <span className="text-blue-400 font-semibold">Speaking question...</span>
              ) : (
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {interviewerName} is listening patiently (5-6s pause allowed)...
                </span>
              )}
            </div>
          </div>

          {/* Real-time Live AI Caption Banner */}
          <div className="z-10 bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 min-h-[56px] flex items-center">
            <p className="text-xs sm:text-sm text-zinc-200 font-medium italic line-clamp-3">
              {liveAiText ? (
                <>
                  <span className="text-blue-400 font-bold not-italic mr-1.5">{interviewerName}:</span>
                  "{liveAiText}"
                </>
              ) : (
                <span className="text-zinc-500 font-normal not-italic">
                  Live AI speech transcript will appear here word-by-word as questions are spoken.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Stage: Candidate Panel (Local Webcam + Real-time Answer Captions) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
          {/* Top Candidate Tag & Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <User className="w-4 h-4 text-emerald-400" />
              <span>You (Candidate)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  cameraEnabled
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
                title={cameraEnabled ? "Turn Off Webcam" : "Turn On Webcam"}
              >
                {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  !isMuted
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {!isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center: Video Feed or Voice Avatar */}
          <div className="flex-1 flex items-center justify-center my-4 relative rounded-xl overflow-hidden bg-black/40 border border-zinc-800/80">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <User className="w-10 h-10" />
                </div>
                <div className="text-xs text-zinc-400">
                  Camera is turned off (Audio Only Mode)
                </div>
              </div>
            )}

            {/* Speaking Pulse Badge over video */}
            {isUserSpeaking && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/80 text-white backdrop-blur-md flex items-center gap-1.5 shadow-md">
                <Mic className="w-3 h-3 animate-pulse" />
                <span>Answering...</span>
              </div>
            )}
          </div>

          {/* Real-time Live Candidate Caption Banner */}
          <div className="z-10 bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 min-h-[56px] flex items-center">
            <p className="text-xs sm:text-sm text-zinc-200 font-medium italic line-clamp-3">
              {liveUserText ? (
                <>
                  <span className="text-emerald-400 font-bold not-italic mr-1.5">You:</span>
                  "{liveUserText}"
                </>
              ) : (
                <span className="text-zinc-500 font-normal not-italic">
                  Speak clearly into your mic. Your voice answer will transcribe here in real time.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Collapsible Conversation Log Drawer */}
      <div className="h-44 border-t border-zinc-800/80 bg-zinc-950/95 p-4 flex flex-col z-20 flex-shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Real-Time Conversation Log ({transcript.length} turns)</span>
          </div>
          <span className="text-[11px] text-zinc-500">Auto-scrolling transcript</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-mono text-xs">
          {transcript.length === 0 ? (
            <div className="text-zinc-600 py-3 text-center italic">
              Conversation log is ready. Speak when Alex prompts you.
            </div>
          ) : (
            transcript.map((item, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                  item.role === "ai"
                    ? "bg-blue-950/30 border-blue-900/40 text-blue-200"
                    : "bg-emerald-950/30 border-emerald-900/40 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400 font-sans font-bold">
                  <span>{item.role === "ai" ? `${interviewerName} (Interviewer)` : "You (Candidate)"}</span>
                  <span>{formatTimer(item.timestamp)}</span>
                </div>
                <p className="font-sans text-xs">{item.text}</p>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Error or Missing Public Key Modal */}
      {customKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Key className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">Vapi Public Key Required</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To connect to Vapi voice servers, enter your free <strong>Public Key</strong> from{" "}
              <a
                href="https://vapi.ai"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                vapi.ai
              </a>{" "}
              dashboard, or save it to your <code>.env</code> file as <code>VAPI_PUBLIC_KEY</code>.
            </p>

            <input
              type="text"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate("/mock-interview")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!tempKeyInput.trim()) {
                    toast.error("Please enter a valid Vapi key.");
                    return;
                  }
                  setVapiPublicKey(tempKeyInput.trim());
                  setCustomKeyModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Error Banner */}
      {callStatus === "error" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-red-500/40 rounded-2xl p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Voice Connection Error</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/mock-interview")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Return to Setup
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Retry Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoomPage;
