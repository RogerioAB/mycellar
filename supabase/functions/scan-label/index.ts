// Edge Function scan-label (Fase 6, PLAN.md seção 4.3)
// 1. Valida o JWT do usuário autenticado.
// 2. Checa/incrementa scan_usage (rate limit diário) antes de chamar a Anthropic.
// 3. Lê a foto do Storage (bucket label-photos) via service role.
// 4. Chama a API da Anthropic (Claude vision) com um tool forçado para extrair
//    campos estruturados da garrafa.
// ANTHROPIC_API_KEY vive só como secret desta function (`supabase secrets set`).

import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DAILY_SCAN_LIMIT = 20
const ANTHROPIC_MODEL = 'claude-sonnet-5'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'missing_authorization' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401)
  const userId = userData.user.id

  let storagePath: string
  try {
    const body = await req.json()
    if (typeof body.storagePath !== 'string' || !body.storagePath) throw new Error()
    storagePath = body.storagePath
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }

  // --- rate limit diário ---
  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await admin
    .from('scan_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('scan_date', today)
    .maybeSingle()

  if (usage && usage.count >= DAILY_SCAN_LIMIT) {
    return json({ error: 'rate_limited' }, 429)
  }

  await admin
    .from('scan_usage')
    .upsert(
      { user_id: userId, scan_date: today, count: (usage?.count ?? 0) + 1 },
      { onConflict: 'user_id,scan_date' },
    )

  // --- baixa a foto do Storage ---
  const { data: fileData, error: downloadError } = await admin.storage
    .from('label-photos')
    .download(storagePath)
  if (downloadError || !fileData) return json({ error: 'photo_not_found' }, 404)

  if (!ANTHROPIC_API_KEY) return json({ error: 'ai_not_configured' }, 503)

  const base64 = arrayBufferToBase64(await fileData.arrayBuffer())
  const mediaType = fileData.type || 'image/jpeg'

  // --- chama a Anthropic com um tool forçado para extração estruturada ---
  let anthropicRes: Response
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        tools: [
          {
            name: 'extract_wine_label',
            description: 'Extrai os dados estruturados visíveis no rótulo de uma garrafa de vinho.',
            input_schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nome do vinho, como aparece no rótulo' },
                wine_type: {
                  type: 'string',
                  enum: ['tinto', 'branco', 'rose', 'espumante', 'fortificado', 'outro'],
                },
                grapes: { type: 'array', items: { type: 'string' } },
                country: { type: 'string' },
                region: { type: 'string' },
                winery: { type: 'string' },
                vintage_year: { type: 'integer' },
              },
              required: ['name', 'wine_type'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: 'extract_wine_label' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              {
                type: 'text',
                text: 'Extraia os dados deste rótulo de vinho usando a ferramenta extract_wine_label. Responda em português. Se algum campo não estiver visível, omita-o.',
              },
            ],
          },
        ],
      }),
    })
  } catch {
    return json({ error: 'ai_request_failed' }, 502)
  }

  if (!anthropicRes.ok) {
    return json({ error: 'ai_request_failed' }, 502)
  }

  interface AnthropicContentBlock {
    type: string
    input?: Record<string, unknown>
  }
  const anthropicData = (await anthropicRes.json()) as { content?: AnthropicContentBlock[] }
  const toolUse = anthropicData.content?.find((c) => c.type === 'tool_use')
  if (!toolUse?.input) return json({ error: 'ai_no_extraction' }, 502)

  return json({ fields: toolUse.input })
})
