import { useMemo, useState } from "react";
import { ArrowRight, Copy, Sparkles, Wand2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { WavewardBottomWaves } from "@/components/waveward/WavewardBottomWaves";
import { WavewardCompanionRail } from "@/components/waveward/WavewardCompanionRail";
import { WavewardWatercolorBackground } from "@/components/waveward/WavewardWatercolorBackground";
import { WavewardWordmark } from "@/components/waveward/WavewardWordmark";
import { wavewardCompanions, wavewardHero } from "@/data/wavewardLanding";
import { useSessionStore } from "@/store/sessionStore";

type AuthMode = "login" | "register" | "auto";

const AUTH_TABS: { id: AuthMode; label: string; hint: string }[] = [
  { id: "login", label: "登录", hint: "已有账号，直接进入" },
  { id: "register", label: "注册", hint: "新建账号，开始旅程" },
  { id: "auto", label: "一键体验", hint: "自动生成账号" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const isLoggedIn = useSessionStore((state) => state.isLoggedIn);
  const login = useSessionStore((state) => state.login);
  const register = useSessionStore((state) => state.register);
  const autoRegister = useSessionStore((state) => state.autoRegister);
  const selectedPetId = useSessionStore((state) => state.selectedPetId);
  const selectPet = useSessionStore((state) => state.selectPet);

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoResult, setAutoResult] = useState<{ loginName: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const activeCompanion = useMemo(
    () => wavewardCompanions.find((item) => item.id === selectedPetId) ?? wavewardCompanions[0],
    [selectedPetId],
  );

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  const resetForm = () => {
    setErrorMessage("");
    setAutoResult(null);
    setCopied(false);
  };

  const handleLogin = async () => {
    if (isSubmitting) return;
    if (!loginName.trim()) {
      setErrorMessage("请输入账号。");
      return;
    }
    if (!password) {
      setErrorMessage("请输入密码。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await login(loginName.trim(), password);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    if (loginName.trim().length < 2) {
      setErrorMessage("账号至少需要 2 个字符。");
      return;
    }
    if (password.length < 4) {
      setErrorMessage("密码至少需要 4 个字符。");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await register(loginName.trim(), password);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "注册失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoRegister = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const generatedPassword = await autoRegister();
      const state = useSessionStore.getState();
      setAutoResult({ loginName: state.loginName, password: generatedPassword });
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "自动注册失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!autoResult) return;
    const text = `账号：${autoResult.loginName}\n密码：${autoResult.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("复制失败，请手动记录账号信息。");
    }
  };

  const handleSubmit = () => {
    if (mode === "login") {
      void handleLogin();
    } else if (mode === "register") {
      void handleRegister();
    } else {
      void handleAutoRegister();
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    resetForm();
  };

  const submitLabel =
    mode === "login"
      ? "登录涉浪"
      : mode === "register"
        ? "注册并进入"
        : isSubmitting
          ? "正在生成账号..."
          : "一键自动注册";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] text-[#1f4f84]">
      <WavewardWatercolorBackground />
      <WavewardBottomWaves />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-between px-3 pb-20 pt-6 sm:px-8 sm:pb-28 sm:pt-10">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="waveward-fade-up inline-flex items-center gap-2 rounded-full border border-[#d8ebf6] bg-white/65 px-5 py-2 text-sm tracking-[0.18em] text-[#6f9abb] shadow-[0_12px_28px_rgba(140,184,212,0.14)] backdrop-blur-sm">
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            蓝白水彩入口页
          </div>

          <div className="mt-10">
            <WavewardWordmark brandCn={wavewardHero.brandCn} brandEn={wavewardHero.brandEn} />
          </div>

          <section className="waveward-fade-up mt-10 max-w-3xl px-2 text-center sm:mt-14" style={{ animationDelay: "120ms" }}>
            <h2 className="font-waveward-display text-3xl font-medium leading-[1.45] tracking-[0.04em] text-[#1e4f89] sm:text-5xl">
              {wavewardHero.slogan}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 tracking-[0.08em] text-[#8eb5cf] sm:mt-5 sm:text-base">
              {wavewardHero.caption}
            </p>
          </section>

          <section
            className="waveward-fade-up mt-8 w-full max-w-xl rounded-[28px] border border-[#d6eaf6] bg-white/60 p-3 shadow-[0_26px_70px_rgba(135,184,214,0.18)] backdrop-blur-md sm:mt-12 sm:rounded-[34px] sm:p-5"
            style={{ animationDelay: "220ms" }}
          >
            <div className="flex gap-1 rounded-full bg-white/70 p-1 ring-1 ring-[#e2f0f8]">
              {AUTH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`flex-1 rounded-full px-3 py-2 text-sm tracking-[0.12em] transition-colors ${
                    mode === tab.id
                      ? "bg-[#2a6598] text-white shadow-[0_8px_18px_rgba(42,101,152,0.25)]"
                      : "text-[#6f9abb] hover:text-[#2a6598]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-center text-xs tracking-[0.08em] text-[#7da4c0]">
              {AUTH_TABS.find((tab) => tab.id === mode)?.hint}
            </p>

            {mode === "auto" ? (
              <div className="mt-4 rounded-[28px] bg-white/75 px-5 py-6 text-center ring-1 ring-[#e2f0f8]">
                <Wand2 className="mx-auto h-8 w-8 text-[#5f8fb2]" strokeWidth={1.6} />
                <p className="mt-3 text-sm leading-7 tracking-[0.06em] text-[#5f8fb2]">
                  系统会为你随机生成一个账号和密码，无需填写任何信息，直接进入涉浪体验。
                </p>
                <p className="mt-1 text-xs leading-6 tracking-[0.08em] text-[#9ab9cf]">
                  自动注册的账号信息会在进入后展示一次，请及时保存。
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block rounded-[24px] bg-white/75 px-4 py-3 ring-1 ring-[#e2f0f8] sm:rounded-[28px] sm:px-5 sm:py-4">
                  <span className="block text-xs tracking-[0.22em] text-[#7fa6c1]">账号</span>
                  <input
                    value={loginName}
                    onChange={(event) => setLoginName(event.target.value)}
                    autoComplete={mode === "login" ? "username" : "off"}
                    placeholder="2 个字符以上的账号名"
                    className="mt-2 w-full border-none bg-transparent p-0 font-waveward-display text-xl text-[#2a6598] outline-none placeholder:font-sans placeholder:text-sm placeholder:tracking-[0.08em] placeholder:text-[#b0c9da] sm:text-2xl sm:placeholder:text-base"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </label>

                <label className="block rounded-[24px] bg-white/75 px-4 py-3 ring-1 ring-[#e2f0f8] sm:rounded-[28px] sm:px-5 sm:py-4">
                  <span className="block text-xs tracking-[0.22em] text-[#7fa6c1]">密码</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder={mode === "login" ? "请输入密码" : "至少 4 个字符"}
                    className="mt-2 w-full border-none bg-transparent p-0 font-waveward-display text-xl text-[#2a6598] outline-none placeholder:font-sans placeholder:text-sm placeholder:tracking-[0.08em] placeholder:text-[#b0c9da] sm:text-2xl sm:placeholder:text-base"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </label>

                {mode === "register" ? (
                  <label className="block rounded-[24px] bg-white/75 px-4 py-3 ring-1 ring-[#e2f0f8] sm:rounded-[28px] sm:px-5 sm:py-4">
                    <span className="block text-xs tracking-[0.22em] text-[#7fa6c1]">确认密码</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="再次输入密码"
                      className="mt-2 w-full border-none bg-transparent p-0 font-waveward-display text-xl text-[#2a6598] outline-none placeholder:font-sans placeholder:text-sm placeholder:tracking-[0.08em] placeholder:text-[#b0c9da] sm:text-2xl sm:placeholder:text-base"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                  </label>
                ) : null}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={isSubmitting}
              className="waveward-button mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full px-6 py-4 font-waveward-display text-2xl font-medium tracking-[0.06em] text-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:text-3xl"
            >
              {isSubmitting ? "正在进入..." : submitLabel}
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </button>

            {autoResult ? (
              <div className="mt-4 rounded-[24px] border border-[#d6eaf6] bg-[#f3f9fd] px-5 py-4">
                <p className="text-xs tracking-[0.22em] text-[#5f8fb2]">自动注册成功，请保存以下信息</p>
                <div className="mt-2 space-y-1 text-sm leading-7 text-[#2a6598]">
                  <p>
                    账号：<span className="font-medium">{autoResult.loginName}</span>
                  </p>
                  <p>
                    密码：<span className="font-medium">{autoResult.password}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyCredentials();
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs tracking-[0.12em] text-[#5f8fb2] ring-1 ring-[#d6eaf6] transition-colors hover:text-[#2a6598]"
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {copied ? "已复制" : "复制账号密码"}
                </button>
              </div>
            ) : null}

            <p className="mt-4 text-center text-xs leading-6 tracking-[0.08em] text-[#7da4c0]">
              <span className="mr-2 font-medium text-[#5f8fb2]">{wavewardHero.helperLabel}</span>
              {wavewardHero.helperText}
            </p>
            {errorMessage ? (
              <p className="mt-3 text-center text-sm leading-6 text-[#d06c82]">{errorMessage}</p>
            ) : null}
          </section>

          <section
            className="waveward-fade-up mt-10 w-full max-w-5xl rounded-[40px] border border-[#d9ecf7] bg-white/45 px-4 py-5 shadow-[0_20px_56px_rgba(142,185,212,0.14)] backdrop-blur-md sm:px-6 sm:py-6"
            style={{ animationDelay: "320ms" }}
          >
            <WavewardCompanionRail
              items={wavewardCompanions}
              value={activeCompanion.id}
              onChange={(petId) => {
                void selectPet(petId);
              }}
            />

            <div className="mx-auto mt-4 max-w-2xl rounded-[28px] bg-white/60 px-5 py-4 text-center ring-1 ring-[#deeff8]">
              <p className="text-xs tracking-[0.24em] text-[#7ca5c2]">今日同行伙伴</p>
              <p className="mt-3 font-waveward-display text-3xl font-medium tracking-[0.08em] text-[#2a6598]">
                {activeCompanion.title}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6c95b2] sm:text-base">
                {activeCompanion.intro}
              </p>
            </div>
          </section>
        </div>

        <p className="waveward-fade-up mt-8 text-center text-xs tracking-[0.3em] text-[#9ab9cf]" style={{ animationDelay: "420ms" }}>
          WAVEWARD KEEPS THE FIRST STEP LIGHT.
        </p>
      </div>
    </main>
  );
}
