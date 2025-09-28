# On-Call Agent

AI-powered incident response chatbot with RAG (Retrieval-Augmented Generation) for KMA documentation using Next.js 15, TypeScript, AI SDK 5, Pinecone vector database, OpenAI embeddings, shadcn/ui, and AI Elements.

## Features

- RAG-powered chat interface with Claude for incident response
- Pinecone vector database for document storage and semantic search
- OpenAI text-embedding-3-small for document embeddings
- KMA (Knowledge Management Articles) integration
- Source citations and document references
- AI Elements components (Conversation, Message, PromptInput)
- shadcn/ui design system
- Non-streaming responses
- TypeScript ready

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create `.env.local` file:
   ```bash
   echo "ANTHROPIC_API_KEY=your_anthropic_api_key_here" > .env.local
   echo "PINECONE_API_KEY=your_pinecone_api_key_here" >> .env.local
   echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env.local
   ```

3. Start development:
   ```bash
   pnpm dev
   ```

4. Index KMA documents (one-time setup):
   ```bash
   curl -X POST http://localhost:3000/api/index-documents -H "Content-Type: application/json" -d '{"reindex": true}'
   ```

Open [http://localhost:3000](http://localhost:3000) to chat with the incident response assistant.

## Resources

- [Next.js 15](https://nextjs.org/) - React framework
- [AI SDK 5](https://ai-sdk.dev/) - AI integration toolkit
- [Pinecone](https://www.pinecone.io/) - Vector database
- [AI Elements](https://ai-sdk.dev/elements/overview) - Pre-built AI components
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
