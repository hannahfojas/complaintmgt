import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const [form, setForm] = useState({
    complainantName: '',
    email: '',
    phoneNumber: '',
    title: '',
    description: '',
    category: 'Low',
    assignedTo: '',
    status: 'Open'
  });

  useEffect(() => {
    if (editingTask) {
      setForm({
        complainantName: editingTask.complainantName || '',
        email: editingTask.email || '',
        phoneNumber: editingTask.phoneNumber || '',
        title: editingTask.title || '',
        description: editingTask.description || '',
        category: editingTask.category || 'Low',
        assignedTo: editingTask.assignedTo || '',
        status: editingTask.status || 'Open'
      });
    } else {
      setForm({
        complainantName: '',
        email: '',
        phoneNumber: '',
        title: '',
        description: '',
        category: 'Low',
        assignedTo: '',
        status: 'Open'
      });
    }
  }, [editingTask]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // authHdr not used by this component; safe to remove if you prefer
  const authHdr = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const { _id } = editingTask;

        // 1) Update core details
        const detailsPayload = {
          complainantName: form.complainantName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          title: form.title,
          description: form.description,
          category: form.category,
          assignedTo: form.assignedTo
        };
        const { data: updatedDetails } = await axiosInstance.put(
          `/api/complaints/${_id}`,
          detailsPayload
        );
        let updatedDoc = updatedDetails;

        // 2) Update status (no resolution note handling)
        const statusChanged = form.status !== editingTask.status;
        if (statusChanged) {
          const { data: updatedStatus } = await axiosInstance.patch(
            `/api/complaints/${_id}/status`,
            { status: form.status }
          );
          updatedDoc = updatedStatus;
        }

        setTasks((prev) => prev.map((t) => (t._id === _id ? updatedDoc : t)));
        setEditingTask(null);
      } else {
        // CREATE
        const createPayload = {
          complainantName: form.complainantName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          title: form.title,
          description: form.description,
          category: form.category,
          assignedTo: form.assignedTo
        };
        const { data } = await axiosInstance.post('/api/complaints', createPayload);
        setTasks((prev) => [data, ...prev]);
      }

      // reset (no resolutionNote)
      setForm({
        complainantName: '',
        email: '',
        phoneNumber: '',
        title: '',
        description: '',
        category: 'Low',
        assignedTo: '',
        status: 'Open'
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Save failed.';
      alert(msg);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded mb-8">
      <input
        name="complainantName"
        value={form.complainantName}
        onChange={handleChange}
        placeholder="Complainant Name"
        required
        className="w-full p-2 border mb-2"
      />
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-2 border mb-2"
      />
      <input
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        required
        className="w-full p-2 border mb-2"
      />
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Complaint Title"
        required
        className="w-full p-2 border mb-2"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border mb-2"
        rows={3}
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full p-2 border mb-2"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input
        name="assignedTo"
        value={form.assignedTo}
        onChange={handleChange}
        placeholder="Assigned To"
        className="w-full p-2 border mb-2"
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full p-2 border mb-2"
        disabled={!editingTask}
        title={editingTask ? 'Update status' : 'Status set automatically to Open on create'}
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed - No Resolution">Closed - No Resolution</option>
      </select>

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        {editingTask ? 'Update Complaint' : 'Add Complaint'}
      </button>
    </form>
  );
};

export default TaskForm;