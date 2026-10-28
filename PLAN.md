# MyCellar — Plano de Implementação

## Contexto

O usuário quer construir do zero uma aplicação web de gerenciamento de adega de vinhos ("MyCellar"), multi-tenant (cada usuário com sua própria coleção isolada), de uso principal pelo celular. O diretório do projeto está vazio — projeto greenfield. Requisitos levantados por entrevista e refinados em rodadas de revisão:

- App web SPA (React + Vite + TS + Tailwind), sem SSR, **mobile-first** — a maior parte do uso será consultar/editar a adega pelo celular, inclusive dentro de lojas
- Multi-tenant via Supabase (Postgres + Auth + Storage), isolamento por Row Level Security
- MVP: layout físico configurável (prateleiras + capacidade), CRUD de garrafas, controle de posição física, histórico de consumo (com desfazer), visualização rica do layout (ilustrada ou com foto real calibrada), cadastro via foto do rótulo + IA
- Cada garrafa física ocupa sua própria posição (3 garrafas do mesmo vinho = 3 posições distintas)
- Deploy via Coolify (Docker + Nginx)
- Chave da Anthropic nunca no bundle do frontend — proxy via Supabase Edge Function, **com limite diário de scans por usuário** para controlar custo de API num app multi-tenant
- Foto de fundo real opcional (ex: `Brastemp_Adega.png`, já presente na raiz como exemplo), com calibração de posições
- Monetização via Google AdSense no rodapé das páginas principais
- Cadastro exige aceite explícito de Termos de Uso e Política de Privacidade (conteúdo genérico por ora, a refinar depois)
- Internacionalização: português (padrão), inglês e espanhol — detecta idioma do navegador, com troca manual persistida
- PWA instalável (tela inicial do celular) e exportação de dados (CSV/JSON) como funcionalidades do MVP
- Página pública/landing fora do login, ajudando também na indexação/relevância dos anúncios

## Decisão de modelagem: layout e posições

**Abordagem escolhida:** tabela `shelves` (metadados por prateleira: índice, capacidade) + colunas `shelf_id`/`slot_index` na tabela `bottles`. Não materializamos uma linha por slot vazio — o frontend já precisa iterar `0..capacity-1` para desenhar a prateleira, então isso não economiza nada e complica o resync em cada redimensionamento de layout.

**Cada garrafa física = uma linha em `bottles` = uma posição.** Não existe campo `quantity`. Quando o usuário tem N garrafas do mesmo vinho, o fluxo de "adicionar garrafa" cria N linhas idênticas nos metadados do vinho, cada uma com seu próprio `id`, `shelf_id` e `slot_index`. Cada garrafa pode ser consumida (ou reativada) independentemente das demais.

**Histórico de consumo não é uma tabela separada.** `bottles.status` (`active`/`consumed`) + `consumed_at`. Ao consumir, `shelf_id`/`slot_index` voltam a `null`, liberando o slot. "Desfazer" é só reverter `status` para `active` — a garrafa fica "sem posição" até o usuário escolher um novo slot (mesmo mecanismo usado quando um layout é reduzido com garrafas ocupando slots removidos).

## 1. Modelo de dados (Supabase/Postgres)

```sql
-- profiles: perfil + preferências + aceite de termos
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  background_image_url text,
  display_mode text not null default 'illustrated' check (display_mode in ('illustrated','photo')),
  preferred_language text not null default 'pt-BR' check (preferred_language in ('pt-BR','en','es')),
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- shelves: metadados de cada prateleira (não uma linha por slot)
create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shelf_index int not null,          -- ordem de exibição, 0-based
  name text,
  capacity int not null check (capacity > 0),
  slot_positions jsonb not null default '[]',  -- [{x,y} em % da imagem], usado só no modo foto (4.5)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, shelf_index)
);

-- bottles: uma linha = uma garrafa física
create table public.bottles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  wine_type text not null check (wine_type in ('tinto','branco','rose','espumante','fortificado','outro')),
  grapes text[],
  country text,
  region text,
  winery text,
  vintage_year int check (vintage_year between 1900 and 2100),

  label_photo_url text,
  rating numeric(2,1) check (rating between 0 and 5),
  tasting_notes text,

  shelf_id uuid references public.shelves(id) on delete set null,
  slot_index int,

  status text not null default 'active' check (status in ('active','consumed')),
  consumed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shelf_slot_pair_check check ((shelf_id is null) = (slot_index is null))
);

create unique index uniq_active_slot on public.bottles (shelf_id, slot_index)
  where status = 'active' and shelf_id is not null;

create index idx_bottles_user_status on public.bottles (user_id, status);

-- scan_usage: controle de custo da IA de rótulo, um contador por usuário/dia
create table public.scan_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_date date not null default current_date,
  count int not null default 0,
  primary key (user_id, scan_date)
);
```

**Trigger de validação cruzada** (slot dentro da capacidade da prateleira, prateleira pertence ao mesmo usuário):

```sql
create or replace function public.validate_bottle_slot()
returns trigger language plpgsql as $$
declare
  shelf_cap int;
  shelf_owner uuid;
begin
  if new.shelf_id is not null then
    select capacity, user_id into shelf_cap, shelf_owner
    from public.shelves where id = new.shelf_id;

    if shelf_owner is null or shelf_owner <> new.user_id then
      raise exception 'Shelf does not belong to this user';
    end if;
    if new.slot_index < 0 or new.slot_index >= shelf_cap then
      raise exception 'slot_index out of range for shelf capacity';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_validate_bottle_slot
  before insert or update on public.bottles
  for each row execute function public.validate_bottle_slot();
```

**Row Level Security:**

```sql
alter table public.profiles   enable row level security;
alter table public.shelves    enable row level security;
alter table public.bottles    enable row level security;
alter table public.scan_usage enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

create policy "shelves_select_own" on public.shelves for select using (user_id = auth.uid());
create policy "shelves_insert_own" on public.shelves for insert with check (user_id = auth.uid());
create policy "shelves_update_own" on public.shelves for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shelves_delete_own" on public.shelves for delete using (user_id = auth.uid());

create policy "bottles_select_own" on public.bottles for select using (user_id = auth.uid());
create policy "bottles_insert_own" on public.bottles for insert with check (user_id = auth.uid());
create policy "bottles_update_own" on public.bottles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bottles_delete_own" on public.bottles for delete using (user_id = auth.uid());

-- scan_usage só é lido pelo dono; escrita acontece via Edge Function com service role (bypassa RLS)
create policy "scan_usage_select_own" on public.scan_usage for select using (user_id = auth.uid());
```

Auto-criação de perfil no signup:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Storage:**

```sql
-- fotos de rótulo
create policy "label_photos_owner_rw" on storage.objects
  for all using (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- foto de fundo da adega (bucket cellar-photos, objeto único {user_id}/background.{ext})
create policy "cellar_photos_owner_rw" on storage.objects
  for all using (bucket_id = 'cellar-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cellar-photos' and (storage.foldername(name))[1] = auth.uid()::text);
```

## 2. Estrutura do projeto

```
MyCellar/
├── .env.example                 # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADSENSE_CLIENT_ID, VITE_ADSENSE_SLOT_ID
├── .dockerignore
├── Dockerfile
├── nginx.conf
├── index.html
├── vite.config.ts               # inclui vite-plugin-pwa
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── manifest.json            # PWA: nome, ícones, cores, display:standalone
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── i18n.ts                  # init react-i18next + detecção de idioma
│   ├── locales/
│   │   ├── pt-BR/translation.json
│   │   ├── en/translation.json
│   │   └── es/translation.json
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── types/
│   │   ├── database.types.ts   # gerado via `supabase gen types typescript`
│   │   └── bottle.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useShelves.ts
│   │   ├── useBottles.ts
│   │   └── useLabelScan.ts
│   ├── components/
│   │   ├── ui/                 # Button, Modal, Input, Toast...
│   │   ├── cellar/
│   │   │   ├── ShelfRow.tsx
│   │   │   ├── BottleSlot.tsx
│   │   │   ├── BottleIcon.tsx
│   │   │   └── EmptySlot.tsx
│   │   ├── bottles/
│   │   │   ├── BottleForm.tsx
│   │   │   ├── BottleDetailModal.tsx
│   │   │   └── BottleCard.tsx  # item da lista de histórico, com ação "Reativar"
│   │   ├── layout/
│   │   │   ├── LayoutEditor.tsx
│   │   │   └── PhotoCalibrator.tsx
│   │   ├── scan/
│   │   │   ├── PhotoCapture.tsx
│   │   │   └── ScanPreviewForm.tsx
│   │   ├── settings/
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── ExportDataButton.tsx
│   │   └── ads/
│   │       └── AdBanner.tsx
│   └── pages/
│       ├── LandingPage.tsx      # pública, fora do login
│       ├── PrivacyPage.tsx      # pública
│       ├── TermsPage.tsx        # pública
│       ├── LoginPage.tsx
│       ├── SignupPage.tsx       # inclui checkbox de aceite de termos
│       ├── OnboardingLayoutPage.tsx
│       ├── CellarPage.tsx       # rota /cellar
│       ├── AddBottlePage.tsx
│       ├── HistoryPage.tsx
│       └── SettingsLayoutPage.tsx
└── supabase/
    ├── config.toml
    ├── migrations/
    │   └── 0001_init.sql
    └── functions/
        └── scan-label/
            ├── index.ts         # inclui checagem de scan_usage antes de chamar a Anthropic
            └── deno.json
```

## 3. Telas / rotas

| Rota | Página | Propósito |
|---|---|---|
| `/` | LandingPage | Pública, marketing simples; se já autenticado, redireciona para `/cellar` |
| `/privacy` | PrivacyPage | Política de privacidade (conteúdo genérico inicial) |
| `/terms` | TermsPage | Termos de uso (conteúdo genérico inicial) |
| `/login` | LoginPage | Email/senha + "Entrar com Google" |
| `/signup` | SignupPage | Cadastro email/senha + checkbox obrigatório de aceite de Termos/Privacidade |
| `/onboarding/layout` | OnboardingLayoutPage | Primeiro acesso: define nº de prateleiras + capacidade |
| `/cellar` | CellarPage | Visualização principal — prateleiras/foto com garrafas nos slots |
| `/bottles/add` | AddBottlePage | "Scan de foto" vs "Entrada manual"; quantidade de garrafas → auto-atribui N slots |
| `/bottles/:id` | BottleDetailModal | Ver/editar, "Marcar como consumida" |
| `/history` | HistoryPage | Garrafas consumidas, com ação "Reativar" (desfazer) |
| `/settings/layout` | SettingsLayoutPage | Editar layout, calibração de foto de fundo |
| `/settings` | SettingsPage | Idioma, exportar dados, instalar app (PWA) |

Guard de rota: não autenticado em rota protegida → `/login`; autenticado em `/`, `/login` ou `/signup` → `/cellar` (ou `/onboarding/layout` se ainda não houver `shelves`).

## 4. Fluxos principais

### 4.1 Cadastro com aceite de termos
- `SignupPage` exige um checkbox "Li e aceito os [Termos de Uso](/terms) e a [Política de Privacidade](/privacy)" marcado para habilitar o botão de criar conta.
- Após `auth.signUp` bem-sucedido, o client atualiza `profiles.terms_accepted_at = now()` (a linha já existe por causa do trigger `handle_new_user`).

### 4.2 Configuração de layout (primeiro acesso + edição)
- Primeiro acesso: pergunta nº de prateleiras (N) e capacidade; insere em lote em `shelves`.
- Edição depois: remover prateleira ou reduzir capacidade verifica garrafas ativas afetadas; oferece **realocar** ou **desvincular** (fica "sem posição").

### 4.3 Adicionar garrafa(s) via foto
1. `PhotoCapture` comprime a imagem no cliente.
2. Upload para `label-photos/{user_id}/{uuid}.jpg`.
3. Chama a Edge Function `scan-label` com `{ storagePath }`, autenticado via JWT.
4. A Edge Function **primeiro verifica `scan_usage`**: busca/cria a linha do dia para o usuário; se `count >= LIMITE_DIARIO` (ex: 20), retorna erro 429 "Limite diário de scans atingido" sem chamar a Anthropic; caso contrário incrementa o contador e segue.
5. Chama a API da Anthropic (Claude vision) com schema forçado correspondente aos campos da garrafa.
6. Retorna o JSON extraído ao cliente.
7. `ScanPreviewForm` pré-preenche `BottleForm`; falha/limite atingido → formulário em branco com a foto anexada (scan é um atalho, nunca bloqueia o cadastro manual).
8. Usuário revisa, informa quantas garrafas físicas tem, confirma.
9. Submit cria N linhas em `bottles`, cada uma em um slot vazio distinto (auto-escolhido, ajustável) → se dois clientes tentarem ocupar o mesmo slot ao mesmo tempo, o insert falha por violar `uniq_active_slot`; o client captura esse erro específico e mostra "essa posição acabou de ser ocupada, escolha outra", recarregando os slots livres.

### 4.4 Marcar como consumida / desfazer
- "Marcar como consumida": `status='consumed', consumed_at=now(), shelf_id=null, slot_index=null`. Slot libera imediatamente.
- "Reativar" (em `/history`): `status='active'`, continua sem `shelf_id`/`slot_index` — a garrafa aparece na lista de "sem posição" em `/cellar` até o usuário escolher um slot.

### 4.5 Renderização visual da adega (modo ilustrado)
- Cada prateleira = container horizontal, grid CSS `repeat(capacity, minmax(0,1fr))`.
- Slot vazio: placeholder tracejado com `+`. Slot ocupado: ícone SVG colorido por `wine_type`, tooltip com nome/vintage, clique abre detalhe.
- Mobile-first: alvos de toque ≥44px, prateleiras empilhadas em coluna rolável vertical (sem rolagem horizontal), navegação principal por barra inferior fixa (padrão mobile) em vez de navbar superior.

### 4.6 Foto de fundo real da adega (opcional)
Modo alternativo ao ilustrado (4.5), ativado após upload + calibração de uma foto real (ex: `Brastemp_Adega.png`).
1. Em `/settings/layout`: upload → `cellar-photos/{user_id}/background.{ext}` → `profiles.background_image_url`.
2. Calibração: por prateleira, usuário toca na foto uma vez por slot; cada toque grava `{x,y}` em % em `shelves.slot_positions[slot_index]` (funciona em touch, coordenadas relativas ao tamanho exibido da imagem).
3. "Recalibrar" limpa e repete. Quando todas as prateleiras têm `slot_positions.length === capacity`, `profiles.display_mode` vira `'photo'`.
4. Renderização: imagem de fundo + marcadores posicionados em `left/top: %`; vazio = `+` translúcido, ocupado = badge colorido sobre a garrafa já visível na foto.
5. Sem foto ou calibração incompleta → cai automaticamente no modo ilustrado.

### 4.7 Exportar dados
- Em `/settings`, botão "Exportar coleção" busca todas as garrafas do usuário (ativas + consumidas) via client Supabase (já escopado por RLS) e gera um download CSV e/ou JSON no navegador (Blob + link temporário) — backup simples, sem dependência de backend extra.

## 5. Internacionalização (i18n)

- Biblioteca: `react-i18next` + `i18next-browser-languagedetector`.
- Idiomas: `pt-BR` (padrão), `en`, `es`. Arquivos de tradução em `src/locales/{idioma}/translation.json`, cobrindo apenas strings de UI (labels, botões, mensagens) — dados inseridos pelo usuário (nome do vinho, uvas, notas) nunca são traduzidos.
- Detecção: na primeira visita, usa o idioma do navegador (fallback `pt-BR` se não for um dos 3 suportados); a escolha é persistida em `localStorage` antes do login.
- Após login, `profiles.preferred_language` passa a ser a fonte de verdade (sincronizada com o seletor em `/settings`); troca manual atualiza tanto o estado do i18next quanto a coluna no banco.

## 6. PWA (instalável)

- `vite-plugin-pwa` com `registerType: 'autoUpdate'`; `public/manifest.json` define nome, ícones e `display: "standalone"`.
- Cache: app shell (HTML/JS/CSS/ícones) em cache local para carregamento instantâneo; chamadas ao Supabase (dados/auth) **nunca cacheadas** (network-only), para garantir que o estado da adega sempre reflita o banco.
- Ícone do app: a definir na Fase 10 (pode usar um ícone de garrafa/taça ou derivar da foto do usuário).

## 7. Build / Deploy (Coolify)

**Dockerfile** (multi-stage, build + Nginx estático):
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ADSENSE_CLIENT_ID
ARG VITE_ADSENSE_SLOT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_ADSENSE_CLIENT_ID=$VITE_ADSENSE_CLIENT_ID
ENV VITE_ADSENSE_SLOT_ID=$VITE_ADSENSE_SLOT_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**nginx.conf** (fallback de SPA):
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
  location ~* \.(js|css|svg|png|jpg|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

**Env vars no Coolify:** todas as `VITE_*` acima devem ser **Build Variables** (viram Docker `ARG`), nunca só runtime — o bundle Vite é compilado em build-time.

**Isolamento da chave Anthropic:** `ANTHROPIC_API_KEY` só existe como secret da Edge Function (`supabase secrets set ANTHROPIC_API_KEY=...`), nunca no Vite/Docker/bundle.

**Notas operacionais (fáceis de esquecer):**
- Ao trocar de `localhost` para o domínio real do Coolify, atualizar as Redirect URLs no Supabase Auth **e** no Google Cloud Console (OAuth), senão o login com Google quebra em produção.
- Google AdSense indexa melhor conteúdo público; como a maior parte do app fica atrás de login, a `LandingPage` pública (seção 3) é o que dá ao Google algo para rastrear — isso ajuda a relevância dos anúncios, mas não garante alta receita num app majoritariamente autenticado.
- Aprovação do AdSense exige site publicamente acessível com Política de Privacidade (seção 4.1/Fase 1 já cobre isso) — só é possível solicitar após o deploy real (Fase 7).

## 8. Monetização (Google AdSense)

Banner fixo no rodapé das páginas autenticadas principais (`CellarPage`, `HistoryPage`) e também na `LandingPage` pública — não exibido em `/login`, `/signup`, `/onboarding/layout`, `/privacy`, `/terms`.

- **Componente:** `src/components/ads/AdBanner.tsx` — injeta `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js` uma vez e renderiza:
  ```html
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="${VITE_ADSENSE_CLIENT_ID}" data-ad-slot="${VITE_ADSENSE_SLOT_ID}"
       data-ad-format="auto" data-full-width-responsive="true"></ins>
  ```
  seguido de `(adsbygoogle = window.adsbygoogle || []).push({})`.
- Se as env vars estiverem ausentes, `AdBanner` não renderiza nada (sem quebrar dev local).

## 9. Ordem de implementação (cada fase demonstrável)

| Fase | Escopo | Critério de demo |
|---|---|---|
| **0** | Scaffold (Vite+React+TS+Tailwind+React Router+i18n base), projeto Supabase, migration completa (`shelves`, `bottles`, `profiles`, `scan_usage`, RLS, triggers, buckets+políticas) | `supabase db push` ok; RLS verificado com dois usuários de teste |
| **1** | Auth (signup/login/logout/Google OAuth) com aceite obrigatório de termos; páginas públicas `/`, `/privacy`, `/terms` | Cadastro só completa com checkbox marcado; `terms_accepted_at` gravado; páginas públicas acessíveis sem login |
| **2** | Layout config (onboarding + settings) + visualização ilustrada mobile-first, read-only | Novo usuário define prateleiras/capacidade e vê a adega vazia, usável no celular |
| **3** | Foto de fundo real + calibração (opcional) | Upload de uma foto, calibrar uma prateleira, ver marcadores na posição certa |
| **4** | CRUD manual de garrafas: adicionar/editar/excluir, seletor de slot, multi-garrafa, tratamento de conflito de slot | Adicionar 3 garrafas do mesmo vinho ocupa 3 slots distintos; conflito de slot mostra erro amigável |
| **5** | Histórico de consumo + reativar | "Marcar como consumida" libera o slot; "Reativar" volta a garrafa para "sem posição" |
| **6** | Scan de rótulo via IA + rate limiting (`scan_usage`) | Foto real gera formulário pré-preenchido; ao exceder o limite diário, scan é bloqueado com mensagem clara e cadastro manual continua funcionando |
| **7** | Dockerfile + nginx + deploy no Coolify + verificação das env vars + ajuste de Redirect URLs | App builda e roda em container no Coolify contra o Supabase real, login Google funcionando em produção |
| **8** | Monetização: `AdBanner` (Google AdSense) | Banner carrega sem erro em produção; em dev sem client ID, não renderiza nada |
| **9** | Internacionalização: pt-BR/en/es com detecção + troca manual | Trocar idioma em `/settings` muda toda a UI e persiste após reload/login |
| **10** | PWA instalável + exportar dados (CSV/JSON) | App pode ser adicionado à tela inicial do celular; botão de exportação baixa um CSV/JSON válido da coleção |

## Verificação

- **Fase 0:** aplicar a migration num projeto Supabase real; dois usuários de teste confirmam isolamento via RLS.
- **Fase 1:** tentar cadastrar sem marcar o checkbox (deve bloquear); confirmar `terms_accepted_at` populado após cadastro bem-sucedido.
- **Fases 2, 4, 5:** testar no navegador (`npm run dev`, com emulação mobile) o fluxo: login → layout → adicionar garrafas (inclusive múltiplas do mesmo vinho) → consumir → reativar → ver histórico.
- **Fase 3:** calibrar uma foto real e confirmar que os marcadores caem nas posições corretas em diferentes tamanhos de tela.
- **Fase 6:** testar com foto real de rótulo; forçar o limite diário (ou baixá-lo temporariamente) e confirmar que o bloqueio funciona e não derruba o cadastro manual.
- **Fase 7:** build Docker local + deploy no Coolify; testar login (incluindo Google OAuth) no domínio real.
- **Fase 8:** confirmar banner carregando em produção sem erros no console.
- **Fase 9:** trocar idioma manualmente e verificar persistência após logout/login; testar detecção automática com navegador em inglês/espanhol.
- **Fase 10:** instalar o PWA no celular (Android/iOS) e testar o fluxo de exportação de dados.
