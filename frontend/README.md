# Briefing Generator Frontend

Aplicação React para geração e gerenciamento de briefings.

## Requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com seus valores:
     - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
     - `VITE_API_URL`: URL da API backend (opcional, padrão: http://localhost:8000)
     - `VITE_PRODUCTION_API_URL`: URL da API em produção

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run preview`: Visualiza a build de produção localmente
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier
- `npm run type-check`: Verifica os tipos TypeScript

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── contexts/      # Contextos React (Auth, Briefing)
  ├── lib/           # Configurações e utilitários
  ├── pages/         # Páginas da aplicação
  └── App.tsx        # Componente principal
```

## Build para Produção

1. Configure as variáveis de ambiente para produção
2. Execute o build:
```bash
npm run build
```

3. O build será gerado na pasta `dist/`

## Deploy

O projeto está configurado para deploy no Vercel. Após fazer push para o repositório, o Vercel fará o deploy automaticamente.

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vite

## Segurança

- Nunca comite o arquivo `.env` com valores reais
- Mantenha as chaves do Supabase seguras
- Use HTTPS em produção

## Suporte

Para questões ou problemas, abra uma issue no repositório.
