
import React from 'react';
import { ShieldAlert } from 'lucide-react';

const TaxonomyFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > 2026 ? `2026 - ${currentYear}` : '2026';

  return (
    <footer className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
      <div className="flex flex-col items-center gap-4">
         <div className="flex items-center gap-6 opacity-30">
            <span>GDPR Compliant</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span>Naming Standards v1.5</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span>ISO 27001</span>
         </div>
         <p className="flex items-center justify-center gap-2">
            <ShieldAlert size={14} /> Governance Builder &copy; {displayYear}. All operations are logged.
         </p>
         <p className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity cursor-default">
            Platform by Grupo Lo Bueno
         </p>
      </div>
    </footer>
  );
};

export default TaxonomyFooter;
