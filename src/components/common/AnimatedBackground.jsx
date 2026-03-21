function AnimatedBackground({ variant = 'light', className = '' }) {
  const isDark = variant === 'dark'

  return (
    <div
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden ${className}`}
    >
      <div
        className={`absolute inset-0 h-full w-full ${
          isDark ? 'bg-[#05070A]' : 'bg-[#f7faf7]'
        }`}
      />

      <div
        className={`absolute inset-[-20%] h-[140%] w-[140%] rounded-full blur-3xl animate-[galaxySpin_40s_linear_infinite] ${
          isDark
            ? 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(34,197,94,0.08),rgba(255,255,255,0.02),rgba(22,101,52,0.14),rgba(255,255,255,0.03),rgba(34,197,94,0.08))]'
            : 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(22,101,52,0.06),rgba(255,255,255,0.02),rgba(34,197,94,0.08),rgba(17,24,39,0.03),rgba(22,101,52,0.06))]'
        }`}
        style={{
          left: '-20%',
          top: '-20%',
        }}
      />

      <div
        className={`absolute left-[-10%] top-[-5%] h-[70%] w-[55%] rounded-full blur-3xl animate-[nebulaDriftA_24s_ease-in-out_infinite] ${
          isDark ? 'bg-green-500/10' : 'bg-green-300/16'
        }`}
      />

      <div
        className={`absolute right-[-8%] top-[10%] h-[60%] w-[45%] rounded-full blur-3xl animate-[nebulaDriftB_28s_ease-in-out_infinite] ${
          isDark ? 'bg-emerald-300/6' : 'bg-lime-200/16'
        }`}
      />

      <div
        className={`absolute bottom-[-12%] left-[20%] h-[55%] w-[40%] rounded-full blur-3xl animate-[nebulaDriftC_30s_ease-in-out_infinite] ${
          isDark ? 'bg-white/5' : 'bg-emerald-100/20'
        }`}
      />

      <div
        className={`absolute inset-0 h-full w-full animate-[starfieldDrift_60s_linear_infinite] ${
          isDark
            ? 'bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.9)_0_1px,transparent_1.5px),radial-gradient(circle_at_28%_36%,rgba(255,255,255,0.75)_0_1px,transparent_1.5px),radial-gradient(circle_at_44%_22%,rgba(255,255,255,0.85)_0_1px,transparent_1.5px),radial-gradient(circle_at_58%_62%,rgba(255,255,255,0.7)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.8)_0_1px,transparent_1.5px),radial-gradient(circle_at_84%_54%,rgba(255,255,255,0.7)_0_1px,transparent_1.5px),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.75)_0_1px,transparent_1.5px),radial-gradient(circle_at_66%_84%,rgba(255,255,255,0.8)_0_1px,transparent_1.5px)]'
            : 'bg-[radial-gradient(circle_at_12%_18%,rgba(22,101,52,0.18)_0_1px,transparent_1.5px),radial-gradient(circle_at_28%_36%,rgba(22,101,52,0.14)_0_1px,transparent_1.5px),radial-gradient(circle_at_44%_22%,rgba(17,24,39,0.10)_0_1px,transparent_1.5px),radial-gradient(circle_at_58%_62%,rgba(22,101,52,0.14)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_28%,rgba(22,101,52,0.16)_0_1px,transparent_1.5px),radial-gradient(circle_at_84%_54%,rgba(17,24,39,0.08)_0_1px,transparent_1.5px),radial-gradient(circle_at_18%_78%,rgba(22,101,52,0.12)_0_1px,transparent_1.5px),radial-gradient(circle_at_66%_84%,rgba(22,101,52,0.14)_0_1px,transparent_1.5px)]'
        }`}
      />

      <div
        className={`absolute inset-0 h-full w-full animate-[auroraSweep_18s_ease-in-out_infinite] ${
          isDark
            ? 'bg-[linear-gradient(115deg,transparent_15%,rgba(34,197,94,0.05)_35%,rgba(255,255,255,0.02)_50%,rgba(22,101,52,0.08)_68%,transparent_85%)]'
            : 'bg-[linear-gradient(115deg,transparent_15%,rgba(34,197,94,0.04)_35%,rgba(255,255,255,0.02)_50%,rgba(22,101,52,0.05)_68%,transparent_85%)]'
        }`}
      />

      <div
        className={`absolute inset-0 h-full w-full ${
          isDark
            ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_70%,rgba(0,0,0,0.35)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.02)_70%,rgba(17,24,39,0.04)_100%)]'
        }`}
      />
    </div>
  )
}

export default AnimatedBackground