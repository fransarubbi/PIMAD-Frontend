<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { login } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import Mail from 'lucide-svelte/icons/mail';
  import Lock from 'lucide-svelte/icons/lock';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Eye from 'lucide-svelte/icons/eye';
  import EyeOff from 'lucide-svelte/icons/eye-off';
  import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
  import WifiOff from 'lucide-svelte/icons/wifi-off';
  import ShieldAlert from 'lucide-svelte/icons/shield-alert';
  import UserX from 'lucide-svelte/icons/user-x';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import logoSvg from '../../../logo/dirinfo_logo.svg';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);

  interface ErrorState {
    type: 'invalid_credentials' | 'user_disabled' | 'profile_not_found' | 'email_not_confirmed' | 'network' | 'unknown';
    message: string;
  }

  let errorState = $state<ErrorState | null>(null);



  /** Map error codes to user-facing messages (never ambiguous). */
  function resolveError(code: string): ErrorState {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return {
          type: 'invalid_credentials',
          message: 'Credenciales incorrectas. Verificá el correo y la contraseña.'
        };
      case 'USER_DISABLED':
        return {
          type: 'user_disabled',
          message: 'Tu cuenta está deshabilitada. Contactá al administrador.'
        };
      case 'PROFILE_NOT_FOUND':
        return {
          type: 'profile_not_found',
          message: 'No se encontró un perfil de usuario asociado a esta cuenta.'
        };
      case 'EMAIL_NOT_CONFIRMED':
        return {
          type: 'email_not_confirmed',
          message: 'El correo electrónico no ha sido confirmado. Revisá tu bandeja de entrada.'
        };
      case 'NETWORK_ERROR':
        return {
          type: 'network',
          message: 'Sin conexión al servidor. Verificá tu red e intentá de nuevo.'
        };
      default:
        return {
          type: 'unknown',
          message: 'Ocurrió un error inesperado. Intentá de nuevo más tarde.'
        };
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      errorState = {
        type: 'invalid_credentials',
        message: 'Por favor, completá todos los campos.'
      };
      return;
    }

    isLoading = true;
    errorState = null;

    try {
      await login(email.trim(), password);
      // NOTE: password is never stored in global state — only email & session go to the store
      goto('/edge');
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : 'UNKNOWN';
      errorState = resolveError(code);
    } finally {
      isLoading = false;
      // Clear the password field for security — never keep it in component state after attempt
      password = '';
    }
  }

  const errorIcons: Record<ErrorState['type'], typeof AlertCircle> = {
    invalid_credentials: AlertCircle,
    user_disabled: UserX,
    profile_not_found: ShieldAlert,
    email_not_confirmed: Mail,
    network: WifiOff,
    unknown: AlertCircle,
  };
</script>

<!-- Login page -->
<div class="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
  <!-- Theme Toggle positioned at bottom left of screen -->
  <div class="fixed bottom-6 left-6 z-50">
    <ThemeToggle />
  </div>

  <!-- Animated background elements -->
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
  </div>

  <!-- Grid pattern overlay -->
  <div class="pointer-events-none absolute inset-0 opacity-[0.02]"
       style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 40px 40px;">
  </div>

  <div class="relative w-full max-w-md animate-scale-in">
    <!-- Login Card -->
    <div class="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/10">
      <!-- Logo -->
      <div class="flex flex-col items-center text-center">
        <div class="relative">
          <div class="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"></div>
          <div class="relative flex h-28 w-28 items-center justify-center rounded-2xl
                      overflow-hidden shadow-lg shadow-primary/20 border border-primary/20">
            <img src={logoSvg} alt="Logo UNSL" class="h-full w-full object-contain" />
          </div>
        </div>
        <h1 class="mt-5 text-2xl font-bold text-card-foreground">Manager</h1>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Inicia sesión para acceder al panel de control
        </p>
      </div>

      <!-- Form -->
      <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="mt-8 space-y-5">
        {#if errorState}
          {@const ErrorIcon = errorIcons[errorState.type]}
          <div class="rounded-xl border p-4 text-sm animate-shake flex items-start gap-3
            {errorState.type === 'user_disabled'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : errorState.type === 'network'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
                : 'bg-destructive/10 border-destructive/20 text-destructive'}">
            <ErrorIcon class="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errorState.message}</span>
          </div>
        {/if}

        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-card-foreground">
            Correo electrónico
          </label>
          <div class="relative group">
            <Mail class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground 
                         transition-colors group-focus-within:text-primary" />
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="correo@gmail.com"
              class="input-field pl-11"
              autocomplete="email"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-card-foreground">
            Contraseña
          </label>
          <div class="relative group">
            <Lock class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground
                         transition-colors group-focus-within:text-primary" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="••••••••"
              class="input-field pl-11 pr-12"
              autocomplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                     text-muted-foreground transition-all duration-200
                     hover:text-foreground hover:bg-secondary"
            >
              {#if showPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          disabled={isLoading}
          class="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold
                 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#if isLoading}
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
            Iniciando sesión...
          {:else}
            Iniciar sesión
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          {/if}
        </button>
      </form>
    </div>

    <!-- Watermark -->
    <p class="mt-8 text-center text-xs font-semibold tracking-wide text-muted-foreground/70 animate-fade-in">
      Departamento de Informática. UNSL {new Date().getFullYear()}
    </p>
  </div>
</div>

