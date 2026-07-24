<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/page-header.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import { notifications, notificationsLoading, notificationsError, notificationsActions } from '$lib/stores/notifications';
  import Bell from 'lucide-svelte/icons/bell';
  import CheckCheck from 'lucide-svelte/icons/check-check';
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Info from 'lucide-svelte/icons/info';
  import CheckCircle from 'lucide-svelte/icons/check-circle';
  import Loader from 'lucide-svelte/icons/loader';
  import MessageSquare from 'lucide-svelte/icons/message-square';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';

  onMount(() => {
    notificationsActions.load();
  });

  const typeConfig: Record<string, { icon: typeof Info; bgColor: string; iconColor: string; borderColor: string }> = {
    INFO:    { icon: Info,          bgColor: 'bg-primary/10',     iconColor: 'text-primary',     borderColor: 'border-l-primary' },
    WARNING: { icon: AlertTriangle, bgColor: 'bg-warning/10',     iconColor: 'text-warning',     borderColor: 'border-l-warning' },
    ERROR:   { icon: AlertCircle,   bgColor: 'bg-destructive/10', iconColor: 'text-destructive', borderColor: 'border-l-destructive' },
    HELLO_WORLD: { icon: MessageSquare, bgColor: 'bg-success/10', iconColor: 'text-success', borderColor: 'border-l-success' },
    FIRMWARE_OUTCOME: { icon: RefreshCw, bgColor: 'bg-indigo-500/10', iconColor: 'text-indigo-500', borderColor: 'border-l-indigo-500' },
    FIRMWARE_OUTCOME_ERROR: { icon: AlertCircle, bgColor: 'bg-destructive/10', iconColor: 'text-destructive', borderColor: 'border-l-destructive' },
    NETWORK_RESULT: { icon: Info, bgColor: 'bg-cyan-500/10', iconColor: 'text-cyan-500', borderColor: 'border-l-cyan-500' },
  };

  async function markAsRead(id: number) {
    try {
      await notificationsActions.markRead(id);
    } catch {
      // error shown via $notificationsError
    }
  }

  async function markAllAsRead() {
    try {
      await notificationsActions.markAllRead();
    } catch {
      // error shown via $notificationsError
    }
  }



  function formatArgentinaTime(epochSeconds: number | string): string {
    const date = new Date(Number(epochSeconds) * 1000);
    const formatter = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    return `${getPart('hour')}:${getPart('minute')}:${getPart('second')} ${getPart('day')}/${getPart('month')}/${getPart('year')}`;
  }
</script>

<div class="space-y-6">
  <PageHeader
    title="Notificaciones"
    description="Alertas y eventos del sistema IoT"
  />

  <!-- Action bar -->
  <div class="flex items-center justify-between animate-slide-in">
    <div class="flex items-center gap-3">
      {#if $notifications.length > 0}
        <div class="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5">
          <span class="flex h-6 w-6 items-center justify-center rounded-full
                       bg-primary text-xs font-bold text-primary-foreground
                       animate-pulse">
            {$notifications.length}
          </span>
          <span class="text-sm font-semibold text-primary">pendientes</span>
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {#if $notifications.length > 0}
        <button
          onclick={markAllAsRead}
          disabled={$notificationsLoading}
          class="btn-secondary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-60"
        >
          <CheckCheck class="h-4 w-4" />
          Marcar todo leído
        </button>
      {/if}
    </div>
  </div>

  {#if $notificationsLoading}
    <div class="flex items-center justify-center py-20 text-muted-foreground gap-3">
      <Loader class="h-6 w-6 animate-spin" />
      <span class="text-sm">Cargando notificaciones...</span>
    </div>
  {:else if $notifications.length === 0}
    <EmptyState
      icon={Bell}
      title="Sin notificaciones"
      description="No tienes notificaciones pendientes. El sistema te alertará cuando haya eventos importantes."
    />
  {:else}
    <div class="space-y-3">
      {#each $notifications as notification, i}
        {@const config = typeConfig[notification.type] ?? typeConfig.INFO}
        <div
          class="stagger-item group relative rounded-2xl border bg-card p-5
                 transition-all duration-300 hover:shadow-lg
                 border-l-4 {config.borderColor} border-border shadow-md"
          style="animation-delay: {i * 0.05}s"
        >
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl {config.bgColor}
                        transition-transform duration-200 group-hover:scale-110">
              <config.icon class="h-6 w-6 {config.iconColor}" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0 max-w-full">
                  {#if notification.type === 'HELLO_WORLD'}
                    {@const matchEdge = notification.description.match(/edge_id:\s*(\S+)/)}
                    {@const matchTs = notification.description.match(/timestamp:\s*(\d+)/)}
                    {@const edgeId = matchEdge ? matchEdge[1] : 'Desconocido'}
                    {@const timestampStr = matchTs ? matchTs[1] : '0'}
                    
                    <h4 class="font-semibold text-card-foreground text-base max-w-full break-words">Mensaje de Hello World</h4>
                    <div class="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground max-w-full break-words">
                      <span><strong class="font-medium">Edge:</strong> {edgeId}</span>
                      <span><strong class="font-medium">Timestamp:</strong> {formatArgentinaTime(timestampStr)}</span>
                    </div>
                  {:else if notification.type === 'FIRMWARE_OUTCOME'}
                    {@const matchNet = notification.description.match(/network_id:\s*(\S+)/)}
                    {@const matchPerc = notification.description.match(/percentage:\s*([\d.]+)/)}
                    {@const matchTs = notification.description.match(/timestamp:\s*(\d+)/)}
                    {@const networkId = matchNet ? matchNet[1] : 'Desconocido'}
                    {@const percentage = matchPerc ? matchPerc[1] : '0'}
                    {@const timestampStr = matchTs ? matchTs[1] : '0'}

                    <h4 class="font-semibold text-card-foreground text-base max-w-full break-words">Resultado de actualización de firmware remota</h4>
                    <div class="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground max-w-full break-words">
                      <span><strong class="font-medium">Red:</strong> {networkId}</span>
                      <span><strong class="font-medium">Porcentaje de éxito:</strong> {percentage}%</span>
                      <span><strong class="font-medium">Timestamp:</strong> {formatArgentinaTime(timestampStr)}</span>
                    </div>
                  {:else if notification.type === 'FIRMWARE_OUTCOME_ERROR'}
                    {@const matchNet = notification.description.match(/network_id:\s*(\S+)/)}
                    {@const matchErr = notification.description.match(/error:\s*(.*)/)}
                    {@const matchTs = notification.description.match(/timestamp:\s*(\d+)/)}
                    {@const networkId = matchNet ? matchNet[1] : 'Desconocido'}
                    {@const errorMessage = matchErr ? matchErr[1] : 'Error desconocido'}
                    {@const timestampStr = matchTs ? matchTs[1] : '0'}

                    <h4 class="font-semibold text-destructive text-base max-w-full break-words">Error en Actualización de Firmware</h4>
                    <div class="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground max-w-full break-words">
                      <span><strong class="font-medium text-destructive/80">Red:</strong> {networkId}</span>
                      <span><strong class="font-medium text-destructive/80">Error:</strong> {errorMessage}</span>
                      <span><strong class="font-medium text-destructive/80">Timestamp:</strong> {formatArgentinaTime(timestampStr)}</span>
                    </div>
                  {:else if notification.type === 'NETWORK_RESULT'}
                    {@const matchNet = notification.description.match(/network_id:\s*(\S+)/)}
                    {@const matchSucc = notification.description.match(/success:\s*(true|false)/)}
                    {@const matchTs = notification.description.match(/timestamp:\s*(\d+)/)}
                    {@const matchMsg = notification.description.match(/message:\s*(.*)/)}
                    {@const networkId = matchNet ? matchNet[1] : 'Desconocido'}
                    {@const successStr = matchSucc ? matchSucc[1] : 'false'}
                    {@const timestampStr = matchTs ? matchTs[1] : '0'}
                    {@const message = matchMsg ? matchMsg[1] : ''}

                    <h4 class="font-semibold text-card-foreground text-base max-w-full break-words">Notificacion de Red</h4>
                    <div class="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground max-w-full break-words">
                      <span><strong class="font-medium">Red:</strong> {networkId}</span>
                      <span><strong class="font-medium">Timestamp:</strong> {formatArgentinaTime(timestampStr)}</span>
                      <span><strong class="font-medium">Mensaje:</strong> {message}</span>
                    </div>
                  {:else}
                    <p class="font-medium text-card-foreground leading-relaxed max-w-full break-words">
                      {notification.description}
                    </p>
                  {/if}
                </div>

                <div class="flex shrink-0 items-center gap-1 opacity-0 transition-all duration-200
                            translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                  <button
                    onclick={() => markAsRead(notification.id)}
                    class="rounded-lg p-2 text-muted-foreground transition-all duration-200
                           hover:bg-primary/10 hover:text-primary hover:scale-110"
                    title="Marcar como leído"
                  >
                    <CheckCheck class="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Unread dot -->
          <div class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
        </div>
      {/each}
    </div>
  {/if}
</div>
