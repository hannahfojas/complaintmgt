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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const authHdr = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingTask) {
      const { _id } = editingTask;

      const detailsPayload = {
        complainantName: form.complainantName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        title: form.title,
        description: form.description,
        category: form.category,
        assignedTo: form.assignedTo
      };
      const { data: updatedDetails } = await axiosInstance.put(`/api/complaints/${_id}`, detailsPayload);
      let updatedDoc = updatedDetails;

      const statusChanged = form.status !== editingTask.status;
      const targetCompleted = form.status === 'Resolved' || form.status === 'Closed - No Resolution';

      if (statusChanged && targetCompleted) {
        let noteText = (form.resolutionNote || '').trim();
        if (!noteText) {
          const p = window.prompt('Enter a resolution note (required):', '');
          if (!p || !p.trim()) { alert('Resolution note is required.'); return; }
          noteText = p.trim();
        }

        const { data: updatedStatus } = await axiosInstance.patch(`/api/complaints/${_id}/status`, { status: form.status });
        const { data: withNote } = await axiosInstance.post(`/api/complaints/${_id}/notes`, {
          text: noteText,
          author: 'Staff'
        });
        updatedDoc = withNote;
      } else if (statusChanged) {
        const { data: updatedStatus } = await axiosInstance.patch(`/api/complaints/${_id}/status`, { status: form.status });
        updatedDoc = updatedStatus;
      } else {
        const isCompletedNow = updatedDoc.status === 'Resolved' || updatedDoc.status === 'Closed - No Resolution';
        const noteChanged = (form.resolutionNote || '') !== (editingTask.resolutionNote || '');
        if (isCompletedNow && noteChanged && (form.resolutionNote || '').trim()) {
          const { data: withNote } = await axiosInstance.post(`/api/complaints/${_id}/notes`, {
            text: form.resolutionNote.trim(),
            author: 'Staff'
          });
          updatedDoc = withNote;
        }
      }

      setTasks(prev => prev.map(t => (t._id === _id ? updatedDoc : t)));
      setEditingTask(null);
    } else {
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
      setTasks(prev => [data, ...prev]);
    }

    setForm({
      complainantName: '',
      email: '',
      phoneNumber: '',
      title: '',
      description: '',
      category: 'Low',
      assignedTo: '',
      status: 'Open',
      resolutionNote: ''
    });
    } catch (err) {
    const msg = err?.response?.data?.message || 'Save failed.';
    alert(msg);
    console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded mb-8">
      <input name="complainantName" value={form.complainantName} onChange={handleChange} placeholder="Complainant Name" required className="w-full p-2 border mb-2" />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border mb-2" />
      <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" required className="w-full p-2 border mb-2" />
      <input name="title" value={form.title} onChange={handleChange} placeholder="Complaint Title" required className="w-full p-2 border mb-2" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border mb-2" rows={3} />
      <select name="category" value={form.category} onChange={handleChange} className="w-full p-2 border mb-2">
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Assigned To" className="w-full p-2 border mb-2" />

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