import { useEffect, useState } from "react";

export function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-100 flex flex-col items-center justify-center  relative overflow-hidden">
      {/* Particles */}
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-rose-400 to-teal-400 opacity-60 animate-[float_6s_ease-in-out_infinite]"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        ></span>
      ))}

      {/* Star with rotating gradient */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Orbiting dots */}
        <div className="absolute w-36 h-36 animate-spin-slow">
          {["top", "right", "bottom", "left"].map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-teal-400 animate-ping"
              style={{
                top: pos === "top" ? "0" : pos === "bottom" ? "auto" : "50%",
                bottom: pos === "bottom" ? "0" : "auto",
                left: pos === "left" ? "0" : pos === "right" ? "auto" : "50%",
                right: pos === "right" ? "0" : "auto",
                transform:
                  pos === "top" || pos === "bottom"
                    ? "translateX(-50%)"
                    : "translateY(-50%)",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Star Shape */}
        <div className="w-20 h-20 bg-gradient-to-r from-rose-400 via-pink-300 via-purple-300 via-sky-300 to-teal-400 animate-[spin_3s_linear_infinite,pulse_2s_ease-in-out_infinite] [clip-path:polygon(50%_0%,65%_35%,100%_50%,65%_65%,50%_100%,35%_65%,0%_50%,35%_35%)] drop-shadow-[0_0_20px_rgba(255,107,107,0.3)]" />
      </div>

      {/* Loading Text */}
      <p className="mt-10 text-gray-500 tracking-[0.2em] uppercase animate-pulse">
        Loading
      </p>

      {/* Progress Bar */}
      <div className="mt-4 w-52 h-1 bg-gray-300/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-teal-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
