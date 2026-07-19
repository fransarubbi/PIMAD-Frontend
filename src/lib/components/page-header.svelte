<script lang="ts">
  let { title, description }: { title: string; description?: string } = $props();
</script>

<!-- Complete redesign with modern styling and animations -->
<div class="flex items-start justify-between animate-slide-in">
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-foreground 
               bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
      {title}
    </h1>
    {#if description}
      <p class="mt-1.5 text-sm text-muted-foreground max-w-xl">{description}</p>
    {/if}
  </div>
</div>

