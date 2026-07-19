<script lang="ts">
  import { page } from "$app/stores";
  import { auth, fullName, initials } from "$lib/stores/auth.svelte";
  import { theme } from "$lib/stores/theme";
  import ThemeToggle from "./theme-toggle.svelte";
  import logoSvg from "../../logo/dirinfo_logo.svg";
  import {
    Server,
    ShieldCheck,
    Bell,
    LogOut,
    ChevronRight,
    HelpCircle,
    Settings,
    Sun,
    Moon,
    X,
  } from "lucide-svelte";

  const navItems: { id: string; label: string; icon: typeof Server }[] = [
    { id: "edge", label: "Edge", icon: Server },
    { id: "certificates", label: "Certificados", icon: ShieldCheck },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "help", label: "Ayuda", icon: HelpCircle },
  ];

  let { onLogout }: { onLogout?: () => void } = $props();

  let showProfileModal = $state(false);
</script>

<!-- Desktop Sidebar (Hidden on mobile) -->
<aside
  class="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col
              bg-sidebar border-r border-sidebar-border
              shadow-xl shadow-black/5"
>
  <!-- Logo -->
  <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
    <div
      class="flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-primary/20 border border-primary/20"
    >
      <img src={logoSvg} alt="Logo UNSL" class="h-full w-full object-contain" />
    </div>
    <div>
      <span class="text-lg font-bold text-sidebar-foreground">Manager</span>
      <span
        class="block text-[10px] font-medium text-primary uppercase tracking-wider"
        >Dashboard</span
      >
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto p-4">
    <p
      class="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
    >
      Panel Principal
    </p>
    <div class="space-y-1">
      {#each navItems as item, i}
        <a
          href="/{item.id}"
          class="stagger-item group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium
                 transition-all duration-200 ease-out
                 {$page.url.pathname.startsWith('/' + item.id)
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}"
          style="animation-delay: {i * 0.05}s"
        >
          <div class="relative">
            <item.icon
              class="h-4.5 w-4.5 transition-transform duration-200 {$page.url.pathname.startsWith('/' + item.id)
                ? ''
                : 'group-hover:scale-110'}"
            />
          </div>
          <span class="flex-1 text-left">{item.label}</span>
          {#if $page.url.pathname.startsWith('/' + item.id)}
            <ChevronRight class="h-4 w-4 animate-slide-in" />
          {/if}
        </a>
      {/each}
    </div>
  </nav>

  <!-- User Section -->
  <div class="border-t border-sidebar-border p-4 space-y-3">
    <!-- User card -->
    <div
      class="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3
                border border-transparent transition-all duration-200
                hover:border-primary/20 hover:bg-sidebar-accent"
    >
      <div
        class="relative flex h-10 w-10 items-center justify-center rounded-xl
                  bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold
                  shadow-md shadow-primary/20"
      >
        {auth.profile ? initials(auth.profile) : 'U'}
      </div>
      <div class="flex-1 min-w-0">
        <p class="truncate text-sm font-semibold text-sidebar-foreground">
          {auth.profile ? fullName(auth.profile) : 'Usuario'}
        </p>
        <p class="truncate text-xs text-muted-foreground">
          {auth.profile?.email || 'usuario@email.com'}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <ThemeToggle />
      <button
        onclick={() => onLogout?.()}
        class="flex flex-1 items-center justify-center gap-2 rounded-xl
               bg-secondary border border-border px-3 py-2.5
               text-sm font-medium text-foreground
               transition-all duration-200 ease-out
               hover:bg-destructive hover:text-destructive-foreground hover:border-destructive
               hover:shadow-lg hover:shadow-destructive/20
               active:scale-[0.98]"
      >
        <LogOut
          class="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        <span>Cerrar sesión</span>
      </button>
    </div>
  </div>
</aside>

<!-- Mobile Bottom Navigation Bar (Visible only on mobile) -->
<nav
  class="flex md:hidden fixed bottom-0 left-0 right-0 z-50 h-16
         bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl
         px-2 items-center justify-around"
>
  <a
    href="/edge"
    class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all {$page.url.pathname.startsWith('/edge') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'}"
  >
    <Server class="h-5 w-5 mb-1" />
    <span class="text-[11px]">Edge</span>
  </a>
  <a
    href="/notifications"
    class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all {$page.url.pathname.startsWith('/notifications') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'}"
  >
    <div class="relative">
      <Bell class="h-5 w-5 mb-1" />
    </div>
    <span class="text-[11px]">Notificaciones</span>
  </a>
  <a
    href="/help"
    class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all {$page.url.pathname.startsWith('/help') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'}"
  >
    <HelpCircle class="h-5 w-5 mb-1" />
    <span class="text-[11px]">Ayuda</span>
  </a>
  <button
    type="button"
    onclick={() => (showProfileModal = true)}
    class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all {showProfileModal ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'}"
  >
    <Settings class="h-5 w-5 mb-1" />
    <span class="text-[11px]">Perfil</span>
  </button>
</nav>

<!-- Profile Modal / Drawer for Mobile -->
{#if showProfileModal}
  <!-- Backdrop -->
  <div
    role="button"
    tabindex="0"
    aria-label="Cerrar modal de perfil"
    onclick={() => (showProfileModal = false)}
    onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showProfileModal = false)}
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
  ></div>

  <!-- Profile Drawer / Modal -->
  <div
    class="fixed inset-x-4 bottom-20 z-50 rounded-3xl border border-border bg-card p-6 shadow-2xl md:hidden animate-slide-up max-h-[80vh] overflow-y-auto"
  >
    <!-- Top Header: Mi Perfil -->
    <div class="flex items-center justify-between border-b border-border pb-4">
      <div class="flex items-center gap-2">
        <Settings class="h-5 w-5 text-primary" />
        <h2 class="text-lg font-bold text-card-foreground">Mi Perfil</h2>
      </div>
      <button
        onclick={() => (showProfileModal = false)}
        aria-label="Cerrar"
        class="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- User Info -->
    <div class="mt-6 flex flex-col items-center text-center">
      <!-- Circle photo -->
      <div
        class="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/30 border-2 border-primary/20"
      >
        {auth.profile ? initials(auth.profile) : 'U'}
      </div>
      <p class="mt-4 text-lg font-bold text-card-foreground">
        {auth.profile ? fullName(auth.profile) : 'Usuario'}
      </p>
      <p class="text-xs text-muted-foreground mt-0.5">
        {auth.profile?.email || 'usuario@email.com'}
      </p>
    </div>

    <!-- Mobile Theme Toggle Switch -->
    <div class="mt-6 rounded-2xl bg-secondary/60 p-4 border border-border">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          {#if $theme === 'dark'}
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"
            >
              <Sun class="h-5 w-5" />
            </div>
          {:else}
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <Moon class="h-5 w-5" />
            </div>
          {/if}
          <div class="text-left">
            <p class="text-sm font-semibold text-foreground">Modo de visualización</p>
            <p class="text-xs text-muted-foreground">
              {$theme === 'dark' ? 'Tema Oscuro activado' : 'Tema Claro activado'}
            </p>
          </div>
        </div>

        <!-- Rectangular Switch Button -->
        <button
          type="button"
          role="switch"
          aria-checked={$theme === 'dark'}
          onclick={() => theme.toggle()}
          class="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {$theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}"
        >
          <span
            class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {$theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}"
          >
            <span
              class="flex h-full w-full items-center justify-center text-[10px] font-bold {$theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}"
            >
              {#if $theme === 'dark'}
                🌙
              {:else}
                ☀️
              {/if}
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="mt-6">
      <button
        onclick={() => { showProfileModal = false; onLogout?.(); }}
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 py-3.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-white active:scale-[0.98]"
      >
        <LogOut class="h-4 w-4" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  </div>
{/if}

