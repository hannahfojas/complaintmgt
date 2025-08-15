import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  function ageDays(createdAt, completionDate) {
    const start = new Date(createdAt);
    const end = completionDate ? new Date(completionDate) : new Date();
    const diff = end - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    setLoading(true);
    setErrMsg('');
    axiosInstance
      .get('/api/complaints', {
        params: statusFilter === 'All' ? {} : { status: statusFilter }
      })
      .then((res) => {
        setTasks(res.data || []);
      })
      .catch(() => {
        setErrMsg('Failed to load complaints.');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, setTasks]);

  const closeNoResolution = async (id) => {
  const note = window.prompt('Enter a resolution note (required):', '');
  if (!note || !note.trim()) { alert('Resolution note is required.'); return; }
  try {
    const { data: closed } = await axiosInstance.patch(`/api/complaints/${id}/close-no-resolution`);
    const { data: withNote } = await axiosInstance.post(`/api/complaints/${id}/notes`, {
      text: note.trim(),
      author: 'Staff'
    });
    setTasks((prev) => prev.map((t) => (t._id === id ? withNote : t)));
  } catch (err) {
    const status = err?.response?.status;
    alert(status ? `Failed to close (HTTP ${status}).` : 'Network error.');
  }
  };

  const cell = { whiteSpace: 'nowrap', padding: '4px 6px', border: '1px solid #ddd' };
  const small = { fontSize: '12px' };
  const titleCell = { ...cell, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' };

  return (
    <div style={{ marginTop: 16, overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ ...small, fontWeight: 600, margin: 0 }}>Complaints</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label htmlFor="statusFilter" style={{ ...small, opacity: 0.8 }}>Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...small, padding: '4px 6px', border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed - No Resolution</option>
          </select>
        </div>
      </div>

      {errMsg && (
        <div style={{ ...small, color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', padding: 6, borderRadius: 4, marginBottom: 8 }}>
          {errMsg}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', ...small, border: '1px solid #ddd' }}>
        <thead style={{ background: '#f3f4f6' }}>
          <tr>
            <th style={cell}>Complainant</th>
            <th style={cell}>Email</th>
            <th style={cell}>Phone</th>
            <th style={cell}>Title</th>
            <th style={cell}>Category</th>
            <th style={cell}>Assigned To</th>
            <th style={cell}>Status</th>
            <th style={cell}>Created</th>
            <th style={cell}>Completed</th>
            <th style={cell}>Age (days)</th>
            <th style={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td style={{ ...cell, textAlign: 'center' }} colSpan="11">Loading…</td></tr>
          ) : tasks && tasks.length > 0 ? (
            tasks.map((t) => (
              <tr key={t._id} style={{ background: '#fff' }}>
                <td style={cell}>{t.complainantName}</td>
                <td style={cell}>{t.email}</td>
                <td style={cell}>{t.phoneNumber}</td>
                <td style={titleCell} title={t.title}>{t.title}</td>
                <td style={cell}>{t.category}</td>
                <td style={cell}>{t.assignedTo || '—'}</td>
                <td style={cell}>{t.status}</td>
                <td style={cell}>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={cell}>{t.completionDate ? new Date(t.completionDate).toLocaleString() : '—'}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{ageDays(t.createdAt, t.completionDate)}</td>
                <td style={cell}>
                  <button
                    onClick={() => setEditingTask(t)}
                    style={{ ...small, padding: '3px 6px', border: '1px solid #d97706', background: '#fde68a', borderRadius: 4, marginRight: 4 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => closeNoResolution(t._id)}
                    disabled={t.status === 'Resolved' || t.status === 'Closed - No Resolution'}
                    style={{ ...small, padding: '3px 6px', border: '1px solid #9ca3af', background: '#e5e7eb', borderRadius: 4, opacity: (t.status === 'Resolved' || t.status === 'Closed - No Resolution') ? 0.6 : 1 }}
                  >
                    Close w/o Res.
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td style={{ ...cell, textAlign: 'center' }} colSpan="11">No complaints found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;