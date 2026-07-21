import { fetchEventSource } from '@microsoft/fetch-event-source';
import { notificationsActions } from '$lib/stores/notifications';
import { edgeStates } from '$lib/stores/edges';
import { hubStates, hubsActions } from '$lib/stores/hubs';
import { API_BASE } from '$lib/services/api';
import { toasts } from '$lib/stores/toasts.svelte';


let sseAbortController: AbortController | null = null;

export function initSSE(token: string) {
  if (sseAbortController) {
    sseAbortController.abort();
  }
  sseAbortController = new AbortController();

  fetchEventSource(`${API_BASE}/stream`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal: sseAbortController.signal,
    onmessage(ev) {
      if (ev.event === 'EDGE_STATE') {
        try {
          const data = JSON.parse(ev.data);
          if (data.edgeId && data.state) {
            edgeStates.update(s => ({ ...s, [data.edgeId]: data.state }));
          }
        } catch (e) {
          console.error('Error parsing EDGE_STATE', e);
        }
      } else if (ev.event === 'NOTIFICATION') {
        try {
          const data = JSON.parse(ev.data);
          notificationsActions.add(data);
          toasts.add(data);
        } catch (e) {
          console.error('Error parsing NOTIFICATION', e);
        }
      } else if (ev.event === 'NETWORK_RESULT') {
        try {
          const data = JSON.parse(ev.data);
          const tsSeconds = Math.floor(Date.now() / 1000);
          const notification = {
            id: Date.now(),
            type: 'NETWORK_RESULT',
            description: `network_id: ${data.networkId} success: ${data.success} timestamp: ${tsSeconds} message: ${data.message}`,
            active: true,
            createdAt: Date.now()
          };
          notificationsActions.add(notification);
          toasts.add(notification);
        } catch (e) {
          console.error('Error parsing NETWORK_RESULT', e);
        }
      } else if (ev.event === 'HUB_UPDATED') {
        try {
          const data = JSON.parse(ev.data);
          hubsActions.upsert(data);
        } catch (e) {
          console.error('Error parsing HUB_UPDATED', e);
        }
      } else if (ev.event === 'HUB_STATE') {
        try {
          const data = JSON.parse(ev.data);
          if (data.hub && data.state) {
            hubStates.update(s => ({ ...s, [data.hub]: data.state }));
          }
        } catch (e) {
          console.error('Error parsing HUB_STATE', e);
        }
      }
    },
    onerror(err) {
      console.error('SSE Error:', err);
      // throw err will trigger retry automatically by fetch-event-source
      // if we return without throwing, it might stop retrying depending on the error
      throw err;
    }
  });
}

export function closeSSE() {
  if (sseAbortController) {
    sseAbortController.abort();
    sseAbortController = null;
  }
}
