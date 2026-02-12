import React, { useState } from 'react';
import { IntegrationService } from '../types';

interface IntegrationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  services: IntegrationService[];
  onToggleService: (id: string) => void;
}

const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({ isOpen, onClose, services, onToggleService }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-machine-surface border border-machine-highlight rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-machine-highlight flex justify-between items-center bg-machine-base/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
              <span className="text-machine-purple">///</span> INTEGRATION BUS (MCP)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">MANAGE EXTERNAL SERVICE PROTOCOLS</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-machine-base/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <div 
                key={service.id}
                onClick={() => onToggleService(service.id)}
                className={`relative group p-4 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                  service.connected 
                    ? `bg-${service.color}/10 border-${service.color}/50 shadow-[0_0_20px_rgba(var(--color-${service.color}),0.1)]` 
                    : 'bg-machine-highlight/20 border-white/5 hover:bg-machine-highlight/40 hover:border-white/10'
                }`}
              >
                {/* Status Indicator */}
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${service.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`}></div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-lg ${service.connected ? 'bg-white/10' : 'bg-black/30'}`}>
                    {/* Simplified Icons based on service name (simulation) */}
                     <span className="text-2xl" role="img" aria-label={service.name}>
                       {service.id === 'github' ? '🐙' : 
                        service.id === 'facebook' ? '📘' :
                        service.id === 'firebase' ? '🔥' :
                        service.id === 'slack' ? '💬' :
                        service.id === 'n8n' ? '⚡' :
                        service.id === 'remote' ? '🖥️' : '🔌'}
                     </span>
                  </div>
                  <div>
                    <h3 className={`font-bold ${service.connected ? 'text-white' : 'text-slate-400'}`}>{service.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{service.connected ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 mb-4 h-8 leading-tight">{service.description}</p>
                
                <div className={`w-full py-2 text-center text-xs font-bold rounded uppercase tracking-wider transition-colors ${
                  service.connected 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-machine-cyan/20 text-machine-cyan hover:bg-machine-cyan/30'
                }`}>
                  {service.connected ? 'Disconnect' : 'Connect'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-machine-highlight/10 border border-dashed border-slate-700 text-center">
            <p className="text-sm text-slate-500">Connect more services via API Keys in Settings</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-machine-highlight bg-machine-base/80 text-center">
          <span className="text-[10px] text-slate-600 font-mono">MCP PROTOCOL v1.2 // SECURE CONNECTION ESTABLISHED</span>
        </div>

      </div>
    </div>
  );
};

export default IntegrationDashboard;