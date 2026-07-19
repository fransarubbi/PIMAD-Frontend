<script lang="ts">
  import { onMount } from "svelte";
  import PageHeader from "$lib/components/page-header.svelte";
  import Modal from "$lib/components/modal.svelte";
  import StatusBadge from "$lib/components/status-badge.svelte";
  import EmptyState from "$lib/components/empty-state.svelte";
  import type { Edge } from "$lib/types";
  import { edges, edgesLoading, edgesActions, edgeStates } from "$lib/stores/edges";
  import { goto } from "$app/navigation";
  import Plus from "lucide-svelte/icons/plus";
  import Server from "lucide-svelte/icons/server";
  import NetworkIcon from "lucide-svelte/icons/network";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import MapPin from "lucide-svelte/icons/map-pin";
  import Eye from "lucide-svelte/icons/eye";
  import Download from "lucide-svelte/icons/download";
  import Loader from "lucide-svelte/icons/loader";
  import AlertCircle from "lucide-svelte/icons/alert-circle";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import Info from "lucide-svelte/icons/info";

  onMount(() => {
    edgesActions.load();
  });

  // Modal visibility
  let showCreateEdgeModal = $state(false);
  let showViewEdgeModal   = $state(false);
  let showDeleteEdgeModal = $state(false);

  // Selected items
  let viewingEdge       = $state<Edge | null>(null);
  let targetDeleteEdge  = $state<Edge | null>(null);

  // Local action states (independent from the global list-loading state)
  let isSubmitting  = $state(false);
  let actionError   = $state<string | null>(null);

  // Form state with default values
  let newEdge = $state<Edge>({
    edgeId: "",
    name: "",
    location: "",
    hostServer: "127.0.0.1",
    hostPort: 8080,
    cn: "localhost",
    hostLocal: "127.0.0.1",
    dataBasePath: "/var/lib/edge.db",
    bufferLength: 20,
    logLevel: "INFO",
    maxNumberHandshakeAttempts: 3,
    frequencyMessagesPhase: 5,
    frequencyMessagesSafeMode: 20,
    handshakeTimeLimit: 30,
    phaseTimeLimit: 60,
    safeModeTimeLimit: 150,
    heartbeatBalanceModeTime: 20,
    heartbeatNormalTime: 45,
    heartbeatSafeModeTime: 60,
  });

  async function createEdge() {
    if (!newEdge.name?.trim() || !newEdge.edgeId?.trim()) return;
    actionError = null;
    isSubmitting = true;
    try {
      await edgesActions.add({ ...newEdge });
      newEdge.edgeId = "";
      newEdge.name = "";
      newEdge.location = "";
      showCreateEdgeModal = false;
    } catch (err) {
      actionError = err instanceof Error ? err.message : String(err);
    } finally {
      isSubmitting = false;
    }
  }

  async function confirmDeleteEdge() {
    if (!targetDeleteEdge) return;
    actionError = null;
    isSubmitting = true;
    try {
      await edgesActions.remove(targetDeleteEdge.edgeId);
      showDeleteEdgeModal = false;
      targetDeleteEdge = null;
    } catch (err) {
      actionError = err instanceof Error ? err.message : String(err);
    } finally {
      isSubmitting = false;
    }
  }

  function deleteEdgePrompt(edge: Edge, event: Event) {
    event.stopPropagation();
    targetDeleteEdge = edge;
    actionError = null;
    showDeleteEdgeModal = true;
  }

  function viewEdgeConfig(edge: Edge, event: Event) {
    event.stopPropagation();
    viewingEdge = edge;
    showViewEdgeModal = true;
  }

  async function downloadEdgeConfig(edge: Edge, event: Event) {
    event.stopPropagation();
    try {
      await edgesActions.downloadConfig(edge.edgeId);
    } catch (err) {
      // non-critical, silent fail
      console.error("Download failed:", err);
    }
  }

  function goToNetworks(edgeId: string) {
    goto(`/edge/${edgeId}/networks`);
  }

  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("es", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  }
</script>

<div class="space-y-6">
  <PageHeader
    title="Dispositivos Edge"
    description="Administra y supervisa tus dispositivos Edge"
  />

  <div class="flex items-center justify-between animate-slide-in">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 transition-all duration-200 hover:border-primary/30">
        <span class="text-sm text-muted-foreground">Total:</span>
        <span class="font-bold text-card-foreground">{$edges.length} edges</span>
      </div>
    </div>

    <button
      onclick={() => (showCreateEdgeModal = true)}
      class="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
    >
      <Plus class="h-4 w-4" />
      Nuevo Edge
    </button>
  </div>

  <!--
    Only show the full-page spinner on the FIRST load (when the list is empty).
    Never show it while a modal action is in progress.
  -->
  {#if $edgesLoading && $edges.length === 0}
    <div class="flex items-center justify-center py-20 text-muted-foreground gap-3">
      <Loader class="h-6 w-6 animate-spin" />
      <span class="text-sm">Cargando dispositivos...</span>
    </div>
  {:else if $edges.length === 0}
    <EmptyState
      icon={Server}
      title="Sin Edge Devices"
      description="No tienes ningún dispositivo Edge configurado. Crea uno para comenzar a gestionar tu infraestructura IoT."
      actionLabel="Crear Edge Device"
      onAction={() => (showCreateEdgeModal = true)}
    >
      <!-- Retry button when load failed -->
      <button
        onclick={() => edgesActions.load()}
        class="mt-3 flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RefreshCw class="h-3.5 w-3.5" />
        Reintentar conexión
      </button>
    </EmptyState>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {#each $edges as edge, i}
        <div
          role="button"
          tabindex="0"
          onkeydown={(e) => (e.key === "Enter" || e.key === " ") && goToNetworks(edge.edgeId)}
          onclick={() => goToNetworks(edge.edgeId)}
          class="stagger-item card-interactive group p-5 text-left w-full cursor-pointer"
          style="animation-delay: {i * 0.05}s"
        >
          <div class="flex items-start justify-between">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/30">
              <Server class="h-7 w-7 text-primary" />
            </div>
            <StatusBadge status={$edgeStates[edge.edgeId] || 'Inactive'} />
          </div>

          <h3 class="mt-4 text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary max-w-full break-words">
            {edge.name}
          </h3>

          {#if edge.location}
            <div class="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground max-w-full break-words">
              <MapPin class="h-4 w-4 shrink-0" />
              <span class="truncate">{edge.location}</span>
            </div>
          {/if}

          <div class="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <NetworkIcon class="h-4 w-4 shrink-0" />
              <span>Ver redes</span>
            </div>
            <div class="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
              ID: {edge.edgeId}
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button
              onclick={(e) => deleteEdgePrompt(edge, e)}
              title="Eliminar"
              class="flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:shadow-lg hover:shadow-destructive/20"
            >
              <Trash2 class="h-4 w-4" />
            </button>
            <button
              onclick={(e) => viewEdgeConfig(edge, e)}
              title="Ver configuración"
              class="flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              <Eye class="h-4 w-4" />
            </button>
            <button
              onclick={(e) => downloadEdgeConfig(edge, e)}
              title="Descargar configuración ZIP"
              class="hidden md:flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              <Download class="h-4 w-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Create Edge Modal -->
{#snippet infoLabel(forId: string, labelText: string, infoText: string)}
  <div class="flex items-center gap-1.5">
    <label for={forId} class="block text-xs font-semibold text-muted-foreground">{labelText}</label>
    <div class="group relative flex items-center justify-center">
      <Info class="h-3.5 w-3.5 text-muted-foreground cursor-help transition-colors hover:text-primary" />
      <div class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-6 scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
        <div class="rounded-lg bg-popover text-popover-foreground shadow-md border border-border p-3 text-xs text-left leading-relaxed font-normal whitespace-pre-line z-50">
          {infoText}
        </div>
        <div class="absolute -bottom-1.5 left-6 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover z-50"></div>
      </div>
    </div>
  </div>
{/snippet}

<Modal
  open={showCreateEdgeModal}
  title="Nuevo Edge Device"
  maxWidth="max-w-3xl"
  onClose={() => (showCreateEdgeModal = false)}
>
  <form onsubmit={(e) => { e.preventDefault(); createEdge(); }} class="px-1 text-left">
    <div class="space-y-6">

      <!-- System Specs -->
      <div>
        <h3 class="text-sm uppercase tracking-wider font-bold text-primary mb-3">Configuración de Sistema</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            {@render infoLabel('create-edgeId', 'ID del Edge', 'Identificador unico del dispositivo Edge')}
            <input id="create-edgeId" type="text" bind:value={newEdge.edgeId} class="input-field py-1.5 font-mono" required placeholder="edge-001" />
          </div>
          <div class="space-y-1.5">
            {@render infoLabel('create-name', 'Nombre', 'Identificacion informal para facilitar reconocimiento de los dispositivos')}
            <input id="create-name" type="text" bind:value={newEdge.name} class="input-field py-1.5" required placeholder="Edge Gateway Sur" />
          </div>
          <div class="col-span-2 space-y-1.5">
            {@render infoLabel('create-ubic', 'Ubicación', 'Descripcion de la ubicacion donde esta el dispositivo fisicamente')}
            <input id="create-ubic" type="text" bind:value={newEdge.location} class="input-field py-1.5" placeholder="Datacenter Principal" />
          </div>
          <div class="space-y-1.5">
            {@render infoLabel('create-cn', 'CN del certificado de router', 'Dominio del servidor al que se conecta el dispositivo Edge')}
            <input id="create-cn" type="text" bind:value={newEdge.cn} class="input-field py-1.5 font-mono" placeholder="device.local" />
          </div>
          <div class="col-span-2 grid grid-cols-3 gap-3">
            <div class="space-y-1.5 flex-1">
              {@render infoLabel('create-hostServer', 'Host Server', 'Direccion IP o Hostname del servidor al que se conecta el dispositivo Edge')}
              <input id="create-hostServer" type="text" bind:value={newEdge.hostServer} class="input-field py-1.5 font-mono" />
            </div>
            <div class="space-y-1.5 flex-[0.5]">
              {@render infoLabel('create-port', 'Puerto', 'Puerto para la conexion gRPC con el servidor (50051)')}
              <input id="create-port" type="number" bind:value={newEdge.hostPort} class="input-field py-1.5 font-mono" />
            </div>
            <div class="space-y-1.5 flex-1">
              {@render infoLabel('create-hostLocal', 'Host Local', 'Direccion IP o Hostname local del dispositivo Edge')}
              <input id="create-hostLocal" type="text" bind:value={newEdge.hostLocal} class="input-field py-1.5 font-mono" />
            </div>
          </div>
          <div class="col-span-2 space-y-1.5">
            {@render infoLabel('create-db', 'Ruta Base de Datos', 'Path para la ubicacion de la base de datos en el almacenamiento del dispositivo Edge')}
            <input id="create-db" type="text" bind:value={newEdge.dataBasePath} class="input-field py-1.5 font-mono text-xs" />
          </div>
          <div class="space-y-1.5">
            {@render infoLabel('create-buffer', 'Tamaño Buffer', 'Tamaño maximo del buffer de procesamiento batch')}
            <input id="create-buffer" type="number" min="5" max="50" bind:value={newEdge.bufferLength} class="input-field py-1.5" />
          </div>
          <div class="space-y-1.5">
            {@render infoLabel('create-log', 'Log', 'Nivel de log del dispositivo Edge')}
            <select id="create-log" bind:value={newEdge.logLevel} class="input-field py-1.5 bg-background">
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
            </select>
          </div>
        </div>
      </div>

      <div class="border-t border-border"></div>

      <!-- Protocol Specs -->
      <div>
        <h3 class="text-sm uppercase tracking-wider font-bold text-primary mb-3">Configuración de Protocolo</h3>
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            {@render infoLabel('p-max-a', 'Numero maximo de intentos en handshake (1-14)', 'Numero maximo de intentos que hara el Edge para sincronizarse en el handshake con los dispositivos Hub')}
            <input id="p-max-a" type="number" min="1" max="14" bind:value={newEdge.maxNumberHandshakeAttempts} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-fp', 'Frecuencia de envio de mensajes en cualquier fase (seg)', 'Cada cuanto tiempo en segundos deben enviarse mensajes cuando el protocolo se encuentra en alguna de las fases')}
            <input id="p-fp" type="number" min="1" bind:value={newEdge.frequencyMessagesPhase} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-fs', 'Frecuencia de envio de mensajes en safe mode (seg)', 'Cada cuanto tiempo en segundos deben enviarse mensajes en safe mode')}
            <input id="p-fs" type="number" min="1" bind:value={newEdge.frequencyMessagesSafeMode} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-th', 'Tiempo limite de espera en handshake (15-60seg)', 'Tiempo limite que el Edge espera para recibir las confirmaciones tras enviar un mensaje de HandshakeToHub al entrar en estados relacionados al handshake')}
            <input id="p-th" type="number" min="15" max="60" bind:value={newEdge.handshakeTimeLimit} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-tp', 'Tiempo limite de duracion de cualquier fase (30-120seg)', 'Es el tiempo máximo asignado para que las fases activas (Alert, Data, Monitor) concluyan. El sistema espera recibir confirmaciones de colas vacías de al menos el 80% de los hubs dentro de este límite de tiempo antes de dar por expirada la fase')}
            <input id="p-tp" type="number" min="30" max="120" bind:value={newEdge.phaseTimeLimit} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-ts', 'Tiempo limite de duracion del modo safe mode (120-300seg)', 'Es el tiempo máximo asignado para que el safe mode concluya. El sistema espera recibir confirmaciones de colas vacías de al menos el 70% de los hubs dentro de este límite de tiempo antes de dar por expirado el modo')}
            <input id="p-ts" type="number" min="120" max="300" bind:value={newEdge.safeModeTimeLimit} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-hbb', 'Heartbeat en balance mode (10-40seg)', 'Cada cuanto tiempo el Edge envia el mensaje heartbeat a los hubs en estado de balanceo. Debe configurar este mismo tiempo en los dispositivos hubs a traves de la interfaz de configuracion')}
            <input id="p-hbb" type="number" min="10" max="40" bind:value={newEdge.heartbeatBalanceModeTime} class="input-field py-1" />
          </div>
          <div class="space-y-1">
            {@render infoLabel('p-hbn', 'Heartbeat en normal (30-60seg)', 'Cada cuanto tiempo el Edge envia el mensaje heartbeat a los hubs en estado normal. Debe configurar este mismo tiempo en los dispositivos hubs a traves de la interfaz de configuracion')}
            <input id="p-hbn" type="number" min="30" max="60" bind:value={newEdge.heartbeatNormalTime} class="input-field py-1" />
          </div>
          <div class="space-y-1 col-span-2">
            {@render infoLabel('p-hbs', 'Heartbeat en safe mode (40-80seg)', 'Cada cuanto tiempo el Edge envia el mensaje heartbeat a los hubs en safe mode. Debe configurar este mismo tiempo en los dispositivos hubs a traves de la interfaz de configuracion')}
            <input id="p-hbs" type="number" min="40" max="80" bind:value={newEdge.heartbeatSafeModeTime} class="input-field py-1" />
          </div>
        </div>
      </div>

      <!-- Error only shows for user-triggered failures (inside the modal) -->
      {#if actionError}
        <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertCircle class="h-3.5 w-3.5 shrink-0" />
          {actionError}
        </div>
      {/if}

    </div>

    <div class="flex gap-3 pt-6 pb-2">
      <button type="button" onclick={() => (showCreateEdgeModal = false)} class="btn-secondary flex-1 rounded-xl py-3 text-sm">
        Cancelar
      </button>
      <button type="submit" disabled={isSubmitting} class="btn-primary flex-1 rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
        {#if isSubmitting}
          <Loader class="h-4 w-4 animate-spin" />
        {/if}
        Crear Edge
      </button>
    </div>
  </form>
</Modal>

<!-- View Edge Config Modal -->
<Modal
  open={showViewEdgeModal}
  title="Configuración del Edge"
  maxWidth="max-w-2xl"
  onClose={() => (showViewEdgeModal = false)}
>
  {#if viewingEdge}
    <div class="space-y-6">

      <div>
        <h3 class="text-sm uppercase tracking-wider font-bold text-primary mb-3">Configuración de Sistema</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm bg-card/50 border border-border p-3 sm:p-4 rounded-xl">
          <div class="sm:col-span-2">
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">ID del Edge</span>
            <span class="font-mono text-card-foreground font-medium break-all">{viewingEdge.edgeId}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Nombre</span>
            <span class="font-medium text-card-foreground break-words">{viewingEdge.name}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Ubicación</span>
            <span class="text-card-foreground break-words">{viewingEdge.location}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Host Server</span>
            <span class="font-mono text-[11px] sm:text-xs break-all">{viewingEdge.hostServer}:{viewingEdge.hostPort}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Host Local</span>
            <span class="font-mono text-[11px] sm:text-xs break-all">{viewingEdge.hostLocal}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">CN del certificado de router</span>
            <span class="text-[11px] sm:text-xs font-mono break-all">{viewingEdge.cn}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Ruta Base de Datos</span>
            <span class="text-[11px] sm:text-xs font-mono break-all text-secondary-foreground">{viewingEdge.dataBasePath}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Tamaño del Buffer</span>
            <span class="text-card-foreground">{viewingEdge.bufferLength}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px] sm:text-xs mb-0.5">Nivel de Log</span>
            <span class="text-card-foreground">{viewingEdge.logLevel}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-sm uppercase tracking-wider font-bold text-primary mb-3">Configuración de Protocolo</h3>
        <div class="space-y-2 bg-card/50 border border-border p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-2 gap-1">
            <span class="text-muted-foreground">Número máximo de intentos en handshake</span>
            <span class="font-mono font-medium">{viewingEdge.maxNumberHandshakeAttempts}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Frecuencia de envío de mensajes en cualquier fase</span>
            <span class="font-mono font-medium">{viewingEdge.frequencyMessagesPhase} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Frecuencia de envío de mensajes en safe mode</span>
            <span class="font-mono font-medium">{viewingEdge.frequencyMessagesSafeMode} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Tiempo límite de espera en handshake</span>
            <span class="font-mono font-medium">{viewingEdge.handshakeTimeLimit} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Tiempo límite de duración de cualquier fase</span>
            <span class="font-mono font-medium">{viewingEdge.phaseTimeLimit} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Tiempo límite de duración del modo safe mode</span>
            <span class="font-mono font-medium">{viewingEdge.safeModeTimeLimit} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Heartbeat en balance mode</span>
            <span class="font-mono font-medium">{viewingEdge.heartbeatBalanceModeTime} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 py-1.5 gap-1">
            <span class="text-muted-foreground">Heartbeat en normal</span>
            <span class="font-mono font-medium">{viewingEdge.heartbeatNormalTime} s</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pt-1.5 gap-1">
            <span class="text-muted-foreground">Heartbeat en safe mode</span>
            <span class="font-mono font-medium">{viewingEdge.heartbeatSafeModeTime} s</span>
          </div>
        </div>
      </div>

      <div class="pt-4">
        <button onclick={() => (showViewEdgeModal = false)} class="btn-primary w-full rounded-xl py-3 text-sm">
          Cerrar Visualizador
        </button>
      </div>
    </div>
  {/if}
</Modal>

<!-- Delete Edge Protection Modal -->
<Modal
  open={showDeleteEdgeModal}
  title="Protección de Borrado"
  onClose={() => (showDeleteEdgeModal = false)}
>
  {#if targetDeleteEdge}
    <div class="space-y-4 pt-2">
      <div class="flex flex-col items-center justify-center p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
        <div class="bg-destructive text-destructive-foreground p-3 rounded-full mb-3">
          <Trash2 class="h-8 w-8" />
        </div>
        <p class="text-sm font-bold text-destructive">Eliminación Destructiva</p>
      </div>

      <p class="text-card-foreground text-center text-sm px-2">
        ¿Estás seguro que quieres eliminar el edge <strong class="font-bold underline decoration-destructive underline-offset-2">{targetDeleteEdge.edgeId}</strong>?
      </p>

      <p class="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg border border-border mx-2">
        Se eliminarán también todas sus redes y hubs asociados de forma irreversible.
      </p>

      {#if actionError}
        <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertCircle class="h-3.5 w-3.5 shrink-0" />
          {actionError}
        </div>
      {/if}

      <div class="flex gap-3 pt-4">
        <button type="button" onclick={() => (showDeleteEdgeModal = false)} class="btn-secondary flex-1 rounded-xl py-3 text-sm font-medium">
          Cancelar
        </button>
        <button type="button" onclick={confirmDeleteEdge} disabled={isSubmitting} class="bg-destructive hover:bg-destructive/90 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
          {#if isSubmitting}
            <Loader class="h-4 w-4 animate-spin" />
          {/if}
          Confirmar
        </button>
      </div>
    </div>
  {/if}
</Modal>
