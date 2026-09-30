const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `API request failed (${response.status})`);
  }
  return payload;
}

export async function fetchCollection(collection) {
  const payload = await requestJson(`/data/${encodeURIComponent(collection)}`);
  return payload.items || [];
}

export function fetchLatestSensor() {
  return requestJson('/sensor?after=-1');
}

export function saveRecord(collection, id, record) {
  return requestJson(`/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(record)
  });
}

export function removeRecord(collection, id) {
  return requestJson(`/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export function classifySensorNotification(sensor) {
  return requestJson('/notifications/classify', {
    method: 'POST',
    body: JSON.stringify(sensor)
  });
}