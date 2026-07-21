<script lang="ts">
  import PageHeader from '$lib/components/page-header.svelte';
  import { downloadDocumentation } from '$lib/services/api';
  import Download from 'lucide-svelte/icons/download';
  import FileText from 'lucide-svelte/icons/file-text';
  import Loader2 from 'lucide-svelte/icons/loader-circle';

  let isDownloading = $state(false);
  let downloadError = $state<string | null>(null);

  async function handleDownload() {
    isDownloading = true;
    downloadError = null;
    try {
      await downloadDocumentation();
    } catch (err) {
      downloadError = err instanceof Error ? err.message : String(err);
    } finally {
      isDownloading = false;
    }
  }
</script>

<div class="space-y-6 animate-slide-in">
  <PageHeader
    title="Documentación"
    description="Centro de ayuda y recursos del sistema"
  />

  <div class="w-full">
    <div class="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <div class="flex flex-col sm:flex-row items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText class="h-6 w-6" />
          </div>
          <div class="space-y-4 flex-1 min-w-0">
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight max-w-full break-words">Manual del Sistema</h3>
              <p class="mt-2 text-sm text-muted-foreground leading-relaxed break-words">
                Descargue la documentación completa del sistema para comprender el funcionamiento del mismo, configuración, despliegue y puesta en marcha.
              </p>
            </div>

            {#if downloadError}
              <div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-full break-words">
                <span class="font-semibold">Error al descargar:</span> {downloadError}
              </div>
            {/if}

            <button
              onclick={handleDownload}
              disabled={isDownloading}
              class="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25"
            >
              {#if isDownloading}
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>Descargando...</span>
              {:else}
                <Download class="h-4 w-4" />
                <span>Descargar</span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full">
    <div class="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold leading-none tracking-tight mb-4">Glosario de Configuración de Edge</h3>
        <p class="text-sm text-muted-foreground leading-relaxed break-words mb-6">
          A continuación se detallan los significados de cada uno de los campos utilizados en los formularios de creación y configuración de los dispositivos Edge.
        </p>

        <div class="space-y-6">
          <!-- Metadatos -->
          <div>
            <h4 class="text-sm font-bold text-primary uppercase tracking-wider mb-3">Metadatos</h4>
            <ul class="space-y-2.5 text-sm text-card-foreground">
              <li><strong class="font-semibold">ID del Edge:</strong> Identificador único del dispositivo Edge.</li>
              <li><strong class="font-semibold">Nombre:</strong> Identificación informal para facilitar el reconocimiento de los dispositivos.</li>
              <li><strong class="font-semibold">Ubicación:</strong> Descripción de la ubicación donde está el dispositivo físicamente.</li>
            </ul>
          </div>
          
          <hr class="border-border/50" />

          <!-- Conectividad -->
          <div>
            <h4 class="text-sm font-bold text-primary uppercase tracking-wider mb-3">Conectividad</h4>
            <ul class="space-y-2.5 text-sm text-card-foreground">
              <li><strong class="font-semibold">CN del certificado de router:</strong> Dominio del servidor al que se conecta el dispositivo Edge.</li>
              <li><strong class="font-semibold">Host Server:</strong> Dirección IP o Hostname del servidor al que se conecta el dispositivo Edge.</li>
              <li><strong class="font-semibold">Puerto:</strong> Puerto para la conexión gRPC con el servidor (ej: 50051).</li>
              <li><strong class="font-semibold">Host Local:</strong> Dirección IP o Hostname local del dispositivo Edge.</li>
            </ul>
          </div>

          <hr class="border-border/50" />

          <!-- Datos -->
          <div>
            <h4 class="text-sm font-bold text-primary uppercase tracking-wider mb-3">Datos</h4>
            <ul class="space-y-2.5 text-sm text-card-foreground">
              <li><strong class="font-semibold">Ruta Base de Datos:</strong> Path para la ubicación de la base de datos en el almacenamiento del dispositivo Edge.</li>
              <li><strong class="font-semibold">Tamaño Buffer:</strong> Tamaño máximo del buffer de procesamiento batch.</li>
              <li><strong class="font-semibold">Log:</strong> Nivel de log del dispositivo Edge (DEBUG, INFO, WARN).</li>
            </ul>
          </div>

          <hr class="border-border/50" />

          <!-- Protocolo -->
          <div>
            <h4 class="text-sm font-bold text-primary uppercase tracking-wider mb-3">Protocolo</h4>
            <ul class="space-y-2.5 text-sm text-card-foreground">
              <li><strong class="font-semibold">Número máximo de intentos en handshake (1-14):</strong> Número máximo de intentos que hará el Edge para sincronizarse en el handshake con los dispositivos Hub.</li>
              <li><strong class="font-semibold">Frecuencia de envío de mensajes en cualquier fase (seg):</strong> Cada cuánto tiempo en segundos deben enviarse mensajes cuando el protocolo se encuentra en alguna de las fases.</li>
              <li><strong class="font-semibold">Frecuencia de envío de mensajes en safe mode (seg):</strong> Cada cuánto tiempo en segundos deben enviarse mensajes en safe mode.</li>
              <li><strong class="font-semibold">Tiempo límite de espera en handshake (15-60seg):</strong> Tiempo límite que el Edge espera para recibir las confirmaciones tras enviar un mensaje de HandshakeToHub al entrar en estados relacionados al handshake.</li>
              <li><strong class="font-semibold">Tiempo límite de duración de cualquier fase (30-120seg):</strong> Es el tiempo máximo asignado para que las fases activas (Alert, Data, Monitor) concluyan. El sistema espera recibir confirmaciones de colas vacías de al menos el 80% de los hubs dentro de este límite de tiempo antes de dar por expirada la fase.</li>
              <li><strong class="font-semibold">Tiempo límite de duración del modo safe mode (120-300seg):</strong> Es el tiempo máximo asignado para que el safe mode concluya. El sistema espera recibir confirmaciones de colas vacías de al menos el 70% de los hubs dentro de este límite de tiempo antes de dar por expirado el modo.</li>
            </ul>
          </div>

          <hr class="border-border/50" />

          <!-- Heartbeat -->
          <div>
            <h4 class="text-sm font-bold text-primary uppercase tracking-wider mb-3">Heartbeat</h4>
            <ul class="space-y-2.5 text-sm text-card-foreground">
              <li><strong class="font-semibold">Heartbeat en balance mode (10-40seg):</strong> Cada cuánto tiempo el Edge envía el mensaje heartbeat a los hubs en estado de balanceo. Debe configurar este mismo tiempo en los dispositivos hubs a través de la interfaz de configuración.</li>
              <li><strong class="font-semibold">Heartbeat en normal (30-60seg):</strong> Cada cuánto tiempo el Edge envía el mensaje heartbeat a los hubs en estado normal. Debe configurar este mismo tiempo en los dispositivos hubs a través de la interfaz de configuración.</li>
              <li><strong class="font-semibold">Heartbeat en safe mode (40-80seg):</strong> Cada cuánto tiempo el Edge envía el mensaje heartbeat a los hubs en safe mode. Debe configurar este mismo tiempo en los dispositivos hubs a través de la interfaz de configuración.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
