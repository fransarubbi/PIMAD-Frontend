<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/sidebar.svelte";
  import { logout } from "$lib/stores/auth.svelte";
  import { page } from "$app/stores";
  import { theme } from "$lib/stores/theme";

  let { children } = $props();

  onMount(() => {
    theme.init();
  });

  function handleLogout() {
    logout();
  }
</script>

<!-- Added background gradient and improved layout -->
<div class="min-h-screen bg-background flex flex-col">
  <!-- Subtle background gradient -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden">
    <div
      class="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
    ></div>
  </div>

  <Sidebar onLogout={handleLogout} />

  <main class="relative md:ml-64 min-h-screen p-4 pb-24 md:p-8 flex-1 flex flex-col">
    <div class="mx-auto max-w-7xl w-full animate-fade-in flex-1">
      {#key $page.url.pathname}
        <div class="animate-fade-in">
          {@render children()}
        </div>
      {/key}
    </div>

    <!-- General Footer Watermark -->
    <footer class="mt-12 py-4 text-center text-xs font-medium text-muted-foreground/70 border-t border-border/40">
      Departamento de Informática. UNSL {new Date().getFullYear()}
    </footer>
  </main>
</div>

