import { useState } from 'react';
import axiosInstance from '../axiosConfig';

const TaskForm = ({ tasks = [], setTasks }) => {
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = [];
    if (!form.complainantName.trim()) errs.push('Complainant Name');
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.push('Valid Email');
    if (!form.phoneNumber.trim()) errs.push('Phone Number');
    if (!form.title.trim()) errs.push('Title');
    if (!form.category.trim()) errs.push('Category');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      alert('Please provide: ' + errs.join(', '));
      return;
    }
    try {
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
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Complaint</button>
    </form>
  );
};

export default TaskForm;