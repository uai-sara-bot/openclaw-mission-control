import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const body = await req.json()
    const { runId, action, sessionKey, prompt, source, response, error, agentName, toolName, thinking } = body

    const timestamp = new Date().toISOString()
    
    // Determine agent name from session key
    const agent = agentName || sessionKey?.split(':')[1] || 'unknown'

    if (action === 'start') {
      // Create a new task
      const { data: task } = await supabase
        .from('tasks')
        .upsert({
          run_id: runId,
          title: prompt?.slice(0, 100) || 'Agent task',
          description: prompt,
          status: 'inprogress',
          assignee: agent,
          source: source || 'direct',
          started_at: timestamp
        }, { onConflict: 'run_id' })
        .select()
        .single()

      // Create activity event
      await supabase.from('activity_events').insert({
        run_id: runId,
        agent_name: agent,
        action: `Started: ${prompt?.slice(0, 80) || 'new task'}`,
        event_type: 'start',
        source,
        task_id: task?.id
      })

      // Update agent status
      await supabase.from('agents').upsert({
        id: agent,
        name: agent,
        status: 'working',
        current_task: prompt?.slice(0, 100),
        last_active: timestamp
      }, { onConflict: 'id' })

      // Create notification
      await supabase.from('notifications').insert({
        type: 'task',
        title: `${agent} started a task`,
        message: prompt?.slice(0, 100),
        agent_name: agent,
        run_id: runId
      })

    } else if (action === 'progress') {
      // Get task by run_id
      const { data: task } = await supabase
        .from('tasks').select('id').eq('run_id', runId).single()

      await supabase.from('activity_events').insert({
        run_id: runId,
        agent_name: agent,
        action: toolName ? `Used ${toolName}` : (thinking?.slice(0, 100) || 'Working...'),
        event_type: toolName ? 'tool_use' : 'progress',
        details: response?.slice(0, 500),
        task_id: task?.id
      })

      await supabase.from('agents').upsert({
        id: agent,
        name: agent,
        status: 'working',
        last_active: timestamp
      }, { onConflict: 'id' })

    } else if (action === 'end') {
      const { data: task } = await supabase
        .from('tasks').select('id, started_at').eq('run_id', runId).single()

      const durationMs = task?.started_at
        ? new Date().getTime() - new Date(task.started_at).getTime()
        : null

      await supabase.from('tasks').update({
        status: 'done',
        completed_at: timestamp,
        duration_ms: durationMs
      }).eq('run_id', runId)

      await supabase.from('activity_events').insert({
        run_id: runId,
        agent_name: agent,
        action: `Completed${durationMs ? ` in ${Math.round(durationMs/1000)}s` : ''}`,
        event_type: 'end',
        details: response?.slice(0, 500),
        task_id: task?.id
      })

      await supabase.from('agents').upsert({
        id: agent,
        name: agent,
        status: 'idle',
        current_task: null,
        last_active: timestamp
      }, { onConflict: 'id' })

    } else if (action === 'error') {
      await supabase.from('tasks').update({
        status: 'review',
        completed_at: timestamp
      }).eq('run_id', runId)

      await supabase.from('activity_events').insert({
        run_id: runId,
        agent_name: agent,
        action: `Error: ${error?.slice(0, 100)}`,
        event_type: 'error',
        details: error
      })

      await supabase.from('notifications').insert({
        type: 'error',
        title: `${agent} encountered an error`,
        message: error?.slice(0, 100),
        agent_name: agent,
        run_id: runId
      })

      await supabase.from('agents').upsert({
        id: agent,
        name: agent,
        status: 'error',
        last_active: timestamp
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
