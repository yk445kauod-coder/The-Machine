import React from 'react';
import { SearchResult } from '../../types';

interface SearchViewerProps {
  summary: string;
  links: SearchResult[];
}

const SearchViewer: React.FC<SearchViewerProps> = ({ summary, links }) => {
  return (
    <div className="my-4 p-4 rounded-xl bg-machine-highlight/20 border-l-2 border-machine-purple">
      <div className="flex items-center gap-2 mb-3">
         <div className="p-1 rounded bg-machine-purple/20">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-machine-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
         </div>
         <span className="text-xs font-bold text-machine-purple uppercase">Global Network Search</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary}</p>
      
      {links.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 rounded bg-machine-base/50 hover:bg-machine-highlight/50 border border-transparent hover:border-machine-purple/30 transition-all group"
            >
              <div className="text-xs font-semibold text-machine-cyan truncate group-hover:underline">{link.title}</div>
              <div className="text-[10px] text-slate-500 truncate mt-1">{link.url}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchViewer;