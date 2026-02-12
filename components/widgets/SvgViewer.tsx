import React from 'react';

interface SvgViewerProps {
  code: string;
  description: string;
}

const SvgViewer: React.FC<SvgViewerProps> = ({ code, description }) => {
  return (
    <div className="my-4 p-4 rounded-xl bg-machine-highlight/50 border border-machine-cyan/30 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-machine-cyan uppercase tracking-wider">SVG Renderer</span>
        <span className="text-xs text-slate-400">{description}</span>
      </div>
      <div 
        className="w-full flex justify-center items-center bg-white/5 rounded-lg p-6 overflow-auto"
        dangerouslySetInnerHTML={{ __html: code }} 
      />
      <div className="mt-2 flex justify-end">
        <button 
          onClick={() => {
            const blob = new Blob([code], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated.svg';
            a.click();
          }}
          className="text-xs flex items-center gap-2 text-machine-cyan hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download SVG
        </button>
      </div>
    </div>
  );
};

export default SvgViewer;