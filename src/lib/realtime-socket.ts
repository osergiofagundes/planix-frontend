import { API_ENDPOINTS } from "@/api/endpoints"

export interface RealtimeFrame {
  type: string
  payload: unknown
}

interface RealtimeSocketOptions {
  requestTicket: () => Promise<string>
  onFrame: (frame: RealtimeFrame) => void
  onReconnect: () => void
}

export interface RealtimeSocket {
  close: () => void
}

const BACKOFF_INICIAL = 1_000
const BACKOFF_MAXIMO = 30_000

function socketUrl(ticket: string): string {
  const base = import.meta.env.VITE_REALTIME_URL || window.location.origin
  const url = new URL(API_ENDPOINTS.notifications.socket, base)

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.searchParams.set("ticket", ticket)

  return url.toString()
}

export function createRealtimeSocket({
  requestTicket,
  onFrame,
  onReconnect,
}: RealtimeSocketOptions): RealtimeSocket {
  let socket: WebSocket | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let backoff = BACKOFF_INICIAL
  let jaConectouUmaVez = false
  let fechadoPeloCliente = false

  async function conectar(): Promise<void> {
    if (fechadoPeloCliente) {
      return
    }

    try {
      const ticket = await requestTicket()
      if (fechadoPeloCliente) {
        return
      }

      socket = new WebSocket(socketUrl(ticket))

      socket.onopen = () => {
        backoff = BACKOFF_INICIAL

        if (jaConectouUmaVez) {
          onReconnect()
        }
        jaConectouUmaVez = true
      }

      socket.onmessage = (evento) => {
        try {
          onFrame(JSON.parse(evento.data as string) as RealtimeFrame)
        } catch {
        }
      }

      socket.onclose = () => {
        socket = null
        agendarReconexao()
      }

      socket.onerror = () => socket?.close()
    } catch {
      agendarReconexao()
    }
  }

  function agendarReconexao(): void {
    if (fechadoPeloCliente || timer) {
      return
    }
    timer = setTimeout(() => {
      timer = null
      void conectar()
    }, backoff)

    backoff = Math.min(backoff * 2, BACKOFF_MAXIMO)
  }

  void conectar()

  return {
    close: () => {
      fechadoPeloCliente = true

      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      socket?.close()
      socket = null
    },
  }
}
