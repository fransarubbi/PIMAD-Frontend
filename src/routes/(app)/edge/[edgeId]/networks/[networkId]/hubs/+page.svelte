<script lang="ts">
    import { onMount } from "svelte";
    import { edges } from "$lib/stores/edges";
    import { networks } from "$lib/stores/networks";
    import { hubs, hubsLoading, hubsError, hubsSaving, hubsActions, hubStates } from "$lib/stores/hubs";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PageHeader from "$lib/components/page-header.svelte";
    import EmptyState from "$lib/components/empty-state.svelte";
    import Modal from "$lib/components/modal.svelte";
    import StatusBadge from "$lib/components/status-badge.svelte";

    import Cpu from "lucide-svelte/icons/cpu";
    import Eye from "lucide-svelte/icons/eye";
    import Settings from "lucide-svelte/icons/settings";
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import Loader from "lucide-svelte/icons/loader";
    import AlertCircle from "lucide-svelte/icons/alert-circle";
    import CheckCircle from "lucide-svelte/icons/check-circle";

    import type { HubSettings } from "$lib/types";

    /** Maps an SSE hub state string to the key expected by StatusBadge. */
    function hubStatusKey(hubId: string): string {
        const raw = $hubStates[hubId];
        switch (raw) {
            case 'normal':  return 'Normal';
            case 'balance': return 'Balance';
            case 'safe':    return 'SafeMode';
            default:        return 'Inactive';
        }
    }

    let edgeId = $derived($page.params.edgeId);
    let networkId = $derived($page.params.networkId);

    // Derive current edge name from the edges store (already loaded)
    let currentEdge = $derived($edges.find((e) => e.edgeId === edgeId));
    // Derive current network name from the networks store (already loaded if coming from networks page)
    let currentNetwork = $derived($networks.find((n) => n.networkId === networkId));

    onMount(() => {
        if (networkId) {
            hubsActions.load(networkId);
        }
        return () => hubsActions.clear();
    });

    function goBack() {
        goto(`/edge/${edgeId}/networks`);
    }

    // -- Info Modal --
    let showInfoModal = $state(false);
    let selectedHub = $state<HubSettings | null>(null);

    function viewHubInfo(hub: HubSettings) {
        selectedHub = hub;
        showInfoModal = true;
    }

    // -- Edit / Settings Modal --
    let showEditModal = $state(false);
    let saveSuccess = $state(false);

    let formHub = $state<HubSettings>({
        hubId: "",
        deviceName: "",
        wifiSsid: "",
        wifiPassword: "",
        mqttUri: "",
        sample: 5,
        energyMode: 1,
        networkId: "",
    });

    function openEditModal(hub: HubSettings) {
        formHub = { ...hub };
        saveSuccess = false;
        showEditModal = true;
    }

    async function saveHub() {
        if (!formHub.hubId) return;
        saveSuccess = false;
        try {
            await hubsActions.updateSettings(formHub.hubId, formHub);
            saveSuccess = true;
            setTimeout(() => {
                showEditModal = false;
                saveSuccess = false;
            }, 1200);
        } catch {
            // error displayed via $hubsError
        }
    }
</script>

<div class="space-y-6">
    {#if networkId}
        <div class="flex items-center gap-4">
            <button
                onclick={goBack}
                class="flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:gap-3 group"
            >
                <ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver a Redes ({currentEdge?.name ?? edgeId})
            </button>
        </div>

        <PageHeader
            title={`Hubs de la red: ${currentNetwork?.name ?? networkId}`}
            description="Gestiona y configura los hubs de esta familia de sensores"
        />

        <div class="card-interactive p-6 animate-fade-in">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold text-card-foreground">Hubs Activos</h3>
                    <p class="text-sm text-muted-foreground mt-1">
                        {$hubs.length} dispositivos encontrados
                    </p>
                </div>
            </div>
        </div>

        {#if $hubsLoading}
            <div class="flex items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader class="h-6 w-6 animate-spin" />
                <span class="text-sm">Cargando hubs...</span>
            </div>
        {:else if $hubs.length === 0}
            <EmptyState
                icon={Cpu}
                title="Sin dispositivos Hub"
                description="Esta red aún no tiene Hubs asignados. Contacta a un administrador para provisionar uno."
                actionLabel="Volver a Redes"
                onAction={goBack}
            />
        {:else}
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {#each $hubs as hub}
                    <div class="card-interactive group p-5 flex flex-col h-full">
                        <div class="flex items-start justify-between">
                            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                                <Cpu class="h-6 w-6 text-primary" />
                            </div>
                            {#if $hubsSaving === hub.hubId}
                                <span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 border border-warning/20 px-2.5 py-1 text-xs font-semibold text-warning">
                                    <Loader class="h-3 w-3 animate-spin" />
                                    Enviando…
                                </span>
                            {:else}
                                <StatusBadge status={hubStatusKey(hub.hubId)} />
                            {/if}
                        </div>

                        <div class="mt-4 flex-1">
                            <h4 class="text-2xl font-bold tracking-tight text-card-foreground">
                                {hub.hubId}
                            </h4>
                            <div class="mt-2 space-y-1">
                                <p class="text-sm text-card-foreground/80">{hub.deviceName}</p>
                                <div class={`inline-block mt-2 px-2.5 py-0.5 rounded-full border ${
                                    hub.energyMode === 0 ? 'bg-success/10 border-success/20 text-success' :
                                    hub.energyMode === 1 ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                    hub.energyMode === 2 ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                                    'bg-accent/10 border-accent/20 text-accent'
                                }`}>
                                    <span class="text-[10px] font-medium">Modo Energía: {hub.energyMode === 0 ? 'Bajo consumo' : hub.energyMode === 1 ? 'Balanceado' : hub.energyMode === 2 ? 'Performance' : hub.energyMode}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-6 flex gap-2 border-t border-border pt-4">
                            <button
                                onclick={() => viewHubInfo(hub)}
                                class="btn-secondary flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium"
                                aria-label="Ver información del Hub"
                            >
                                <Eye class="h-4 w-4" />
                                Ver Info
                            </button>
                            <button
                                onclick={() => openEditModal(hub)}
                                class="btn-secondary flex items-center justify-center rounded-lg p-2.5 border border-border"
                                aria-label="Configurar Hub"
                            >
                                <Settings class="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <div class="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>Red o Edge no encontrados.</p>
            <button onclick={() => goto('/edge')} class="mt-4 btn-secondary rounded-lg px-4 py-2">Volver a Inicio</button>
        </div>
    {/if}
</div>

<!-- Info Modal -->
<Modal
    open={showInfoModal}
    title="Información del Hub"
    onClose={() => (showInfoModal = false)}
>
    {#if selectedHub}
        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Hub ID</span>
                    <span class="font-medium font-mono break-all">{selectedHub.hubId}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Nombre</span>
                    <span class="font-medium break-words">{selectedHub.deviceName}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">WIFI SSID</span>
                    <span class="font-medium break-all">{selectedHub.wifiSsid}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">WIFI Contraseña</span>
                    <span class="font-medium blur-sm hover:blur-none transition-all cursor-pointer font-mono break-all">{selectedHub.wifiPassword || '********'}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3 sm:col-span-2">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">MQTT URI</span>
                    <span class="font-medium font-mono break-all">{selectedHub.mqttUri}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Sample (min)</span>
                    <span class="font-medium">{selectedHub.sample}</span>
                </div>
                <div class="bg-card/50 border border-border rounded-xl p-3">
                    <span class="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Modo Energía</span>
                    <span class="font-medium">{selectedHub.energyMode === 0 ? 'Bajo consumo' : selectedHub.energyMode === 1 ? 'Balanceado' : selectedHub.energyMode === 2 ? 'Performance' : selectedHub.energyMode}</span>
                </div>
            </div>

            <div class="pt-4 flex justify-end">
                <button onclick={() => (showInfoModal = false)} class="btn-primary px-5 py-2.5 rounded-xl text-sm">Cerrar</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Edit / Settings Modal -->
<Modal
    open={showEditModal}
    title={`Configurando Hub: ${formHub.hubId}`}
    onClose={() => (showEditModal = false)}
>
    <form onsubmit={(e) => { e.preventDefault(); saveHub(); }} class="space-y-4 px-1">

        {#if $hubsError}
            <div class="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertCircle class="h-3.5 w-3.5 shrink-0" />
                {$hubsError}
            </div>
        {/if}

        {#if saveSuccess}
            <div class="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success">
                <CheckCircle class="h-3.5 w-3.5 shrink-0" />
                Configuración enviada — el hardware la procesará en breve.
            </div>
        {/if}

        <div class="space-y-1.5">
            <label for="hub-name" class="block text-sm font-medium text-card-foreground">Nombre del dispositivo</label>
            <input id="hub-name" type="text" bind:value={formHub.deviceName} class="input-field" required placeholder="Sensor Temperatura Planta 1" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <label for="hub-ssid" class="block text-sm font-medium text-card-foreground">WIFI SSID</label>
                <input id="hub-ssid" type="text" bind:value={formHub.wifiSsid} class="input-field" required placeholder="IoT_Network_5G" />
            </div>
            <div class="space-y-1.5">
                <label for="hub-password" class="block text-sm font-medium text-card-foreground">WIFI Contraseña</label>
                <input id="hub-password" type="text" bind:value={formHub.wifiPassword} class="input-field" required placeholder="***********" />
            </div>
        </div>

        <div class="space-y-1.5">
            <label for="hub-mqtt" class="block text-sm font-medium text-card-foreground">MQTT URI</label>
            <input id="hub-mqtt" type="text" bind:value={formHub.mqttUri} class="input-field font-mono" required placeholder="mqtt://broker.hivemq.com:1883" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <label for="hub-sample" class="block text-sm font-medium text-card-foreground">Sample (min)</label>
                <input id="hub-sample" type="number" bind:value={formHub.sample} class="input-field" required placeholder="5" />
            </div>
            <div class="space-y-1.5">
                <label for="hub-energy" class="block text-sm font-medium text-card-foreground">Modo Energía</label>
                <select id="hub-energy" bind:value={formHub.energyMode} class="input-field">
                    <option value={0}>Bajo consumo</option>
                    <option value={1}>Balanceado</option>
                    <option value={2}>Performance</option>
                </select>
            </div>
        </div>

        <p class="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
            <strong>Nota:</strong> La respuesta 202 indica que la solicitud fue aceptada. El servidor esperará hasta 5 minutos la confirmación del hardware.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 pt-4 pb-1">
            <button
                type="button"
                onclick={() => (showEditModal = false)}
                class="btn-secondary flex-1 rounded-xl py-3 text-sm font-medium"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={$hubsSaving === formHub.hubId}
                class="btn-primary flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {#if $hubsSaving === formHub.hubId}
                    <Loader class="h-4 w-4 animate-spin" />
                    Enviando…
                {:else}
                    Enviar al Hardware
                {/if}
            </button>
        </div>
    </form>
</Modal>
