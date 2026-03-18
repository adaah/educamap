# Configuração do Painel Administrativo

## Primeiro Acesso

Para configurar o primeiro usuário administrador, siga estes passos:

### 1. Criar Conta de Administrador

1. Acesse a página de login admin: `/admin-acesso`
2. Como ainda não tem conta, você precisa criar um usuário diretamente no banco de dados

### 2. Criar Usuário Admin no Banco de Dados

Execute os seguintes comandos SQL no console do Supabase (ou use a ferramenta de linha de comando):

```sql
-- Primeiro, encontre o ID do usuário que você quer tornar admin
-- Você pode criar um usuário através da autenticação do Supabase primeiro

-- Depois, adicione a role de admin para esse usuário:
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

**Importante**: Substitua `'SEU_USER_ID_AQUI'` pelo ID real do usuário (UUID).

### 3. Criar Usuário via Auth do Supabase

Você pode criar um usuário admin diretamente pelo painel do Supabase:

1. Acesse o painel do Supabase
2. Vá em Authentication > Users
3. Clique em "Add user" 
4. Crie o usuário com email e senha
5. Copie o User ID (UUID) do usuário criado
6. Execute o SQL acima para adicionar a role de admin

### 4. Acessar o Painel

1. Acesse `/admin-acesso`
2. Faça login com as credenciais criadas
3. Você será redirecionado para `/painel-administrativo`

## Funcionalidades do Painel Admin

### Moderação de Conteúdo

O painel admin permite:

- **Aprovar ou Rejeitar Escolas**: Todas as escolas enviadas pelos formulários públicos ficam em status "pendente" até aprovação
- **Aprovar ou Rejeitar Professores**: Professores instrutores enviados também precisam de aprovação
- **Aprovar ou Rejeitar Estagiários**: Experiências compartilhadas por estagiários precisam de moderação
- **Deletar Dados Existentes**: Remover escolas, professores ou estagiários já aprovados

### Segurança

- **Autenticação Obrigatória**: Apenas usuários autenticados podem acessar
- **Verificação de Role**: Apenas usuários com role "admin" têm acesso
- **RLS Policies**: Row Level Security garante que apenas admins podem ler/modificar dados sensíveis
- **Sem Senhas no Código**: A autenticação usa o sistema seguro do Supabase

## URL de Acesso

- **Login Admin**: `https://seu-dominio.com/admin-acesso`
- **Painel Admin**: `https://seu-dominio.com/painel-administrativo`

**Nota de Segurança**: Mantenha as credenciais de admin em segredo. Não compartilhe a URL do painel admin publicamente.

## Adicionando Mais Administradores

Para adicionar novos administradores:

1. O novo admin deve criar uma conta normal primeiro (pode usar qualquer método de signup)
2. Um admin existente deve executar:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_DO_NOVO_ADMIN', 'admin');
```

Ou crie uma interface administrativa para isso no futuro.
