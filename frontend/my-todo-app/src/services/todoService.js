// src/services/todoService.js
// Simple wrapper around the REST API endpoints provided by the user.
// Adjust BASE_URL if your backend runs on a different host/port.

const BASE_URL = "http://127.0.0.1:8000/todos";

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    const error = new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    error.status = res.status;
    throw error;
  }
  // No content (204)
  if (res.status === 204) return null;
  return res.json();
}

export async function getTodos() {
  const res = await fetch(BASE_URL, { method: "GET" });
  return handleResponse(res);
}

export async function getTodoById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "GET" });
  return handleResponse(res);
}

export async function createTodo(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateTodo(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
