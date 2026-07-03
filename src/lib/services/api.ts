import { supabase } from '$lib/supabase';
import type {
  CertificateData,
  CertificateRequest,
  Edge,
  HubSettings,
  Network,
  NetworkSummary,
  Notification
} from '$lib/types';

/**
 * Central API configuration and fetch utilities.
 * Set VITE_API_BASE_URL in your .env file to override (e.g. http://localhost:3000/api).
 * Defaults to '/api' (relative — same origin or Vite proxy).
 */
function resolveApiBase(): string {
  try {
    const envUrl = import.meta.env['VITE_API_BASE_URL'] as string | undefined;
    return envUrl ?? '/api';
  } catch {
    return '/api';
  }
}

export const API_BASE = resolveApiBase();

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Low-level fetch wrapper. Throws ApiError on non-2xx responses.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE}${path}`;

  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Add application/json if there's a body and no content-type is set
  if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errorJson = await response.json();
      errorText = errorJson.message || errorJson.error || errorText;
    } catch {
      try {
        const text = await response.text();
        if (text) errorText = text;
      } catch {
        // Fallback to statusText
      }
    }
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }

  return response;
}

/**
 * Fetch and parse JSON response.
 */
export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(path, options);
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch a binary response, return Blob and trigger browser download.
 */
export async function downloadBlob(
  path: string,
  filename: string,
  options: RequestInit = {},
): Promise<Blob> {
  const response = await apiFetch(path, {
    ...options,
    headers: {
      'Accept': 'application/octet-stream',
      ...options.headers,
    }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return blob;
}

// ===========================================================================
// MAPPED ENDPOINTS
// ===========================================================================

// --- Certificados (/api/certificates) ---

export async function getCertificates(): Promise<CertificateData[]> {
  return apiJson<CertificateData[]>('/certificates');
}

export async function revokeCertificate(id: string): Promise<void> {
  await apiFetch(`/certificates/${id}/revoke`, { method: 'PATCH' });
}

export async function generateCertificate(data: CertificateRequest): Promise<Blob> {
  return downloadBlob('/certificates/generate', `certificate-${data.commonName}.zip`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/zip'
    }
  });
}

// --- Edges (/api/edges) ---

export async function getAllEdges(): Promise<Edge[]> {
  return apiJson<Edge[]>('/edges');
}

export async function createEdge(edge: Edge): Promise<void> {
  await apiFetch('/edges', {
    method: 'POST',
    body: JSON.stringify(edge),
  });
}

export async function deleteEdge(id: string): Promise<void> {
  await apiFetch(`/edges/${id}`, { method: 'DELETE' });
}

export async function downloadEdgeConfig(id: string): Promise<Blob> {
  return downloadBlob(`/edges/${id}/download`, `edge-config-${id}.zip`, {
    method: 'GET'
  });
}

// --- Hubs (/api/hubs) ---

export async function getHubsByNetwork(networkId: string): Promise<HubSettings[]> {
  return apiJson<HubSettings[]>(`/hubs?networkId=${networkId}`);
}

export async function sendHubSettings(id: string, settings: HubSettings): Promise<void> {
  await apiFetch(`/hubs/${id}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// --- Networks (/api/networks) ---

export async function getNetworksSummary(edgeId: string): Promise<NetworkSummary[]> {
  return apiJson<NetworkSummary[]>(`/networks?edgeId=${edgeId}`);
}

export async function getFullNetworks(edgeId: string): Promise<Network[]> {
  return apiJson<Network[]>(`/networks/detail?edgeId=${edgeId}`);
}

export async function createNetwork(network: Network): Promise<void> {
  await apiFetch('/networks', {
    method: 'POST',
    body: JSON.stringify(network),
  });
}

export async function updateNetworkStatus(id: string): Promise<void> {
  await apiFetch(`/networks/${id}/update`, { method: 'PATCH' });
}

export async function deleteNetwork(id: string): Promise<void> {
  await apiFetch(`/networks/${id}`, { method: 'DELETE' });
}

export async function updateNetworkFirmware(networkId: string, edgeId: string): Promise<void> {
  await apiFetch(`/networks/${networkId}/update-firmware`, {
    method: 'POST',
    body: JSON.stringify({
      edge: edgeId,
      network: networkId,
    }),
  });
}

// --- Notifications (/api/notifications) ---

export async function getActiveNotifications(): Promise<Notification[]> {
  return apiJson<Notification[]>('/notifications');
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

// --- Documents (/api/documents) ---

export async function downloadDocumentation(): Promise<Blob> {
  return downloadBlob('/documents/Documentacion/download', 'documentacion_sistema.pdf', {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf'
    }
  });
}
