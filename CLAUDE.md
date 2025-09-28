# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production app with Turbopack
- `pnpm start` - Start production server

## Package Manager

This project strictly uses **pnpm**. Do not use npm or yarn.

## Architecture

This is a TypeScript Next.js 15 starter template for AI-powered applications:

### Core Stack
- **Next.js 15** with App Router
- **AI SDK 5** with Anthropic Claude integration
- **shadcn/ui** components (New York style, neutral base color)
- **Tailwind CSS v4** for styling
- **RAG System** with ChromaDB for local vector storage

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/api/chat/` - AI chat endpoint with RAG integration
- `app/api/index-documents/` - Document indexing endpoint for KMA files
- `components/ui/` - shadcn/ui components and source citation components
- `lib/` - Core utilities including embeddings, vector store, and document processing
- `public/docs/kma/` - Knowledge Management Articles for incident response
- `chroma_db/` - Local ChromaDB storage (auto-created, gitignored)

### AI Integration
- Uses AI SDK 5's `generateText()` for non-streaming responses
- Configured for Anthropic Claude (claude-3-5-sonnet-20241022)
- **RAG System**: Searches KMA documents and provides context to AI responses
- API route at `/api/chat` expects `{ message: string }` and returns `{ response: string, sources?: Source[] }`
- Requires `ANTHROPIC_API_KEY` in `.env.local`

### RAG (Retrieval-Augmented Generation) System
- **Local Vector Storage**: ChromaDB for document embeddings (no external API required)
- **Embedding Model**: Transformers.js with all-MiniLM-L6-v2 (runs locally)
- **Document Processing**: Smart chunking of KMA markdown files
- **Semantic Search**: Finds relevant incident procedures based on user queries
- **Source Citations**: Shows which documents were referenced in responses

### UI Components
- **shadcn/ui** configured with:
  - New York style
  - Neutral base color with CSS variables
  - Import aliases: `@/components`, `@/lib/utils`, `@/components/ui`
  - Lucide React for icons
- **AI Elements** from Vercel:
  - Pre-built components for AI applications
  - Located in `components/ai-elements/`
  - Key components: Conversation, Message, PromptInput
  - Uses `UIMessage` type from AI SDK

### Adding Components
- shadcn/ui: `pnpm dlx shadcn@latest add [component-name]`
- AI Elements: `pnpm dlx ai-elements@latest` (adds all components)

## Environment Setup

Create `.env.local` with:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## RAG Setup

### 1. Index KMA Documents

After starting the dev server, index your KMA documents:

```bash
# Start the development server
pnpm dev

# Index documents (first time setup)
curl -X POST http://localhost:3000/api/index-documents \
  -H "Content-Type: application/json" \
  -d '{"reindex": true}'
```

### 2. Using the System

- Ask incident-related questions: "How do I resolve LVDS message backlog issues?"
- The AI will search KMA documents and provide specific procedures
- Source citations show which documents were referenced
- Click citation links to view full documents

### 3. Adding New KMA Documents

1. Add new `.md` files to `public/docs/kma/`
2. Re-run the indexing command to update the knowledge base