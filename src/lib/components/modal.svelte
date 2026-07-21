<script lang="ts">
  import X from 'lucide-svelte/icons/x';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    open?: boolean;
    title: string;
    maxWidth?: string;
    onClose: () => void;
  }

  let {
    children,
    open = false,
    title,
    maxWidth = 'max-w-lg',
    onClose
  }: Props = $props();

  function handleBackdropClick() {
    onClose();
  }

  function handleCloseClick() {
    onClose();
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 animate-fade-in">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-background/80 backdrop-blur-md cursor-pointer transition-opacity"
      onclick={handleBackdropClick}
      onkeydown={(e) => e.key === 'Escape' && onClose()}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>

    <!-- Modal Container for centering with scroll support -->
    <div class="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
      <!-- Modal -->
      <div class="relative z-10 w-full {maxWidth} overflow-hidden rounded-2xl border border-border 
                  bg-card p-4 sm:p-6 text-left shadow-2xl shadow-black/20 animate-scale-in my-6 sm:my-8 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between mb-4 sm:mb-5 shrink-0">
          <h2 class="text-base sm:text-lg font-semibold text-card-foreground truncate pr-2">{title}</h2>
          <!-- Close button -->
          <button
            type="button"
            onclick={handleCloseClick}
            class="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl 
                   text-muted-foreground transition-all duration-200
                   hover:bg-destructive/10 hover:text-destructive hover:rotate-90
                   active:scale-90"
            aria-label="Close"
          >
            <X class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <div class="overflow-y-auto flex-1">
          {#if children}
            {@render children()}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
