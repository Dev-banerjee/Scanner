"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Lock, Smartphone, Globe, ChevronRight, Command, Key, User, Eye, EyeOff } from "lucide-react";
import { saveScan } from "@/lib/scanStorage";
import { Sidebar } from "@/components/Sidebar";
import { GlitchHeading } from "@/components/GlitchHeading";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "waking" | "offline">("checking");

  // Wake up backend on page load
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    let cancelled = false;

    const wakeBackend = async (attempt = 1): Promise<void> => {
      if (cancelled) return;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${apiUrl}/ping`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok && !cancelled) {
          setBackendStatus("online");
        }
      } catch {
        if (cancelled) return;
        if (attempt <= 3) {
          setBackendStatus("waking");
          await new Promise(r => setTimeout(r, 3000));
          return wakeBackend(attempt + 1);
        }
        setBackendStatus("offline");
      }
    };

    wakeBackend();
    return () => { cancelled = true; };
  }, []);

  // Auth config
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [authMode, setAuthMode] = useState<"auto" | "interactive" | "cookies">("auto");
  const [loginUrl, setLoginUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sessionCookies, setSessionCookies] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Stealth mode
  const [isStealth, setIsStealth] = useState(true);

  const handleScan = async () => {
    if (!targetUrl) return;

    setIsScanning(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const payload: any = {
        url: targetUrl,
        stealth_mode: isStealth,
        user_id: user?.id
      };

      if (showAuthConfig) {
        payload.auth_mode = authMode;
        if (authMode === "auto" && loginUrl) {
          payload.login_url = loginUrl;
          payload.username = username;
          payload.password = password;
        } else if (authMode === "interactive" && loginUrl) {
          payload.login_url = loginUrl;
        } else if (authMode === "cookies" && sessionCookies) {
          // Parse cookies string into array
          try {
            payload.session_cookies = sessionCookies.split(';').map(c => {
              const [name, ...rest] = c.trim().split('=');
              return { name: name.trim(), value: rest.join('=').trim() };
            }).filter(c => c.name && c.value);
          } catch {
            payload.session_cookies = [];
          }
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      saveScan({
        id: data.scan_id,
        target: targetUrl,
        timestamp: Date.now(),
        duration: 0,
        status: "Scanning",
        crawledUrls: [],
        findings: [],
        config: {
          stealth: isStealth,
          auth: showAuthConfig ? authMode : undefined
        }
      });

      // Redirect to Live Activity page
      router.push(`/live-activity?scanId=${data.scan_id}`);
    } catch (err) {
      console.error("Scan error:", err);
      if (backendStatus !== "online") {
        setError("Backend is still waking up. Please wait a moment and try again.");
      } else {
        setError("Failed to start scan. Please try again.");
      }
      setIsScanning(false);
      setTimeout(() => setError(null), 7000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-black selection:bg-purple-500/30">
      {/* Aurora Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {backendStatus === "waking" && !error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/25 backdrop-blur-xl shadow-2xl">
              <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-sm font-medium text-amber-200">Waking up backend server...</span>
            </div>
          </motion.div>
        )}
        {backendStatus === "offline" && !error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/15 border border-red-500/25 backdrop-blur-xl shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm font-medium text-red-200">Backend server is unreachable. Scans may not work.</span>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-xl shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm font-medium text-red-200">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full h-full glass-panel rounded-[24px] md:rounded-[32px] lg:rounded-[48px] p-2 md:p-3 flex gap-3 relative z-10 overflow-hidden shadow-2xl ring-1 ring-white/10"
      >
        {/* Sidebar */}
        <Sidebar activeItem="Scanner" />

        {/* Main Content */}
        <div className="flex-1 rounded-[20px] md:rounded-[32px] lg:rounded-[40px] bg-bg-inner relative overflow-y-auto glass-scrollbar p-4 md:p-8 lg:p-12 pt-8 md:pt-16 lg:pt-20 flex flex-col items-center justify-start">

          {/* Dynamic Status Pill */}
          {/* Dynamic Status Pill */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 md:absolute md:top-8 md:left-1/2 md:-translate-x-1/2 md:mb-0"
          >
            {isStealth && (
              <div className="px-4 py-1.5 rounded-full bg-bg-card border border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]" />
                <span className="text-[10px] font-bold tracking-[0.15em] text-white/60 uppercase">Stealth Active</span>
              </div>
            )}
          </motion.div>

          <div className="w-full max-w-2xl text-center mb-8 md:mb-12">
            <GlitchHeading
              text="Safety First."
              className="text-3xl md:text-5xl lg:text-7xl mb-4 md:mb-6 tracking-tight"
            />
            <p className="text-sm md:text-lg text-white/40 font-medium tracking-wide px-4">
              Next-generation vulnerability scanning for the modern web.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl md:rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-bg-card border border-white/10 rounded-2xl md:rounded-[32px] p-1.5 md:p-2 pr-2 shadow-2xl focus-within:border-white/20 focus-within:bg-bg-card/90 transition-all duration-300">
                <div className="pl-4 md:pl-6 pr-2 md:pr-4 text-white/30">
                  <Globe className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <input
                  type="text"
                  placeholder="https://target.url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="w-full bg-transparent border-none text-white px-2 py-3 md:py-5 outline-none focus:outline-none focus:ring-0 placeholder:text-white/20 text-base md:text-xl font-medium tracking-tight"
                  disabled={isScanning}
                />
                <button
                  onClick={handleScan}
                  disabled={isScanning || !targetUrl}
                  className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-shrink-0"
                >
                  {isScanning ? (
                    <div className="w-5 h-5 md:w-6 md:h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Stealth Mode Card */}
            <div className="bg-bg-card border border-white/5 rounded-2xl md:rounded-[32px] p-4 md:p-6 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer" onClick={() => setIsStealth(!isStealth)}>
              <div className="flex items-center gap-3 md:gap-5">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[20px] flex items-center justify-center transition-colors duration-300 ${isStealth ? "bg-purple-500/20" : "bg-white/5"}`}>
                  <Eye className={`w-5 h-5 md:w-6 md:h-6 ${isStealth ? "text-purple-400" : "text-white/30"}`} />
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-white mb-0.5">Stealth Mode</p>
                  <p className="text-xs md:text-sm text-white/40 font-medium">Evade WAF & Rate Limits</p>
                </div>
              </div>
              <div className={`w-12 h-7 md:w-14 md:h-8 rounded-full p-1 transition-colors duration-300 ${isStealth ? "bg-purple-500" : "bg-white/10"}`}>
                <motion.div
                  className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
                  animate={{ x: isStealth ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>
            </div>

            {/* Authentication Card */}
            <div className="bg-bg-card border border-white/5 rounded-[32px] overflow-hidden">
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowAuthConfig(!showAuthConfig)}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors duration-300 ${showAuthConfig ? "bg-blue-500/20" : "bg-white/5"}`}>
                    <Lock className={`w-6 h-6 ${showAuthConfig ? "text-blue-400" : "text-white/30"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-0.5">Authentication</p>
                    <p className="text-sm text-white/40 font-medium">
                      {loginUrl && (authMode === "interactive" || (username && password))
                        ? "Configured"
                        : "Not configured"}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-6 h-6 text-white/20 transition-transform duration-300 ${showAuthConfig ? "rotate-90" : ""}`} />
              </div>

              <AnimatePresence>
                {showAuthConfig && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6 space-y-4 overflow-hidden relative z-10"
                  >
                    <div className="h-px w-full bg-white/5 mb-4" />

                    <div className="flex bg-black/40 rounded-[24px] p-1 mb-4 relative z-0">
                      {(["auto", "interactive", "cookies"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setAuthMode(mode)}
                          className={`flex-1 relative py-3 rounded-[20px] text-xs font-semibold transition-colors z-10 flex items-center justify-center ${authMode === mode ? "text-white" : "text-white/40 hover:text-white"
                            }`}
                        >
                          {authMode === mode && (
                            <motion.div
                              layoutId="authTab"
                              className="absolute inset-0 bg-white/10 rounded-[20px]"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">
                            {mode === "auto" ? "Auto" : mode === "interactive" ? "Interactive" : "🍪 Cookies"}
                          </span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={loginUrl}
                      onChange={(e) => setLoginUrl(e.target.value)}
                      placeholder="Login URL (e.g. site.com/login)"
                      className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-medium outline-none relative z-10 transition-colors focus:bg-white/10"
                    />

                    <AnimatePresence mode="popLayout">
                      {authMode === "auto" && (
                        <motion.div
                          key="auto-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="grid grid-cols-2 gap-4 overflow-hidden"
                        >
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-medium outline-none relative z-10 transition-colors focus:bg-white/10"
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-medium outline-none relative z-10 transition-colors focus:bg-white/10"
                          />
                        </motion.div>
                      )}
                      {authMode === "cookies" && (
                        <motion.div
                          key="cookies-field"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-2 overflow-hidden"
                        >
                          <p className="text-[10px] text-white/40 font-medium">
                            Paste cookies from DevTools (F12 → Application → Cookies)
                          </p>
                          <textarea
                            value={sessionCookies}
                            onChange={(e) => setSessionCookies(e.target.value)}
                            placeholder="session_id=abc123; auth_token=xyz789"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-xs font-mono outline-none relative z-10 transition-colors focus:bg-white/10 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "READY", value: "100%", color: "text-blue-400" },
                { label: "SECURE", value: "SSL", color: "text-green-400" },
                { label: "MODE", value: isStealth ? "STH" : "STD", color: isStealth ? "text-purple-400" : "text-white" },
              ].map((stat, i) => (
                <div key={i} className="bg-bg-card border border-white/5 rounded-[28px] p-5 text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-2">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} text-glow`}>{stat.value}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </motion.div>
    </main>
  );
}
