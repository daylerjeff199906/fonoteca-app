import { Badge } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0F2531]">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8DC63F]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8DC63F]/5 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
          <div className="leaf-shape w-24 h-24 bg-[#8DC63F] flex items-center justify-center shadow-2xl shadow-[#8DC63F]/20 animate-slide-up">
            <span className="text-4xl font-bold text-[#0F2531]">F</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#8DC63F] rounded-full animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Fonoteca <span className="text-[#8DC63F]">Admin</span>
          </h1>
          <p className="text-[#718e9a] text-lg max-w-md mx-auto">
            Sistema de Gestión de la Fonoteca de Especies del IIAP.
            Panel centralizado y moderno.
          </p>
        </div>

        <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8DC63F]/20 flex items-center justify-center text-[#8DC63F]">
              <div className="w-2 h-2 bg-[#8DC63F] rounded-full" />
            </div>
            <div>
              <p className="text-xs text-[#718e9a] uppercase tracking-wider font-semibold">Estado</p>
              <p className="text-white font-medium">Sistema Listo</p>
            </div>
          </div>
          
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              v0.1
            </div>
            <div>
              <p className="text-xs text-[#718e9a] uppercase tracking-wider font-semibold">Versión</p>
              <p className="text-white font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        <button className="group relative mt-4">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8DC63F] to-[#5a8b1c] rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-8 py-4 bg-[#0F2531] rounded-xl leading-none flex items-center border border-white/10 group-hover:border-[#8DC63F]/50 transition duration-200">
            <span className="text-white group-hover:text-[#8DC63F] transition duration-200">Iniciar Sesión</span>
          </div>
        </button>
      </div>
    </main>
  );
}
