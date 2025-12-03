// src/components/TodoApp.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress
} from "@mui/material";
import { Edit, Delete, Add, Save, Cancel } from "@mui/icons-material";

import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
} from "../services/todoService";

/*
  TodoApp - React functional component
  - Connects to the API endpoints you specified (127.0.0.1:8000/todos)
  - Each todo: { title, description, completed, id }
  - Simple to edit: service calls are isolated in services/todoService.js
*/

const emptyForm = { title: "", description: "", completed: false };

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [error, setError] = useState(null);

  // Load initial list
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      // Expecting array as per your spec
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load todos.");
    } finally {
      setLoading(false);
    }
  }

  function onFieldChange(field) {
    return (e) => {
      const value =
        field === "completed" ? (e.target.value === "true") : e.target.value;
      setForm((s) => ({ ...s, [field]: value }));
    };
  }

  async function handleSave() {
    // Basic validation
    if (!form.title || !form.title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        // Update by id
        const updated = await updateTodo(editingId, {
          title: form.title.trim(),
          description: form.description || "",
          completed: !!form.completed,
        });
        // replace item in list
        setTodos((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
        setEditingId(null);
      } else {
        // Create
        const created = await createTodo({
          title: form.title.trim(),
          description: form.description || "",
          completed: !!form.completed,
        });
        // put new item at top
        setTodos((prev) => [created, ...prev]);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Failed to save todo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id) {
    setError(null);
    try {
      // fetch item by id (optional — you can use existing list item)
      const item = await getTodoById(id);
      setForm({
        title: item.title || "",
        description: item.description || "",
        completed: !!item.completed,
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to load item for edit.");
    }
  }

  function openDeleteConfirm(id) {
    setConfirmDelete({ open: true, id });
  }

  function closeDeleteConfirm() {
    setConfirmDelete({ open: false, id: null });
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete.id) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteTodo(confirmDelete.id);
      setTodos((prev) => prev.filter((t) => String(t.id) !== String(confirmDelete.id)));
      closeDeleteConfirm();
      // If we were editing the same id, cancel edit
      if (editingId === confirmDelete.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err.message || "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" mb={2}>
          Todo Manager
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={onFieldChange("title")}
              placeholder="Buy milk"
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              label="Description"
              fullWidth
              value={form.description}
              onChange={onFieldChange("description")}
              placeholder="2L"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <RadioGroup
              row
              value={String(form.completed)}
              onChange={onFieldChange("completed")}
              aria-label="completed"
              name="completed"
            >
              <FormControlLabel value="true" control={<Radio />} label="Done" />
              <FormControlLabel value="false" control={<Radio />} label="Not done" />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={editingId ? <Save /> : <Add />}
              onClick={handleSave}
              disabled={saving}
            >
              {editingId ? (saving ? "Updating..." : "Update Todo") : (saving ? "Saving..." : "Add Todo")}
            </Button>

            {editingId && (
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Box color="error.main">{error}</Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box mt={4}>
        <Paper>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="35%">Title</TableCell>
                  <TableCell width="45%">Description</TableCell>
                  <TableCell width="10%">Status</TableCell>
                  <TableCell width="10%" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {todos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No todos found.
                    </TableCell>
                  </TableRow>
                )}

                {todos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.completed ? "Done" : "Not done"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(t.id)} aria-label="edit" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => openDeleteConfirm(t.id)} aria-label="delete" size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      <Dialog open={confirmDelete.open} onClose={closeDeleteConfirm}>
        <DialogTitle>Delete Todo</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
