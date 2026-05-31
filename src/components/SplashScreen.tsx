import { Trees } from "lucide-react";

interface SplashScreenProps {
  complexName: string;
  isFading: boolean;
}

export default function SplashScreen({ complexName, isFading }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-[#0c0f0c] via-[#121612] to-[#070907] flex flex-col items-center justify-center p-6 transition-opacity duration-700 select-none ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e221e_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>
      <div className="absolute top-[25%] bg-emerald-500/10 w-96 h-96 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col items-center text-center space-y-6 max-w-md w-full relative z-10">
        {/* Large Luxury Emblem with soft pulse */}
        <div className="relative flex items-center justify-center">
          {/* External glowing ring */}
          <div className="absolute w-28 h-28 rounded-[2.2rem] bg-emerald-500/5 animate-ping opacity-35"></div>
          
          {/* Main Logo Container */}
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#4a634e] to-[#233525] border-2 border-[#b2ceb4]/45 flex items-center justify-center shadow-[0_15px_45px_rgba(74,99,78,0.35)] hover:scale-105 transition-transform duration-300">
            <Trees className="w-11 h-11 text-[#b2ceb4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Brand details and tagline */}
        <div className="space-y-2 pt-2">
          <h1 className="text-xl md:text-2xl font-headline font-black tracking-[0.22em] text-white uppercase italic pl-[0.22em]">
            {complexName}
          </h1>
          <p className="text-[10px] font-sans font-bold text-[#f6bb89] uppercase tracking-[0.45em] pl-[0.45em]">
            Refugio de Montaña
          </p>
        </div>

        {/* High-Fidelity Shimmering Progress Bar */}
        <div className="w-48 h-[3px] bg-neutral-900/90 rounded-full mt-10 overflow-hidden relative border border-white/5 shadow-inner">
          <div className="h-full bg-gradient-to-r from-[#4a634e] via-[#f6bb89] to-[#b2ceb4] w-full absolute left-0 top-0 animate-shimmer-bar"></div>
        </div>

        {/* Loading/Prelude mini-indicator */}
        <span className="text-[8px] font-sans font-extrabold text-neutral-500 uppercase tracking-[0.25em] pt-1">
          Cargando Experiencia...
        </span>
      </div>
    </div>
  );
}
