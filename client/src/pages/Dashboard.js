import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [editForm, setEditForm] = useState(null);

  const navigate = useNavigate(); // ✅ Moved inside the component
  const token = localStorage.getItem("token");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/tasks", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks([res.data, ...tasks]);
      setForm({ title: "", description: "", deadline: "" });
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEditClick = (task) => {
    setEditForm({
      ...task,
      deadline: task.deadline.slice(0, 10), // Format YYYY-MM-DD
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/tasks/${editForm.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(
        tasks.map((task) => (task.id === res.data.id ? res.data : task))
      );
      setEditForm(null); // close form
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <button
        onClick={logout}
        style={{ backgroundColor: "crimson", color: "white" }}
      >
        Logout
      </button>
      <h1 className="text-3xl font-bold text-blue-600">Tailwind is working!</h1>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Add Task</button>
      </form>

      {editForm && (
        <form onSubmit={handleUpdateTask}>
          <h3>Edit Task</h3>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            required
          />
          <br />
          <br />
          <input
            type="text"
            name="description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            required
          />
          <br />
          <br />
          <input
            type="date"
            name="deadline"
            value={editForm.deadline}
            onChange={(e) =>
              setEditForm({ ...editForm, deadline: e.target.value })
            }
            required
          />
          <br />
          <br />
          <select
            name="status"
            value={editForm.status}
            onChange={(e) =>
              setEditForm({ ...editForm, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
          <br />
          <br />

          <button type="submit">Update Task</button>
          <button type="button" onClick={() => setEditForm(null)}>
            Cancel
          </button>
        </form>
      )}

      <h3>Your Tasks:</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.description} (Status:{" "}
            {task.status})
            <button
              onClick={() => handleEditClick(task)}
              style={{
                marginLeft: "10px",
                backgroundColor: "orange",
                color: "white",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              style={{
                marginLeft: "10px",
                backgroundColor: "tomato",
                color: "white",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
