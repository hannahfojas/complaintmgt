import { useState } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [editingComplaint, setEditingComplaint] = useState(null);

  return (
    <div className="container mx-auto p-6">
      <ComplaintForm
        complaints={complaints}
        setComplaints={setComplaints}
        editingComplaint={editingComplaint}
        setEditingComplaint={setEditingComplaint}
      />
      <ComplaintList complaints={complaints} setComplaints={setComplaints} setEditingComplaint={setEditingComplaint} />
    </div>
  );
};

export default Complaints;