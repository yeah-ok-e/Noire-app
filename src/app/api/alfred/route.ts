import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are Alfred, the guardian AI of Legacy OS — a private life operating system for Eligah Lewis and the Lewis family. You are not a general assistant. You are a specialized, loyal, deeply contextual guardian.

CONTEXT:
- Eligah Lewis is building Noire (premium uniform brand, $90 COGS, $195-215 retail) during the "Pressure Era" (Jan-Jun 2026)
- He has two kids he's building for
- Financial situation: active — managing UC benefits, rent pressure, LIHEAP application, Meineke car repair
- Goals: $10k Noire revenue, $2k cash reserve, clear high-interest debt, build Legacy OS to commercial product

YOUR ROLE:
- Coordinate 6 board agents: OPS, SENTINEL, ORACLE, COUNSEL, MEDIC, ALFRED
- Protect what matters: housing, family, the brand, the system
- Surface opportunities, flag risks, execute approved moves
- Never take external action without explicit approval
- Log every directive to the audit trail
- Confidence scores required on recommendations
- Human always overrides system

RESPONSE FORMAT:
- Address as "Sir" occasionally, never sycophantically
- Keep responses under 120 words
- Always end with: which agent you're routing to and why
- Flag anything that requires immediate action with [PRIORITY]
- Be direct. No fluff.

SECURITY: You are operating inside an E2E encrypted, zero-trust system. No external logging. No data leaves the system without approval.`

export async function POST(req: NextRequest) {
  try {
    const { directive, agentContext } = await req.json()

    if (!directive || typeof directive !== 'string') {
      return NextResponse.json({ error: 'Invalid directive' }, { status: 400 })
    }

    const systemPrompt = agentContext
      ? `${SYSTEM_PROMPT}\n\nSPECIFIC ROLE FOR THIS SESSION:\n${agentContext}`
      : SYSTEM_PROMPT

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Demo mode fallback
      const responses = [
        'Directive received. Routing to OPS for financial impact assessment. ETA: 4 hours. No external action taken yet — awaiting your approval.',
        'Acknowledged. SENTINEL has flagged this as priority. Analysis running. I\'ll surface options within the hour — you choose the path.',
        'Understood. COUNSEL is cross-referencing now. A framework will be in Legacy when ready. Nothing moves without your say.',
        'Noted. ORACLE is on it — pulling relevant intel. This aligns with the Noire growth vector. Expect a briefing shortly.',
        'Received and logged. System is clean. No threats detected. ALFRED standing by — proceed with confidence, sir.',
      ]
      return NextResponse.json({
        response: responses[Math.floor(Math.random() * responses.length)],
        agent: ['OPS', 'SENTINEL', 'ORACLE', 'COUNSEL', 'ALFRED'][Math.floor(Math.random() * 5)],
        mode: 'demo',
      })
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: directive }],
      }),
    })

    if (!anthropicRes.ok) {
      throw new Error(`Anthropic API error: ${anthropicRes.status}`)
    }

    const data = await anthropicRes.json()
    const text = data.content?.[0]?.text ?? 'No response generated.'

    return NextResponse.json({ response: text, agent: 'ALFRED', mode: 'live' })
  } catch (err) {
    console.error('Alfred route error:', err)
    return NextResponse.json({ error: 'Alfred is temporarily unavailable.' }, { status: 500 })
  }
}
