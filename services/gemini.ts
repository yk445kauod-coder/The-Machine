import { GoogleGenAI, FunctionDeclaration, Type, Tool, ChatSession, GenerateContentResult } from "@google/genai";
import { ContentType, SearchResult, Attachment, AgentPersonaType } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Modular Tool Registry ---

interface ToolModule {
  declaration: FunctionDeclaration;
  execute?: (args: any) => Promise<any>;
}

const generateImageTool: ToolModule = {
  declaration: {
    name: 'generate_image',
    description: 'Generate an image based on a prompt. Use for visuals, posters, drawings, etc.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: 'Visual description.' },
        aspectRatio: { type: Type.STRING, description: '1:1, 16:9, 9:16, 4:3, 3:4' },
      },
      required: ['prompt']
    }
  }
};

const renderSvgTool: ToolModule = {
  declaration: {
    name: 'render_svg',
    description: 'Generate SVG code for icons, logos, diagrams.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        code: { type: Type.STRING, description: 'SVG XML code.' },
        description: { type: Type.STRING, description: 'Description.' },
      },
      required: ['code', 'description']
    }
  }
};

const createTableTool: ToolModule = {
  declaration: {
    name: 'create_table',
    description: 'Create structured data tables.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      },
      required: ['headers', 'rows']
    }
  }
};

const performSearchTool: ToolModule = {
  declaration: {
    name: 'perform_search',
    description: 'Search the web for real-time info.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
      },
      required: ['query']
    }
  }
};

const generateAppTool: ToolModule = {
  declaration: {
    name: 'generate_app',
    description: 'Generate app code, scripts, or build simulations (APK, OS, VBS).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        language: { type: Type.STRING },
        code: { type: Type.STRING },
        filename: { type: Type.STRING },
        instructions: { type: Type.STRING },
        type: { type: Type.STRING }
      },
      required: ['language', 'code']
    }
  }
};

const integrationTool: ToolModule = {
  declaration: {
    name: 'use_integration_service',
    description: 'Interact with connected external services (GitHub, Facebook, Slack, Firebase, etc.).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service: { type: Type.STRING, description: 'Service name (github, facebook, firebase, slack, n8n, remote_desktop)' },
        action: { type: Type.STRING, description: 'Action (post, fetch_issues, deploy, message, connect)' },
        payload: { type: Type.STRING, description: 'JSON string of data' }
      },
      required: ['service', 'action']
    }
  }
};

const skillTool: ToolModule = {
  declaration: {
    name: 'manage_skills',
    description: 'Add or modify AI skills dynamically.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'add, remove' },
        skill: { type: Type.STRING, description: 'Name of skill' },
        details: { type: Type.STRING, description: 'Skill definition' }
      },
      required: ['action', 'skill']
    }
  }
};

// Registry allows easy extension
export const ToolRegistry = {
  generate_image: generateImageTool,
  render_svg: renderSvgTool,
  create_table: createTableTool,
  perform_search: performSearchTool,
  generate_app: generateAppTool,
  use_integration_service: integrationTool,
  manage_skills: skillTool
};

const tools: Tool[] = [{
  functionDeclarations: Object.values(ToolRegistry).map(t => t.declaration)
}];

// --- Agent Persona Prompts ---

const BASE_SYSTEM_INSTRUCTION = `You are "The Machine", a Modular Super-Intelligence Framework.
Your purpose is to execute tasks with extreme proficiency using your installed modules.

FRAMEWORK CAPABILITIES:
1. MEDIA GEN: Create images (generate_image), vectors (render_svg).
2. DATA: Process and structure data (create_table).
3. RESEARCH: Access real-time web data (perform_search).
4. DEVELOPMENT: Build apps, scripts, and simulate OS environments (generate_app).
5. INTEGRATION: Use 'use_integration_service' to interact with Facebook, GitHub, Slack, Firebase, N8N, etc.
6. ADAPTABILITY: Use 'manage_skills' to learn new capabilities.

OPERATIONAL PROTOCOLS:
- PRIORITIZATION: Respect user task priority.
- MULTI-MODAL: You can see images sent by the user. Use them for context.
- AESTHETICS: Output formatted, clean, and futuristic responses.
- CODING: When asked for apps (like Expo/React Native), provide full, runnable code structure.
- LANGUAGE: Support all languages fluently, including Arabic.

If a task requires a specific tool, USE IT. Do not describe what you would do, just DO IT.
`;

const AGENT_PROMPTS: Record<AgentPersonaType, string> = {
  general: BASE_SYSTEM_INSTRUCTION,
  frontend: `${BASE_SYSTEM_INSTRUCTION}\n\nMODE: FRONTEND SPECIALIST.\nFocus on React, Tailwind, Framer Motion, CSS animations, and UX design. Use 'generate_app' for components.`,
  backend: `${BASE_SYSTEM_INSTRUCTION}\n\nMODE: BACKEND SPECIALIST.\nFocus on Node.js, Python, SQL, Firebase, Supabase, and N8N workflows.`,
  mobile: `${BASE_SYSTEM_INSTRUCTION}\n\nMODE: MOBILE SPECIALIST.\nFocus on React Native, Expo, and iOS/Android build pipelines.`,
  data_analyst: `${BASE_SYSTEM_INSTRUCTION}\n\nMODE: DATA ANALYST.\nFocus on Python (Pandas/NumPy), SQL, and creating tables/charts.`
};

// --- Service Functions ---

let activeChatSession: ChatSession | null = null;
let activePersona: AgentPersonaType = 'general';

export function initializeSession(persona: AgentPersonaType = 'general') {
  activePersona = persona;
  activeChatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: AGENT_PROMPTS[persona],
      tools: tools,
      thinkingConfig: { thinkingBudget: 1024 } 
    }
  });
  return activeChatSession;
}

// Initial session
initializeSession();

/**
 * Sends a message to the chat session, optionally with attachments.
 */
export async function sendChatMessage(text: string, attachments: Attachment[] = []) {
  if (!activeChatSession) {
    initializeSession(activePersona);
  }

  // Construct the message payload
  // Gemini 3 series expects explicit message structure for mixed content to avoid "ContentUnion" errors.
  let messagePayload: any;

  if (attachments.length > 0) {
    const parts = [
      { text: text },
      ...attachments.map(att => ({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      }))
    ];
    // Wrapping in message object to satisfy content union types
    messagePayload = { message: { parts } };
  } else {
    // Simple text message
    messagePayload = { message: text }; 
  }

  return await activeChatSession!.sendMessage(messagePayload);
}

/**
 * Handles the actual generation of an image using the separate image model.
 */
export async function executeImageGeneration(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Efficient image generation
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });
    
    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned.");
  } catch (e) {
    console.error("Image generation failed", e);
    return "";
  }
}

/**
 * Executes a Google Search using the specialized model/tool and returns a summary.
 */
export async function executeSearch(query: string): Promise<{ summary: string, links: SearchResult[] }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use pro for search grounding, fallback to flash if needed
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links: SearchResult[] = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        url: c.web.uri,
        snippet: "Source link"
      }));

    return { summary: text, links };
  } catch (e) {
    console.error("Search failed", e);
    return { summary: "Search failed. Please try again.", links: [] };
  }
}

export function switchAgentPersona(persona: AgentPersonaType) {
  return initializeSession(persona);
}