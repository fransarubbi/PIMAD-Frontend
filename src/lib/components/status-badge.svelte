<script lang="ts">
  let { 
    status, 
    size = 'sm' 
  }: { 
    status: string;
    size?: 'sm' | 'md';
  } = $props();

  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string; pulse?: boolean }> = {
    online:     { bg: 'bg-success/15',      text: 'text-success',          dot: 'bg-success',          label: 'En línea',      pulse: true },
    offline:    { bg: 'bg-destructive/15',  text: 'text-destructive',      dot: 'bg-destructive',      label: 'Desconectado',  pulse: true },
    warning:    { bg: 'bg-warning/15',      text: 'text-warning',          dot: 'bg-warning',          label: 'Advertencia',   pulse: true },
    active:     { bg: 'bg-success/15',      text: 'text-success',          dot: 'bg-success',          label: 'Activo',        pulse: true },
    inactive:   { bg: 'bg-muted',           text: 'text-muted-foreground', dot: 'bg-muted-foreground', label: 'Inactivo',      pulse: true },
    valid:      { bg: 'bg-success/15',      text: 'text-success',          dot: 'bg-success',          label: 'Válido',        pulse: true },
    expired:    { bg: 'bg-destructive/15',  text: 'text-destructive',      dot: 'bg-destructive',      label: 'Expirado',      pulse: true },
    revoked:    { bg: 'bg-warning/15',      text: 'text-warning',          dot: 'bg-warning',          label: 'Revocado',      pulse: true },
    available:  { bg: 'bg-success/15',      text: 'text-success',          dot: 'bg-success',          label: 'Disponible',    pulse: true },
    deploying:  { bg: 'bg-primary/15',      text: 'text-primary',          dot: 'bg-primary',          label: 'Desplegando',   pulse: true },
    deprecated: { bg: 'bg-muted',           text: 'text-muted-foreground', dot: 'bg-muted-foreground', label: 'Obsoleto',      pulse: true },
    Inactive:   { bg: 'bg-muted',           text: 'text-muted-foreground', dot: 'bg-muted-foreground', label: 'Inactivo',      pulse: true },
    Normal:     { bg: 'bg-success/15',      text: 'text-success',          dot: 'bg-success',          label: 'Normal',        pulse: true },
    Balance:    { bg: 'bg-warning/15',      text: 'text-warning',          dot: 'bg-warning',          label: 'Balanceo',      pulse: true },
    SafeMode:   { bg: 'bg-orange-500/15',   text: 'text-orange-500',       dot: 'bg-orange-500',       label: 'Safe Mode',     pulse: true },
  };

  // Convert statusConfig keys to lowercase for resilient matching
  const lowerConfig = Object.fromEntries(
    Object.entries(statusConfig).map(([k, v]) => [k.toLowerCase(), v])
  );

  const config = $derived(
    statusConfig[status] || 
    lowerConfig[(status || '').toString().toLowerCase()] || 
    statusConfig.offline
  );
  const sizeClasses = $derived(size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm');
</script>

<!-- Enhanced badge with pulse animation for active states -->
<span class="inline-flex items-center gap-1.5 rounded-full {config.bg} {config.text} {sizeClasses} font-medium
             transition-all duration-200 hover:scale-105">
  <span class="relative flex h-2 w-2">
    {#if config.pulse}
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full {config.dot} opacity-75"></span>
    {/if}
    <span class="relative inline-flex h-2 w-2 rounded-full {config.dot}"></span>
  </span>
  {config.label}
</span>
