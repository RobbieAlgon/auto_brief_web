-- Create briefings table
create table briefings (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  conteudo jsonb not null,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster user queries
create index briefings_user_id_idx on briefings(user_id);

-- Enable RLS (Row Level Security)
alter table briefings enable row level security;

-- Create policy to allow users to see only their own briefings
create policy "Users can view their own briefings"
  on briefings for select
  using (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own briefings
create policy "Users can insert their own briefings"
  on briefings for insert
  with check (auth.uid()::text = user_id); 