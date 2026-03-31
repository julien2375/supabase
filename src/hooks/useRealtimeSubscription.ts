import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface SubscriptionConfig {
  table: string
  event?: EventType
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
}

export function useRealtimeSubscription(configs: SubscriptionConfig[]) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase.channel('planot-realtime')

    for (const config of configs) {
      channel.on(
        'postgres_changes' as 'system',
        {
          event: config.event ?? '*',
          schema: 'public',
          table: config.table,
        } as Record<string, string>,
        (payload: Record<string, unknown>) => {
          const eventType = payload.eventType as string
          if (eventType === 'INSERT' && config.onInsert) config.onInsert(payload)
          if (eventType === 'UPDATE' && config.onUpdate) config.onUpdate(payload)
          if (eventType === 'DELETE' && config.onDelete) config.onDelete(payload)
        }
      )
    }

    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
