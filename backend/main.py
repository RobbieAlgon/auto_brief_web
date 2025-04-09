from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from supabase import create_client
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL and key must be set in environment variables")

# Initialize Supabase client
supabase = create_client(supabase_url, supabase_key)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/")
async def root():
    return {"message": "API do Briefing Generator está funcionando!"}

class ConversationInput(BaseModel):
    conversation: str
    user_id: str

class BriefingResponse(BaseModel):
    objetivo: str
    publico_alvo: str
    referencias: List[str]
    prazos: Dict[str, str]
    orcamento: Dict[str, float]
    observacoes: List[str]

class SavedBriefing(BaseModel):
    id: Optional[str] = None
    titulo: str
    conteudo: Dict
    user_id: str
    created_at: Optional[str] = None

class SaveBriefingInput(BaseModel):
    briefing: BriefingResponse
    user_id: str

@app.post("/generate-briefing", response_model=BriefingResponse)
async def generate_briefing(conversation_input: ConversationInput):
    try:
        print("Iniciando geração de briefing...")
        print(f"Conversa recebida: {conversation_input.conversation[:100]}...")
        
        prompt = f"""Extraia um briefing profissional da seguinte conversa com um cliente. O briefing deve conter: Objetivo, Público-alvo, Referências, Prazos, Orçamento e Observações extras. Ignore mensagens irrelevantes.

Conversa:
{conversation_input.conversation}

Por favor, forneça APENAS o JSON, sem nenhum texto adicional. O formato deve ser:
{{
    "objetivo": "descrição clara do objetivo principal",
    "publico_alvo": "descrição do público-alvo",
    "referencias": ["referência 1", "referência 2", "..."],
    "prazos": {{
        "inicio": "data de início",
        "entrega": "data de entrega",
        "etapas_intermediarias": "datas importantes"
    }},
    "orcamento": {{
        "total": 0.0,
        "por_etapa": 0.0
    }},
    "observacoes": ["observação 1", "observação 2", "..."]
}}"""
        
        print("Enviando requisição para a API Groq...")
        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000,
            stream=False
        )
        
        briefing_text = completion.choices[0].message.content
        print(f"Resposta recebida: {briefing_text[:100]}...")
        
        # Extrair apenas a parte JSON da resposta
        try:
            # Encontrar o início do JSON (primeira ocorrência de '{')
            json_start = briefing_text.find('{')
            if json_start == -1:
                raise ValueError("JSON não encontrado na resposta")
            
            # Encontrar o fim do JSON (última ocorrência de '}')
            json_end = briefing_text.rfind('}') + 1
            if json_end == 0:
                raise ValueError("JSON não encontrado na resposta")
            
            # Extrair apenas a parte JSON
            json_text = briefing_text[json_start:json_end]
            briefing_data = json.loads(json_text)
            print("Briefing gerado com sucesso!")
            return BriefingResponse(**briefing_data)
        except json.JSONDecodeError as e:
            print(f"Erro ao fazer parse do JSON: {str(e)}")
            print(f"Texto que causou o erro: {json_text if 'json_text' in locals() else briefing_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to parse model response as JSON"
            )
        
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/briefings", response_model=SavedBriefing)
async def save_briefing(save_input: SaveBriefingInput):
    try:
        # Generate title based on current date/time and first few words of objective
        title = f"Briefing {datetime.now().strftime('%d/%m/%Y %H:%M')} - {save_input.briefing.objetivo[:30]}..."
        
        # Save to Supabase
        data = {
            "titulo": title,
            "conteudo": save_input.briefing.dict(),
            "user_id": save_input.user_id
        }
        
        result = supabase.table("briefings").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save briefing")
            
        return SavedBriefing(
            id=result.data[0]["id"],
            titulo=result.data[0]["titulo"],
            conteudo=result.data[0]["conteudo"],
            user_id=result.data[0]["user_id"],
            created_at=result.data[0]["created_at"]
        )
        
    except Exception as e:
        print(f"Erro ao salvar briefing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/briefings/{user_id}", response_model=List[SavedBriefing])
async def list_briefings(user_id: str):
    try:
        result = supabase.table("briefings")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
        return [
            SavedBriefing(
                id=item["id"],
                titulo=item["titulo"],
                conteudo=item["conteudo"],
                user_id=item["user_id"],
                created_at=item["created_at"]
            )
            for item in result.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)