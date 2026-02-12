import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, executeImageGeneration, executeSearch, switchAgentPersona, chatSession } from '../services/gemini';
import MessageItem from './MessageItem';
import InputConsole from './InputConsole';
import TaskManager from './TaskManager';
import IntegrationDashboard from './IntegrationDashboard';
import { MachineMessage, MessageRole, ContentType, MachineTask, TaskPriority, TaskStatus, Attachment, IntegrationService, AgentPersonaType } from '../types';

const INITIAL_SERVICES: IntegrationService[] = [
  { id: 'github', name: 'GitHub', icon: 'github', description: 'Repo management, issue tracking, and PR automation.', connected: false, color: 'white' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', description: 'Social profile management and automated posting.', connected: false, color: 'blue-500' },
  { id: 'firebase', name: 'Firebase', icon: 'firebase', description: 'Auth, Firestore, Functions & RTDB integration.', connected: false, color: 'orange-500' },
  { id: 'slack', name: 'Slack', icon: 'slack', description: 'Channel messaging and workspace bots.', connected: false, color: 'purple-500' },
  { id: 'n8n', name: 'N8N Automation', icon: 'n8n', description: 'Workflow automation triggers.', connected: false, color: 'pink-500' },
  { id: 'remote', name: 'Remote Desktop', icon: 'monitor', description: 'Secure remote control protocol.', connected: false, color: 'green-500' },
];

const TheMachine: React.FC = () => {
  const [messages, setMessages] = useState<MachineMessage[]>([
    {
      id: 'init-1',
      role: MessageRole.MODEL,
      content: "I am The Machine. Modular framework loaded. Capable of multi-modal generation and complex task execution. Awaiting prioritized commands.",
      type: ContentType.TEXT,
      timestamp: Date.now()
    }
  ]);
  const [tasks, setTasks] = useState<MachineTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [services, setServices] = useState<IntegrationService[]>(INITIAL_SERVICES);
  const [currentPersona, setCurrentPersona] = useState<AgentPersonaType>('general');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Queue Processing Loop
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing) return;

      const queuedTasks = tasks.filter(t => t.status === TaskStatus.QUEUED);
      if (queuedTasks.length === 0) return;

      const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
      queuedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      const nextTask = queuedTasks[0];
      await executeTask(nextTask);
    };

    processQueue();
  }, [tasks, isProcessing]);

  const addTask = (description: string, attachments: Attachment[], priority: TaskPriority) => {
    const newTask: MachineTask = {
      id: crypto.randomUUID(),
      title: description.length > 30 ? description.substring(0, 30) + '...' : description,
      priority,
      status: TaskStatus.QUEUED,
      progress: 0,
      type: 'general_query',
      timestamp: Date.now()
    };
    setTasks(prev => [...prev, newTask]);

    const userMsg: MachineMessage = {
      id: newTask.id,
      role: MessageRole.USER,
      content: description,
      type: ContentType.TEXT,
      attachments: attachments,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
  };

  const updateTaskStatus = (id: string, status: TaskStatus, progress: number = 0) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, progress } : t));
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPersona = e.target.value as AgentPersonaType;
    setCurrentPersona(newPersona);
    switchAgentPersona(newPersona);
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: MessageRole.MODEL,
      content: `Agent Persona Switched: ${newPersona.toUpperCase()} Mode Active.`,
      type: ContentType.TEXT,
      timestamp: Date.now()
    }]);
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
  };

  const executeTask = async (task: MachineTask) => {
    setIsProcessing(true);
    updateTaskStatus(task.id, TaskStatus.PROCESSING, 10);

    try {
      const userMsg = messages.find(m => m.id === task.id);
      const prompt = userMsg ? userMsg.content : task.title;
      const attachments = userMsg?.attachments || [];

      updateTaskStatus(task.id, TaskStatus.PROCESSING, 30);

      const result = await sendChatMessage(prompt, attachments);
      const response = result.response;
      
      updateTaskStatus(task.id, TaskStatus.PROCESSING, 60);

      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const { name, args } = call;
          
          let taskType = 'tool_execution';
          if (name === 'generate_image') taskType = 'image_generation';
          if (name === 'generate_app') taskType = 'code_synthesis';
          if (name === 'use_integration_service') taskType = 'integration_bus';
          
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, type: taskType } : t));

          // ... Tool Handlers
          if (name === 'generate_image') {
            const base64Image = await executeImageGeneration(args.prompt as string, (args.aspectRatio as string) || "1:1");
            if (base64Image) {
               setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: MessageRole.MODEL,
                content: args.prompt as string,
                type: ContentType.IMAGE,
                metadata: { src: base64Image },
                timestamp: Date.now()
              }]);
              await chatSession.submitFunctionResponse({
                  functionResponses: [{ name: name, response: { result: "Image created" }, id: call.id }]
              });
            }
          } 
          else if (name === 'render_svg') {
             setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: "Vector Render",
              type: ContentType.SVG,
              metadata: { code: args.code, description: args.description },
              timestamp: Date.now()
            }]);
             await chatSession.submitFunctionResponse({
                functionResponses: [{ name: name, response: { result: "SVG rendered" }, id: call.id }]
            });
          }
          else if (name === 'create_table') {
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: "Data Grid",
              type: ContentType.TABLE,
              metadata: { headers: args.headers, rows: args.rows, title: args.title },
              timestamp: Date.now()
            }]);
            await chatSession.submitFunctionResponse({
                functionResponses: [{ name: name, response: { result: "Table displayed" }, id: call.id }]
            });
          }
          else if (name === 'perform_search') {
            const searchRes = await executeSearch(args.query as string);
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: "Search Data",
              type: ContentType.SEARCH_RESULT,
              metadata: { summary: searchRes.summary, links: searchRes.links },
              timestamp: Date.now()
            }]);
            await chatSession.submitFunctionResponse({
                functionResponses: [{ name: name, response: { result: `Search found: ${searchRes.summary}` }, id: call.id }]
            });
          }
          else if (name === 'generate_app') {
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: args.instructions ? (args.instructions as string) : "App Module Generated",
              type: ContentType.CODE,
              metadata: { language: args.language, code: args.code, filename: args.filename, type: args.type },
              timestamp: Date.now()
            }]);
            await chatSession.submitFunctionResponse({
                functionResponses: [{ name: name, response: { result: "App code displayed" }, id: call.id }]
            });
          }
          else if (name === 'use_integration_service') {
            const service = services.find(s => s.id === (args.service as string).toLowerCase());
            const connected = service?.connected;
            
            // Simulation of integration
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: connected 
                ? `Executing '${args.action}' on ${(args.service as string).toUpperCase()}...\nPayload: ${args.payload}` 
                : `Error: Service ${(args.service as string).toUpperCase()} is not connected. Please connect it in the Integration Bus.`,
              type: ContentType.TEXT,
              timestamp: Date.now()
            }]);

            await chatSession.submitFunctionResponse({
                functionResponses: [{ 
                  name: name, 
                  response: { result: connected ? "Action executed successfully via MCP." : "Failed: Service disconnected." }, 
                  id: call.id 
                }]
            });
          }
          else if (name === 'manage_skills') {
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: MessageRole.MODEL,
              content: `Skill System Update: ${args.action.toUpperCase()} -> ${args.skill}`,
              type: ContentType.TEXT,
              timestamp: Date.now()
            }]);
             await chatSession.submitFunctionResponse({
                functionResponses: [{ name: name, response: { result: "Skill database updated." }, id: call.id }]
            });
          }
        }
      } else {
        const text = response.text;
        if (text) {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: MessageRole.MODEL,
            content: text,
            type: ContentType.TEXT,
            timestamp: Date.now()
          }]);
        }
      }

      updateTaskStatus(task.id, TaskStatus.COMPLETED, 100);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: MessageRole.MODEL,
        content: "System Critical: Task Execution Failed or Connection Error.",
        type: ContentType.TEXT,
        timestamp: Date.now()
      }]);
      updateTaskStatus(task.id, TaskStatus.FAILED, 0);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== task.id));
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-machine-base text-white font-sans overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      
      {/* Overlays */}
      <TaskManager tasks={tasks} />
      <IntegrationDashboard 
        isOpen={showIntegrations} 
        onClose={() => setShowIntegrations(false)} 
        services={services}
        onToggleService={toggleService}
      />

      {/* Header */}
      <header className="h-16 border-b border-machine-highlight bg-machine-surface/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded bg-gradient-to-br from-machine-cyan to-machine-purple flex items-center justify-center font-bold text-black font-mono shadow-[0_0_15px_rgba(217,70,239,0.5)]">
             M
           </div>
           
           <div className="flex flex-col">
             <h1 className="text-lg font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">The Machine</h1>
             <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} `}></span>
               <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                 {isProcessing ? 'PROCESSING' : 'IDLE'}
               </span>
             </div>
           </div>

           {/* Agent Switcher */}
           <div className="hidden sm:flex items-center ml-4 px-3 py-1 bg-machine-highlight/30 border border-machine-highlight rounded-full">
             <span className="text-[10px] text-slate-400 mr-2 font-bold">AGENT:</span>
             <select 
               value={currentPersona} 
               onChange={handlePersonaChange}
               className="bg-transparent text-xs text-machine-cyan font-mono focus:outline-none uppercase"
             >
               <option value="general">GENERAL</option>
               <option value="frontend">FRONTEND</option>
               <option value="backend">BACKEND</option>
               <option value="mobile">MOBILE APP</option>
               <option value="data_analyst">DATA ANALYST</option>
             </select>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowIntegrations(true)}
             className="px-3 py-1.5 text-xs font-bold text-machine-purple border border-machine-purple/30 bg-machine-purple/10 rounded hover:bg-machine-purple/20 transition-all flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
             <span className="hidden sm:inline">INTEGRATION BUS</span>
           </button>
           
           <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
             <span>QUOTA: OPTIMIZED</span>
           </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
           <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <MessageItem key={msg.id} message={msg} />
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-machine-base via-machine-base to-transparent z-20">
          <InputConsole 
            onSendMessage={addTask} 
            isLoading={false} // Always allow queuing 
          />
        </div>
      </main>

    </div>
  );
};

export default TheMachine;