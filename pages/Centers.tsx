import React from 'react';
import { ViewState } from '../types';
import { MapPin, Navigation, Phone, Search } from 'lucide-react';

interface CentersProps {
    onCenterClick?: (id: number) => void;
}

export const Centers: React.FC<CentersProps> = ({ onCenterClick }) => {
  return (
    <div className="h-[calc(100vh-80px)] relative bg-slate-100">
      
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 md:left-8 md:w-96 z-10 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Trouver un centre SSR</h2>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Ville, quartier..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800">Centre Médical La Grace</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ouvert</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <MapPin size={12} /> Cotonou, Haie Vive
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => onCenterClick && onCenterClick(i)}
                                className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                            >
                                Détails
                            </button>
                            <button className="flex-1 py-1.5 bg-pink-500 text-white text-xs font-medium rounded-lg hover:bg-pink-600 flex items-center justify-center gap-1">
                                <Navigation size={12} /> Itinéraire
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Map Mock Background */}
      <div className="w-full h-full bg-[#e5e7eb] relative overflow-hidden flex items-center justify-center">
        {/* Simple pattern to simulate map */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Decorative Map Elements */}
        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
             <div 
                onClick={() => onCenterClick && onCenterClick(1)}
                className="relative group cursor-pointer"
             >
                 <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-2xl text-white animate-bounce">
                     <MapPin size={24} fill="currentColor" />
                 </div>
                 <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="font-bold text-sm">Centre Principal</p>
                 </div>
             </div>
        </div>

        <div className="absolute top-1/3 left-2/3">
             <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shadow-xl text-white hover:scale-125 transition-transform cursor-pointer">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
             </div>
        </div>

         <div className="absolute bottom-1/3 right-1/4">
             <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shadow-xl text-white hover:scale-125 transition-transform cursor-pointer">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
             </div>
        </div>

        <div className="absolute bottom-8 right-8 bg-white p-2 rounded-lg shadow-lg text-xs text-slate-500">
            Map Data © 2025 Google
        </div>
      </div>
    </div>
  );
};