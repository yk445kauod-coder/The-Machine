import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole, MachineMessage, ContentType } from '../types';
import SvgViewer from './widgets/SvgViewer';
import CodeViewer from './widgets/CodeViewer';
import TableViewer from './widgets/TableViewer';
import ImageViewer from './widgets/ImageViewer';
import SearchViewer from './widgets/SearchViewer';

interface MessageItemProps {
  message: MachineMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border ${isUser ? 'border-slate-600 bg-slate-800' : 'border-machine-cyan bg-machine-surface shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}>
          {isUser ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-machine-cyan animate-pulse-fast" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z" transform="rotate(180 12 12)" opacity="0.5"/></svg>
          )}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-xs font-bold ${isUser ? 'text-slate-400' : 'text-machine-cyan'}`}>
               {isUser ? 'OPERATOR' : 'THE MACHINE'}
             </span>
             <span className="text-[10px] text-slate-600">
               {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>

          <div className={`relative px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed overflow-hidden ${
            isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-machine-highlight/30 text-slate-200 border border-machine-highlight/50 rounded-tl-none backdrop-blur-sm'
          }`}>
            
            {message.isThinking && (
               <div className="flex items-center gap-2 text-machine-purple text-xs font-mono animate-pulse">
                 <span>PROCESSING_INTENT...</span>
               </div>
            )}

            {!message.isThinking && (
              <>
                {/* User Attachments */}
                {isUser && message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-end">
                    {message.attachments.map((att, idx) => (
                      <div key={idx} className="w-16 h-16 rounded overflow-hidden border border-slate-600">
                        {att.mimeType.startsWith('image') ? (
                          <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[10px]">FILE</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary Text Content */}
                {message.content && (
                  <div className="markdown-body" dir="auto">
                    <ReactMarkdown 
                      components={{
                        code({node, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !String(children).includes('\n') ? (
                            <code className="bg-black/30 text-machine-purple px-1 py-0.5 rounded font-mono text-xs" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="my-2 rounded bg-black/50 p-2 overflow-x-auto border border-white/10">
                              <code className="font-mono text-xs text-slate-300 block whitespace-pre" {...props}>
                                {children}
                              </code>
                            </div>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Specialized Content Types */}
                {message.type === ContentType.IMAGE && message.metadata && (
                  <ImageViewer src={message.metadata.src} alt={message.content} />
                )}

                {message.type === ContentType.SVG && message.metadata && (
                  <SvgViewer code={message.metadata.code} description={message.metadata.description} />
                )}

                {message.type === ContentType.CODE && message.metadata && (
                  <CodeViewer 
                    language={message.metadata.language} 
                    code={message.metadata.code} 
                    filename={message.metadata.filename}
                    type={message.metadata.type}
                  />
                )}

                {message.type === ContentType.TABLE && message.metadata && (
                  <TableViewer data={message.metadata} />
                )}

                {message.type === ContentType.SEARCH_RESULT && message.metadata && (
                  <SearchViewer summary={message.metadata.summary} links={message.metadata.links} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;