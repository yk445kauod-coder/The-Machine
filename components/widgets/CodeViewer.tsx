import React, { useState } from 'react';

interface CodeViewerProps {
  language: string;
  code: string;
  filename?: string;
  type?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ language, code, filename, type }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl bg-[#0d1117] border border-machine-highlight overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-machine-highlight">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-3 text-xs font-mono text-slate-400">{filename || 'script'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-bold text-machine-purple/70">{language}</span>
          <button 
            onClick={handleCopy}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
      {type === 'os_simulation' && (
        <div className="bg-black p-2 border-t border-machine-highlight">
           <div className="font-mono text-xs text-green-500">
             > SYSTEM_BUILD_INIT... OK<br/>
             > KERNEL_LOAD... OK<br/>
             > MOUNTING_FS... OK
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeViewer;