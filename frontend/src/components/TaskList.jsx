import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const fetchComplaints = async (retries = 3, delayMs = 400) => {
    setLoading(true);
    setErrMsg('');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data } = await axiosInstance.get('/api/complaints');
        setTasks(data);
        setLoading(false);
        return;
      } catch (err) {
        const status = err?.response?.status;
        const isNetwork = !status;
        const isServer = status >= 500;
        if (attempt < retries - 1 && (isNetwork || isServer)) {
          await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
          continue;
        }
        setErrMsg(
          status
            ? `Failed to load complaints (HTTP ${status}).`
            : 'Network error while loading complaints.'
        );
        setLoading(false);
        return;
      }
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchComplaints(), token ? 0 : 300);
    return () => clearTimeout(t);
  }, [token, setTasks]);

  const closeNoResolution = async (id) => {
    if (!window.confirm('Close this complaint without resolution?')) return;
    try {
      const { data } = await axiosInstance.patch(`/api/complaints/${id}/close-no-resolution`);
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      const status = err?.response?.status;
      alert(status ? `Failed to close (HTTP ${status}).` : 'Network error.');
    }
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Complaints</h2>
        <button
          className="px-2 py-1 border rounded hover:bg-gray-50"
          onClick={() => fetchComplaints()}
          disabled={loading}
          title="Refresh"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {errMsg && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {errMsg}
        </div>
      )}

      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Complainant</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Assigned To</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="border p-4 text-center text-gray-500">
                Loading…
              </td>
            </tr>
          ) : tasks && tasks.length > 0 ? (
            tasks.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="border p-2">{t.complainantName}</td>
                <td className="border p-2">{t.email}</td>
                <td className="border p-2">{t.phoneNumber}</td>
                <td className="border p-2">{t.title}</td>
                <td className="border p-2">{t.category}</td>
                <td className="border p-2">{t.assignedTo || '—'}</td>
                <td className="border p-2">{t.status}</td>
                <td className="border p-2">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="px-2 py-1 border rounded text-yellow-800 bg-yellow-300 hover:bg-yellow-400"
                    onClick={() => setEditingTask(t)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 border rounded text-gray-700 bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    onClick={() => closeNoResolution(t._id)}
                    disabled={t.status === 'Resolved' || t.status === 'Closed - No Resolution'}
                  >
                    Close w/o Resolution
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="border p-4 text-center text-gray-500">
                No complaints found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;