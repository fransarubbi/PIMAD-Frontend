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

  <div class="max-w-2xl w-full">
    <div class="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <div class="flex flex-col sm:flex-row items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText class="h-6 w-6" />
          </div>
          <div class="space-y-4 flex-1 min-w-0">
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight max-w-full break-words">Manual del Sistema</h3>
              <p class="mt-2 text-sm text-muted-foreground leading-relaxed max-w-prose break-words">
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
</div>
