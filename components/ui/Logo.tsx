interface LogoProps {
  variant?: "dark" | "light";
  height?: number;
}

export function Logo({ variant = "dark", height = 32 }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#162040";
  const dotColor = "#2dbe8f";

  return (
    <svg
      height={height}
      viewBox="0 0 148 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="crestem.ONG"
      style={{ display: "block" }}
    >
      <text
        x="0"
        y="28"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="22"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.5"
      >
        crestem
      </text>
      <circle cx="99" cy="26" r="3.5" fill={dotColor} />
      <text
        x="107"
        y="18"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="16"
        fontWeight="800"
        fill={textColor}
      >
        O
      </text>
      <text
        x="120"
        y="28"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="16"
        fontWeight="800"
        fill={textColor}
      >
        N
      </text>
      <text
        x="133"
        y="38"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="16"
        fontWeight="800"
        fill={textColor}
      >
        G
      </text>
    </svg>
  );
}
