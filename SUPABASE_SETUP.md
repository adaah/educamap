# Configurações do Supabase para EduMap Salvador

## 1. Configuração Inicial do Projeto

### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: `escola-connect-map`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: `South America (São Paulo)` (recomendado para Brasil)
5. Clique em "Create new project"

### 1.2 Obter Credenciais
Após criar o projeto, vá em **Settings > API** e copie:
- **Project URL**: `https://seu-projeto.supabase.co`
- **anon public key**: `eyJ...` (chave pública)
- **service_role key**: `eyJ...` (chave de serviço - mantenha secreta)

## 2. Configuração do Banco de Dados

### 2.1 Executar Migrações
Execute as migrações na seguinte ordem:

```sql
-- 1. Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  institution TEXT,
  occupation TEXT,
  course TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Adicionar coluna course (se não existir)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course TEXT;

-- 3. Criar tabela de roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Criar tabelas de dados pendentes
CREATE TABLE public.pending_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  nature TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  additional_info TEXT,
  contributor_name TEXT,
  periods TEXT[],
  subjects TEXT[],
  shifts TEXT[],
  instructors JSONB,
  consent_to_share_data BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.pending_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  shifts TEXT[],
  periods TEXT[],
  email TEXT,
  linkedin TEXT,
  instagram TEXT,
  whatsapp TEXT,
  additional_info TEXT,
  contributor_name TEXT,
  consent_to_share_data BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.pending_former_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  university TEXT NOT NULL,
  course TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  instagram TEXT,
  whatsapp TEXT,
  contributor_name TEXT,
  school_id UUID,
  user_id UUID REFERENCES auth.users(id),
  additional_info TEXT,
  consent_to_share_data BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- 5. Criar tabelas principais
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  nature TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  additional_info TEXT,
  contributor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.school_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  period TEXT NOT NULL
);

CREATE TABLE public.school_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL
);

CREATE TABLE public.school_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  shift TEXT NOT NULL
);

CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  shifts TEXT[],
  periods TEXT[],
  email TEXT,
  linkedin TEXT,
  whatsapp TEXT,
  instagram TEXT,
  contributor_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.former_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id),
  name TEXT NOT NULL,
  university TEXT NOT NULL,
  course TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  instagram TEXT,
  whatsapp TEXT,
  contributor_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Criar tabelas de sistema
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID REFERENCES auth.users(id) NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL, -- 'former_student', 'instructor', 'school'
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.contact_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id UUID REFERENCES auth.users(id) NOT NULL,
  viewer_email TEXT NOT NULL,
  viewed_entity_type TEXT NOT NULL,
  viewed_entity_id TEXT NOT NULL,
  viewed_entity_name TEXT NOT NULL,
  contact_fields_viewed TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2.2 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_former_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.former_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_view_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para schools (público para leitura)
CREATE POLICY "Anyone can view schools" ON public.schools
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage schools" ON public.schools
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para pending tables (apenas admins)
CREATE POLICY "Only admins can manage pending schools" ON public.pending_schools
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage pending instructors" ON public.pending_instructors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage pending students" ON public.pending_former_students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para contact_requests
CREATE POLICY "Users can view their own requests" ON public.contact_requests
  FOR SELECT USING (auth.uid() = requester_user_id OR auth.uid() = owner_user_id);

CREATE POLICY "Users can create requests" ON public.contact_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users can update their own requests" ON public.contact_requests
  FOR UPDATE USING (auth.uid() = requester_user_id OR auth.uid() = owner_user_id);

-- Políticas para contact_view_logs
CREATE POLICY "Users can view their own logs" ON public.contact_view_logs
  FOR SELECT USING (auth.uid() = viewer_user_id);

CREATE POLICY "Users can create their own logs" ON public.contact_view_logs
  FOR INSERT WITH CHECK (auth.uid() = viewer_user_id);
```

### 2.3 Criar Funções Auxiliares

```sql
-- Função para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, institution, occupation, course)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'occupation',
    NEW.raw_user_meta_data->>'course'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. Configuração de Admin

### 3.1 Criar Primeiro Admin
1. Crie um usuário através da autenticação do Supabase
2. Execute o SQL abaixo substituindo `SEU_USER_ID` pelo ID do usuário:

```sql
-- Adicionar role de admin para o usuário
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

### 3.2 Configurar Edge Functions (Opcional)
Para funcionalidades avançadas como deletar conta:

1. Vá em **Edge Functions** no painel do Supabase
2. Crie uma nova função chamada `delete-user-account`
3. Use o código da função de deletar conta

## 4. Configuração de Email

### 4.1 Configurar SMTP
1. Vá em **Authentication > Settings**
2. Configure o SMTP para envio de emails:
   - **SMTP Host**: (seu provedor de email)
   - **SMTP Port**: 587
   - **SMTP User**: seu email
   - **SMTP Pass**: sua senha de app
   - **SMTP Admin Email**: email para notificações

### 4.2 Configurar Templates de Email
1. Vá em **Authentication > Email Templates**
2. Personalize os templates de:
   - Confirmação de email
   - Reset de senha
   - Convites

## 5. Configuração de Storage (Opcional)

Se precisar de upload de arquivos:

```sql
-- Criar bucket para uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Política para uploads
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 6. Monitoramento e Logs

### 6.1 Configurar Logs
1. Vá em **Logs** no painel do Supabase
2. Configure alertas para:
   - Erros de autenticação
   - Falhas de RLS
   - Performance de queries

### 6.2 Configurar Backup
1. Vá em **Settings > Database**
2. Configure backup automático
3. Configure ponto de restauração

## 7. Variáveis de Ambiente

Configure no seu projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=eyJ...sua-chave-de-servico
```

## 8. Testes e Validação

### 8.1 Testar Conexão
```bash
# Instalar dependências
npm install

# Testar conexão
npm run dev
```

### 8.2 Validar Funcionalidades
1. ✅ Cadastro de usuário
2. ✅ Login/Logout
3. ✅ Criação de perfil
4. ✅ Envio de formulários
5. ✅ Aprovação de admin
6. ✅ Sistema de permissões

## 9. Troubleshooting

### Problemas Comuns:

1. **Erro de RLS**: Verificar se as políticas estão corretas
2. **Erro de CORS**: Configurar domínios permitidos
3. **Erro de autenticação**: Verificar chaves de API
4. **Erro de migração**: Executar migrações na ordem correta

### Logs Úteis:
- **Database Logs**: Para erros de SQL
- **Auth Logs**: Para problemas de autenticação
- **Edge Function Logs**: Para funções serverless
