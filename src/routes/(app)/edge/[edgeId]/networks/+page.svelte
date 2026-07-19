<script lang="ts">
    import { onMount } from "svelte";
    import { edges } from "$lib/stores/edges";
    import { networks, networksLoading, networksError, networksActions } from "$lib/stores/networks";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PageHeader from "$lib/components/page-header.svelte";
    import EmptyState from "$lib/components/empty-state.svelte";
    import Modal from "$lib/components/modal.svelte";
    import { updateNetworkFirmware } from "$lib/services/api";
    import Wifi from "lucide-svelte/icons/wifi";
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import Plus from "lucide-svelte/icons/plus";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import UploadCloud from "lucide-svelte/icons/upload-cloud";
    import Loader from "lucide-svelte/icons/loader";
    import AlertCircle from "lucide-svelte/icons/alert-circle";
    import type { NetworkSummary } from "$lib/types";
    import ToggleLeft from "lucide-svelte/icons/toggle-left";
    import ToggleRight from "lucide-svelte/icons/toggle-right";

    let edgeId = $derived($page.params.edgeId);
    let currentEdge = $derived($edges.find((e) => e.edgeId === edgeId));

    // Load networks whenever the edgeId changes
    $effect(() => {
        if (edgeId) {
            networksActions.load(edgeId);
        }
        return () => networksActions.clear();
    });

    // Create Modal
    let showCreateNetworkModal = $state(false);
    let newNetworkId = $state("");
    let newNetworkName = $state("");
    let newNetworkDescription = $state("");
    let newNetworkLocation = $state("");
    let actionError = $state<string | null>(null);

    // Delete Network Modal
    let showDeleteNetworkModal = $state(false);
    let targetDeleteNetwork = $state<NetworkSummary | null>(null);

    // Firmware Update Modal
    let showFirmwareModal = $state(false);
    let firmwareTarget = $state<NetworkSummary | null>(null);
    let firmwareLoading = $state(false);
    let firmwareError = $state<string | null>(null);

    function goBack() {
        goto("/edge");
    }

    async function createNetwork() {
        if (!edgeId || !newNetworkId.trim() || !newNetworkName.trim()) return;
        actionError = null;
        try {
            await networksActions.add(
                { 
                    networkId: newNetworkId, 
                    name: newNetworkName, 
                    description: newNetworkDescription,
                    location: newNetworkLocation,
                    edgeId 
                },
                edgeId,
            );
            newNetworkId = "";
            newNetworkName = "";
            newNetworkDescription = "";
            newNetworkLocation = "";
            showCreateNetworkModal = false;
        } catch (err) {
            actionError = err instanceof Error ? err.message : String(err);
        }
    }

    async function toggleNetwork(network: NetworkSummary) {
        actionError = null;
        try {
            await networksActions.toggle(network.networkId, edgeId as string);
        } catch (err) {
            actionError = err instanceof Error ? err.message : String(err);
        }
    }

    function deleteNetworkPrompt(network: NetworkSummary) {
        targetDeleteNetwork = network;
        actionError = null;
        showDeleteNetworkModal = true;
    }

    async function confirmDeleteNetwork() {
        if (!targetDeleteNetwork) return;
        actionError = null;
        try {
            await networksActions.remove(targetDeleteNetwork.networkId);
            showDeleteNetworkModal = false;
            targetDeleteNetwork = null;
        } catch (err) {
            actionError = err instanceof Error ? err.message : String(err);
        }
    }

    async function triggerFirmwareUpdate() {
        if (!firmwareTarget || !edgeId) return;
        firmwareLoading = true;
        firmwareError = null;
        try {
            await updateNetworkFirmware(firmwareTarget.networkId, edgeId);
            showFirmwareModal = false;
            firmwareTarget = null;
        } catch (err) {
            firmwareError = err instanceof Error ? err.message : String(err);
        } finally {
            firmwareLoading = false;
        }
    }
</script>

<div class="space-y-6">
    {#if edgeId}
        <div class="flex items-center gap-4">
            <button
                onclick={goBack}
                class="flex items-center gap-2 text-sm text-muted-foreground
                 transition-all duration-200 hover:text-foreground hover:gap-3
                 group"
            >
                <ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver a Edge Devices
            </button>
        </div>

        <PageHeader
            title="Redes"
            description={`Gestiona las redes asociadas al dispositivo ${currentEdge?.name ?? edgeId}`}
        />

        <div class="card-interactive p-6 animate-fade-in">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold text-card-foreground">Redes Activas</h3>
                    <p class="text-sm text-muted-foreground mt-1">
                        {$networks.length} redes configuradas
                    </p>
                </div>
                <button
                    onclick={() => (showCreateNetworkModal = true)}
                    class="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
                >
                    <Plus class="h-4 w-4" />
                    Nueva Red
                </button>
            </div>
        </div>

        {#if $networksLoading}
            <div class="flex items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader class="h-6 w-6 animate-spin" />
                <span class="text-sm">Cargando redes...</span>
            </div>
        {:else if $networks.length === 0}
            <EmptyState
                icon={Wifi}
                title="Sin redes configuradas"
                description="Este Edge no tiene redes asociadas. Crea una nueva red para comenzar."
                actionLabel="Crear Red"
                onAction={() => (showCreateNetworkModal = true)}
            />
        {:else}
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {#each $networks as network}
                    <div class="card-interactive group p-5 flex flex-col h-full">
                        <div class="flex items-start justify-between">
                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                                <Wifi class="h-5 w-5 text-accent" />
                            </div>
                            <!-- Active indicator -->
                            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold {network.active ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground border border-border'}">
                                <span class="relative flex h-1.5 w-1.5">
                                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full {network.active ? 'bg-success' : 'bg-muted-foreground'} opacity-75"></span>
                                    <span class="relative inline-flex h-1.5 w-1.5 rounded-full {network.active ? 'bg-success' : 'bg-muted-foreground'}"></span>
                                </span>
                                {network.active ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>

                        <div class="flex-1">
                            <h4 class="mt-4 font-semibold text-lg text-card-foreground">
                                {network.name}
                            </h4>
                            <p class="text-xs text-muted-foreground font-mono mt-0.5">
                                ID: {network.networkId}
                            </p>

                            <div class="mt-4 space-y-2 text-sm bg-muted/40 p-3 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <span class="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Hubs</span>
                                    <div class="flex items-center justify-center bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">
                                        {network.hubCount}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 border-t border-border pt-4">
                            <button
                                onclick={() => goto(`/edge/${edgeId}/networks/${network.networkId}/hubs`)}
                                class="w-full btn-primary flex flex-1 items-center justify-between gap-1.5 rounded-lg py-2.5 px-4 text-xs font-semibold mb-2"
                            >
                                <span>Ver Hubs</span>
                                <ArrowRight class="h-4 w-4" />
                            </button>
                            <button
                                onclick={() => { firmwareTarget = network; showFirmwareModal = true; }}
                                class="w-full flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs mb-2 transition-all duration-200 ease-out active:scale-[0.98] font-medium bg-black border border-white text-white shadow-[0_0_8px_rgba(255,255,255,0.4)] hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:bg-neutral-900"
                            >
                                <UploadCloud class="h-4 w-4" />
                                Actualizar Firmware
                            </button>
                            <div class="flex gap-2">
                                <!-- Toggle button -->
                                <button
                                    onclick={() => toggleNetwork(network)}
                                    title={network.active ? 'Desactivar red' : 'Activar red'}
                                    class="btn-secondary flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs"
                                >
                                    {#if network.active}
                                        <ToggleRight class="h-4 w-4 text-success" />
                                        Desactivar
                                    {:else}
                                        <ToggleLeft class="h-4 w-4" />
                                        Activar
                                    {/if}
                                </button>
                                <button
                                    onclick={() => deleteNetworkPrompt(network)}
                                    class="flex flex-none items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:shadow-lg hover:shadow-destructive/20"
                                >
                                    <Trash2 class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <div class="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>Dispositivo Edge no encontrado o no seleccionado.</p>
            <button onclick={goBack} class="mt-4 btn-secondary rounded-lg px-4 py-2">Volver</button>
        </div>
    {/if}
</div>

<!-- Create Network Modal -->
<Modal
    open={showCreateNetworkModal}
    title="Añadir Nueva Red"
    onClose={() => (showCreateNetworkModal = false)}
>
    <form onsubmit={(e) => { e.preventDefault(); createNetwork(); }} class="space-y-4 px-1">
        <div class="space-y-1.5">
            <label for="new-network-id" class="block text-sm font-medium text-card-foreground">ID de la Red</label>
            <input id="new-network-id" type="text" bind:value={newNetworkId} class="input-field font-mono" required placeholder="RED-001" />
        </div>

        <div class="space-y-1.5">
            <label for="new-network-name" class="block text-sm font-medium text-card-foreground">Nombre</label>
            <input id="new-network-name" type="text" bind:value={newNetworkName} class="input-field" required placeholder="Red de Sensores Planta A" />
        </div>

        <div class="space-y-1.5">
            <label for="new-network-desc" class="block text-sm font-medium text-card-foreground">Descripción</label>
            <input id="new-network-desc" type="text" bind:value={newNetworkDescription} class="input-field" placeholder="Red encargada de..." />
        </div>

        <div class="space-y-1.5">
            <label for="new-network-loc" class="block text-sm font-medium text-card-foreground">Ubicación</label>
            <input id="new-network-loc" type="text" bind:value={newNetworkLocation} class="input-field" placeholder="Planta Baja" />
        </div>

        {#if actionError}
            <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertCircle class="h-3.5 w-3.5 shrink-0" />
                {actionError}
            </div>
        {/if}

        <div class="flex gap-3 pt-6 pb-2">
            <button type="button" onclick={() => (showCreateNetworkModal = false)} class="btn-secondary flex-1 rounded-xl py-3 text-sm font-medium">
                Cancelar
            </button>
            <button type="submit" disabled={$networksLoading} class="btn-primary flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {#if $networksLoading}
                    <Loader class="h-4 w-4 animate-spin" />
                {/if}
                Crear Red
            </button>
        </div>
    </form>
</Modal>

<!-- Firmware Update Modal -->
<Modal
    open={showFirmwareModal}
    title="Actualización de Firmware"
    onClose={() => { if (!firmwareLoading) { showFirmwareModal = false; firmwareError = null; } }}
>
    {#if firmwareTarget}
    <div class="space-y-5">
        <div class="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
            <div class="bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-full mb-3">
                <UploadCloud class="h-8 w-8" />
            </div>
            <p class="text-sm font-medium text-blue-700 dark:text-blue-400">Actualización OTA Remota</p>
        </div>

        <p class="text-sm text-card-foreground text-center">
            ¿Quiere actualizar el firmware de los dispositivos Hub de la red <strong class="font-bold underline decoration-blue-500 underline-offset-2">{firmwareTarget.name}</strong>?
        </p>

        <p class="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg border border-border">
            Esta acción enviará la instrucción a {firmwareTarget.hubCount} dispositivo(s). Los equipos se reiniciarán automáticamente si la actualización es exitosa.
        </p>

        {#if firmwareError}
            <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertCircle class="h-3.5 w-3.5 shrink-0" />
                {firmwareError}
            </div>
        {/if}

        <div class="flex gap-3 pt-4">
            <button
                type="button"
                onclick={() => { showFirmwareModal = false; firmwareError = null; }}
                disabled={firmwareLoading}
                class="btn-secondary flex-1 rounded-xl py-3 text-sm font-medium disabled:opacity-60"
            >
                Cancelar
            </button>
            <button
                type="button"
                onclick={triggerFirmwareUpdate}
                disabled={firmwareLoading}
                class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-out active:scale-[0.98] flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {#if firmwareLoading}
                    <Loader class="h-4 w-4 animate-spin" />
                {/if}
                Confirmar
            </button>
        </div>
    </div>
    {/if}
</Modal>

<!-- Delete Network Protection Modal -->
<Modal
  open={showDeleteNetworkModal}
  title="Protección de Borrado"
  onClose={() => (showDeleteNetworkModal = false)}
>
  {#if targetDeleteNetwork}
    <div class="space-y-4 pt-2">
        <div class="flex flex-col items-center justify-center p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
            <div class="bg-destructive text-destructive-foreground p-3 rounded-full mb-3">
                <Trash2 class="h-8 w-8" />
            </div>
            <p class="text-sm font-bold text-destructive">Eliminación Destructiva</p>
        </div>

        <p class="text-card-foreground text-center text-sm px-2">
            ¿Estás seguro que querés eliminar la red <strong class="font-bold underline decoration-destructive underline-offset-2">{targetDeleteNetwork.name}</strong>?
        </p>

        <p class="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg border border-border mx-2">
            Se eliminarán todos sus Hubs asociados de modo irreversible.
        </p>

        {#if actionError}
            <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertCircle class="h-3.5 w-3.5 shrink-0" />
                {actionError}
            </div>
        {/if}

        <div class="flex gap-3 pt-4">
            <button type="button" onclick={() => (showDeleteNetworkModal = false)} class="btn-secondary flex-1 rounded-xl py-3 text-sm font-medium">
                Cancelar
            </button>
            <button type="button" onclick={confirmDeleteNetwork} class="bg-destructive hover:bg-destructive/90 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
                {#if $networksLoading}
                    <Loader class="h-4 w-4 animate-spin" />
                {/if}
                Confirmar
            </button>
        </div>
    </div>
  {/if}
</Modal>
