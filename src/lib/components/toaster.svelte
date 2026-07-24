<script lang="ts">
  import { toasts } from '$lib/stores/toasts.svelte';
  import { fly, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import X from 'lucide-svelte/icons/x';
  import Info from 'lucide-svelte/icons/info';
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import MessageSquare from 'lucide-svelte/icons/message-square';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import type { Notification } from '$lib/types';

  const typeConfig: Record<string, { icon: typeof Info; colorClass: string }> = {
    INFO: { icon: Info, colorClass: 'text-primary' },
    WARNING: { icon: AlertTriangle, colorClass: 'text-warning' },
    ERROR: { icon: AlertCircle, colorClass: 'text-destructive' },
    HELLO_WORLD: { icon: MessageSquare, colorClass: 'text-success' },
    FIRMWARE_OUTCOME: { icon: RefreshCw, colorClass: 'text-indigo-500' },
    FIRMWARE_OUTCOME_ERROR: { icon: AlertCircle, colorClass: 'text-destructive' },
    NETWORK_RESULT: { icon: Info, colorClass: 'text-cyan-500' },
  };

  function getTitleAndMessage(notification: Notification) {
    if (notification.type === 'NETWORK_RESULT') {
        const matchNet = notification.description.match(/network_id:\s*(\S+)/);
        const matchMsg = notification.description.match(/message:\s*(.*)/);
        const networkId = matchNet ? matchNet[1] : 'Desconocida';
        const message = matchMsg ? matchMsg[1] : 'Sin mensaje';
        return { title: 'Notificación de Red', message: `${networkId}: ${message}` };
    } else if (notification.type === 'HELLO_WORLD') {
        const matchEdge = notification.description.match(/edge_id:\s*(\S+)/);
        const edgeId = matchEdge ? matchEdge[1] : 'Desconocido';
        return { title: 'Nuevo Hello World', message: `Edge conectado: ${edgeId}` };
    } else if (notification.type === 'FIRMWARE_OUTCOME') {
        const matchNet = notification.description.match(/network_id:\s*(\S+)/);
        const matchPerc = notification.description.match(/percentage:\s*([\d.]+)/);
        const networkId = matchNet ? matchNet[1] : 'Desconocida';
        const percentage = matchPerc ? matchPerc[1] : '0';
        return { title: 'Actualización de Firmware', message: `Resultado en ${networkId}: ${percentage}%` };
    } else if (notification.type === 'FIRMWARE_OUTCOME_ERROR') {
        const matchNet = notification.description.match(/network_id:\s*(\S+)/);
        const matchErr = notification.description.match(/error:\s*(.*)/);
        const networkId = matchNet ? matchNet[1] : 'Desconocida';
        const errorMessage = matchErr ? matchErr[1] : 'Error desconocido';
        return { title: 'Error de Firmware', message: `Red: ${networkId} - Error: ${errorMessage}` };
    }
    return { title: 'Nueva Alerta', message: notification.description };
  }
</script>

<div class="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none w-full px-4 max-w-sm">
  {#each toasts.toasts as toast (toast.id)}
    {@const config = typeConfig[toast.notification.type] ?? typeConfig.INFO}
    {@const content = getTitleAndMessage(toast.notification)}
    
    <div
      in:fly={{ y: -50, duration: 600, easing: backOut }}
      out:fade={{ duration: 300 }}
      class="pointer-events-auto flex items-start gap-3 w-full bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 dark:bg-card/90"
    >
      <div class="mt-0.5 shrink-0">
        <config.icon class="h-5 w-5 {config.colorClass}" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-card-foreground">{content.title}</p>
        <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">{content.message}</p>
      </div>
      <button 
        onclick={() => toasts.remove(toast.id)}
        class="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  {/each}
</div>
