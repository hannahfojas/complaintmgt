import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const ComplaintForm = ({ complaints, setComplaints, editingComplaint, setEditingComplaint }) => {
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
    if (editingComplaint) {
      setForm({
        complainantName: editingComplaint.complainantName || '',
        email: editingComplaint.email || '',
        phoneNumber: editingComplaint.phoneNumber || '',
        title: editingComplaint.title || '',
        description: editingComplaint.description || '',
        category: editingComplaint.category || 'Low',
        assignedTo: editingComplaint.assignedTo || '',
        status: editingComplaint.status || 'Open'
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
  }, [editingComplaint]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingComplaint) {
      const { _id } = editingComplaint;

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

      const statusChanged = form.status !== editingComplaint.status;
      const targetCompleted = form.status === 'Resolved' || form.status === 'Closed - No Resolution';

      if (statusChanged && targetCompleted) {
        let noteText = (form.resolutionNote || '').trim();
        if (!noteText) {
          const p = window.prompt('Enter a resolution note (required):', '');
          if (!p || !p.trim()) { alert('Resolution note is required.'); return; }
          noteText = p.trim();
        }

        await axiosInstance.patch(`/api/complaints/${_id}/status`, { status: form.status });
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
        const noteChanged = (form.resolutionNote || '') !== (editingComplaint.resolutionNote || '');
        if (isCompletedNow && noteChanged && (form.resolutionNote || '').trim()) {
          const { data: withNote } = await axiosInstance.post(`/api/complaints/${_id}/notes`, {
            text: form.resolutionNote.trim(),
            author: 'Staff'
          });
          updatedDoc = withNote;
        }
      }

      setComplaints(prev => prev.map(t => (t._id === _id ? updatedDoc : t)));
      setEditingComplaint(null);
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
      setComplaints(prev => [data, ...prev]);
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
        disabled={!editingComplaint}
        title={editingComplaint ? 'Update status' : 'Status set automatically to Open on create'}
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed - No Resolution">Closed - No Resolution</option>
      </select>

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        {editingComplaint ? 'Update Complaint' : 'Add Complaint'}
      </button>
    </form>
  );
};

export default ComplaintForm;