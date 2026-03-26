interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 44, text: "text-2xl" },
};

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const { icon, text } = sizes[size];
  const textColor = variant === "light" ? "#ffffff" : "var(--text-dark)";
  const subColor =
    variant === "light" ? "rgba(255,255,255,0.6)" : "var(--primary)";

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="44" height="44" rx="12" fill="var(--primary)" />
        <rect width="44" height="44" rx="12" fill="url(#logoGrad)" />
        {/* Cross */}
        <rect x="19" y="10" width="6" height="24" rx="3" fill="white" />
        <rect x="10" y="19" width="24" height="6" rx="3" fill="white" />
        {/* Pulse dot */}
        <circle cx="33" cy="11" r="4" fill="var(--accent)" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col leading-none">
        <span
          className={`${text} font-display font-bold tracking-tight`}
          style={{ color: textColor }}
        >
          Apna<span style={{ color: "var(--accent)" }}>Doctor</span>
        </span>
        <span
          className="font-body text-[10px] tracking-widest uppercase"
          style={{ color: subColor }}
        >
          Pakistan
        </span>
      </div>
    </div>
  );
}
