import { writable } from 'svelte/store';
import type { HubSettings } from '$lib/types';
import { getHubsByNetwork, sendHubSettings } from '$lib/services/api';

// ---------------------------------------------------------------------------
// State stores
// ---------------------------------------------------------------------------

export const hubs = writable<HubSettings[]>([]);
export const hubsLoading = writable(false);
export const hubsError = writable<string | null>(null);
/** Tracks which hubId is currently sending settings (202 in-progress). */
export const hubsSaving = writable<string | null>(null);
/** Tracks dynamic hub operational states received via SSE (HUB_STATE). */
export const hubStates = writable<Record<string, string>>({});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const hubsActions = {
  /** Load hubs for a given networkId. */
  async load(networkId: string): Promise<void> {
    hubsLoading.set(true);
    hubsError.set(null);
    try {
      const data = await getHubsByNetwork(networkId);
      hubs.set(data);
    } catch (err) {
      hubsError.set(err instanceof Error ? err.message : String(err));
    } finally {
      hubsLoading.set(false);
    }
  },

  /**
   * Send new settings to a Hub via PUT.
   * The backend responds 202 Accepted and processes asynchronously.
   * Optimistically updates the local store.
   */
  async updateSettings(hubId: string, settings: HubSettings): Promise<void> {
    hubsError.set(null);
    hubsSaving.set(hubId);
    try {
      await sendHubSettings(hubId, settings);
      // Optimistic local update
      hubs.update((list) => list.map((h) => (h.hubId === hubId ? settings : h)));
    } catch (err) {
      hubsError.set(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      hubsSaving.set(null);
    }
  },

  /**
   * Upsert a hub received via SSE (HUB_UPDATED event).
   * If a hub with the same hubId already exists it is replaced with the
   * incoming data; otherwise the hub is appended to the list.
   * Only mutates the store when the networkId matches the currently loaded
   * network – callers can still rely on `hubsActions.load` for a full refresh.
   */
  upsert(incoming: HubSettings): void {
    hubs.update((list) => {
      const idx = list.findIndex((h) => h.hubId === incoming.hubId);
      if (idx !== -1) {
        // Replace existing hub with up-to-date data
        const updated = [...list];
        updated[idx] = incoming;
        return updated;
      }
      // Only append if the hub belongs to the network currently in the store
      const currentNetworkId = list[0]?.networkId ?? incoming.networkId;
      if (incoming.networkId === currentNetworkId) {
        return [...list, incoming];
      }
      return list;
    });
  },

  /** Clear the hub list (e.g. when navigating away). */
  clear(): void {
    hubs.set([]);
    hubsError.set(null);
  },
};
