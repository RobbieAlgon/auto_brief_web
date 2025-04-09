# AI Briefing Generator

A fullstack application that generates structured briefings from text input using AI. Built with React, FastAPI, and Groq's Mixtral model.

## Features

- Text input interface for submitting content
- AI-powered analysis using Groq's Mixtral model
- Structured briefing output with:
  - Key points
  - Action items
  - Summary
  - Sentiment analysis
  - Priority level
- Persistent storage using Supabase
- Modern UI with Tailwind CSS and shadcn/ui

## Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Supabase account
- Groq API key

### Environment Variables

Create `.env` files in both frontend and backend directories:

Backend `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
```

### Installation

1. Clone the repository
2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Create a table in your Supabase database:
```sql
create table briefings (
  id uuid default uuid_generate_v4() primary key,
  input_text text not null,
  structured_briefing jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Usage

1. Open the application in your browser (default: http://localhost:3000)
2. Enter text in the input field
3. Click "Generate Briefing"
4. View the structured briefing output

## Development

- Backend API runs on http://localhost:8000
- Frontend development server runs on http://localhost:3000
- API documentation available at http://localhost:8000/docs

## License

MIT 