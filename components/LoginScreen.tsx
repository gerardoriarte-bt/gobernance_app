
import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, UserCog, User, ArrowRight, Lock } from 'lucide-react';
import { UserRole } from '../types';

  const LoginScreen: React.FC = () => {
  const { loginWithGoogle, isLoading } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/60 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-16 space-y-6">
           <div className="inline-flex items-center justify-center mb-6">
              <img src="/lobueno-logo.png" alt="Lo Bueno" className="h-[140px] w-auto object-contain" />
           </div>
           
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight hidden">
             Governance Builder
           </h1>
           <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
             Enterprise naming convention system. Please select your access level to proceed.
           </p>
        </div>

        <div className="flex justify-center">
          <button 
            disabled={isLoading}
            onClick={loginWithGoogle}
            className="group relative flex items-center justify-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none border border-slate-800"
          >
            {isLoading ? (
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
            )}
            <span>Sign in with Google Workspace</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      <div className="mt-16 flex flex-col items-center justify-center gap-4 text-slate-400 text-xs font-medium uppercase tracking-widest opacity-80">
           <div className="flex items-center gap-4">
               <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Google SSO Ready</span>
               <span>•</span>
               <span>Secure Environment</span>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-300 w-full max-w-xs text-center opacity-70">
               Platform by Tecnología Buentipo
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
