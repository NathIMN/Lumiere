
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Main content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* 4-corner star spinning */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl bg-[#1E88E5]/20 rounded-full animate-pulse"></div>
          
          {/* Star container */}
          <div className="relative w-32 h-32 animate-spin" style={{ animationDuration: '2.5s' }}>
            {/* 4-corner star using diamond shapes */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Center */}
              <circle cx="50" cy="50" r="8" fill="#002B5C" className="opacity-90"/>
              
              {/* Top point */}
              <path d="M 50 10 L 55 35 L 50 40 L 45 35 Z" fill="#002B5C"/>
              
              {/* Right point */}
              <path d="M 90 50 L 65 55 L 60 50 L 65 45 Z" fill="#002B5C"/>
              
              {/* Bottom point */}
              <path d="M 50 90 L 55 65 L 50 60 L 45 65 Z" fill="#002B5C"/>
              
              {/* Left point */}
              <path d="M 10 50 L 35 55 L 40 50 L 35 45 Z" fill="#002B5C"/>
              
              {/* Connecting lines to center */}
              <line x1="50" y1="40" x2="50" y2="42" stroke="#002B5C" strokeWidth="2"/>
              <line x1="60" y1="50" x2="58" y2="50" stroke="#002B5C" strokeWidth="2"/>
              <line x1="50" y1="60" x2="50" y2="58" stroke="#002B5C" strokeWidth="2"/>
              <line x1="40" y1="50" x2="42" y2="50" stroke="#002B5C" strokeWidth="2"/>
            </svg>
          </div>
        </div>
   
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-wide animate-pulse bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]">
            Loading
          </h2>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};
export default LoadingScreen;