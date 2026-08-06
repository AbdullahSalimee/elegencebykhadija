// Shared fetcher for every SWR hook (hooks/*.js) — one place to shape error
// objects so a failed request doesn't just throw an opaque "Failed to fetch".
export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || body.error || 'request_failed');
    error.status = res.status;
    error.info = body;
    throw error;
  }
  return res.json();
}

export async function sendFormData(url, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || data.error || 'request_failed');
    error.status = res.status;
    error.info = data;
    throw error;
  }
  return data;
}

export async function sendJSON(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || data.error || 'request_failed');
    error.status = res.status;
    error.info = data;
    throw error;
  }
  return data;
}
