const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Complaint = require('../models/Complaint');
const {
  createComplaint,
  getComplaints,
  updateComplaintDetails,
  closeWithoutResolution,
  updateComplaintStatus,
  addResolutionNote
} = require('../controllers/complaintController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;
afterEach(() => sinon.restore());

describe('AddComplaint Function Test', () => {
  it('should create a new complaint successfully', async () => {
    const req = {
      body: {
        complainantName: 'Samuel',
        email: 'samuelfojas@example.com',
        phoneNumber: '0432123456',
        title: 'Ipad not allowed',
        description: '',
        category: 'Low',
        assignedTo: 'Nikko Fojas'
      }
    };

    const createdComplaint = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      status: 'Open',
      completionDate: null
    };

    sinon.stub(Complaint, 'create').resolves(createdComplaint);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createComplaint(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdComplaint)).to.be.true;
  });

  it('should return 400 if an error occurs', async () => {
    sinon.stub(Complaint, 'create').throws(new Error('ValidationError'));

    const req = {
      body: {
        complainantName: '',
        email: 'not-a-valid-email',
        phoneNumber: '',
        title: '',
        description: '',
        category: 'Low',
        assignedTo: 'Nikko Fojas'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createComplaint(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'ValidationError' })).to.be.true;
  });
});


describe('Update Function Test', () => {
  it('should update complaint successfully', async () => {
    const complaintId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: complaintId },
      body: {
        complainantName: 'Lukas Fojas',
        email: 'lukas@example.com',
        phoneNumber: '0432567890',
        title: 'Chocolates are not enough.',
        description: 'Stock not replenished.',
        category: 'Medium',
        assignedTo: 'Hannah Fojas'
      }
    };

    const updatedComplaint = {
      _id: complaintId,
      ...req.body,
      status: 'Open',
      completionDate: null
    };

    sinon.stub(Complaint, 'findByIdAndUpdate').resolves(updatedComplaint);

    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateComplaintDetails(req, res);

    expect(res.status.called).to.be.false; // success path
    expect(res.json.calledWith(updatedComplaint)).to.be.true;
  });

  it('should return 404 if complaint is not found', async () => {
    const complaintId = new mongoose.Types.ObjectId();

    sinon.stub(Complaint, 'findByIdAndUpdate').resolves(null);

    const req = { params: { id: complaintId }, body: { title: 'No complaints' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateComplaintDetails(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Complaint not found' })).to.be.true;
  });

  it('should return 400 on validation error', async () => {
    const complaintId = new mongoose.Types.ObjectId();

    sinon.stub(Complaint, 'findByIdAndUpdate').throws(new Error('ValidationError'));

    const req = { params: { id: complaintId }, body: { title: '' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateComplaintDetails(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'ValidationError' })).to.be.true;
  });
});

//no filter
describe('GetAllComplaints Function Test', () => {
  it('should return all complaints', async () => {
    const complaints = [
      { _id: new mongoose.Types.ObjectId(), title: 'A', status: 'Open' },
      { _id: new mongoose.Types.ObjectId(), title: 'B', status: 'Resolved' }
    ];

    const sortStub = sinon.stub().resolves(complaints);
    sinon.stub(Complaint, 'find').returns({ sort: sortStub });

    const req = { query: {} };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getComplaints(req, res);

    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.be.true;
    expect(res.json.calledWith(complaints)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should return 500 on error', async () => {
    sinon.stub(Complaint, 'find').throws(new Error('DB Error'));

    const req = { query: {} };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getComplaints(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('CloseWithoutResolution Function Test', () => {
  it('should set status to Closed - No Resolution and set completionDate', async () => {
    const complaintId = new mongoose.Types.ObjectId();
    const complaint = {
      _id: complaintId,
      status: 'Open',
      completionDate: null,
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Complaint, 'findById').resolves(complaint);

    const req = { params: { id: complaintId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await closeWithoutResolution(req, res);

    expect(complaint.status).to.equal('Closed - No Resolution');
    expect(complaint.completionDate).to.be.instanceof(Date);
    expect(complaint.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(complaint)).to.be.true;
  });

  it('should return 404 if complaint is not found', async () => {
    sinon.stub(Complaint, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toHexString() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await closeWithoutResolution(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    // ZIP returns 'Complaint not found'
    expect(res.json.calledWithMatch({ message: 'Complaint not found' })).to.be.true;
  });

  it('should return 400 on error', async () => {
    sinon.stub(Complaint, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: 'x' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await closeWithoutResolution(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});


describe('UpdateStatus Function Test', () => {
  it('should return 400 for invalid status', async () => {
    const req = { params: { id: '1' }, body: { status: 'Bad' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateComplaintStatus(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid status' })).to.be.true;
  });

  it('should update status and set completionDate', async () => {
    const complaintId = new mongoose.Types.ObjectId().toHexString();
    const complaint = {
      _id: complaintId,
      status: 'Open',
      completionDate: null,
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Complaint, 'findById').resolves(complaint);

    const req = { params: { id: complaintId }, body: { status: 'Resolved' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateComplaintStatus(req, res);

    expect(complaint.status).to.equal('Resolved');
    expect(complaint.completionDate).to.be.instanceof(Date);
    expect(complaint.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(complaint)).to.be.true;
  });

  it('should return 404 if complaint is not found', async () => {
    sinon.stub(Complaint, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toHexString() }, body: { status: 'Open' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateComplaintStatus(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Complaint not found' })).to.be.true;
  });
});


describe('AddResolutionNote Function Test', () => {
  it('should return 400 if note text is missing', async () => {
    const req = { params: { id: '1' }, body: { text: '' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addResolutionNote(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Note text is required' })).to.be.true;
  });

  it('should return 400 if complaint is not completed', async () => {
    const complaintId = new mongoose.Types.ObjectId().toHexString();
    const complaint = {
      _id: complaintId,
      status: 'Open',
      resolutionNotes: [],
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Complaint, 'findById').resolves(complaint);

    const req = { params: { id: complaintId }, body: { text: 'Trying to add too early' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addResolutionNote(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Allowed only when complaint is completed' })).to.be.true;
    expect(complaint.resolutionNotes).to.have.length(0);
  });

  it('should push a note and return 200 when complaint is completed', async () => {
    const complaintId = new mongoose.Types.ObjectId().toHexString();
    const complaint = {
      _id: complaintId,
      status: 'Resolved', // completed state
      resolutionNotes: [],
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Complaint, 'findById').resolves(complaint);

    const req = { params: { id: complaintId }, body: { text: 'All good now', author: 'Staff' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addResolutionNote(req, res);

    expect(complaint.resolutionNotes.length).to.equal(1);
    expect(complaint.resolutionNotes[0].text).to.equal('All good now');
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(complaint)).to.be.true;
  });

  it('should indicate not-found when complaint is missing', async () => {
  sinon.stub(Complaint, 'findById').resolves(null);

  const req = { params: { id: 'nope' }, body: { text: 'x' } };
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  };

  await addResolutionNote(req, res);

  expect(res.status.called).to.be.true;

  const code = res.status.firstCall.args[0];
  expect([404, 400]).to.include(code);

  const payload = res.json.firstCall?.args?.[0] || {};
  const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  expect(bodyStr.toLowerCase()).to.include('not found');
    });
});


function ageDays(createdAt, completionDate) {
  const start = new Date(createdAt);
  const end = completionDate ? new Date(completionDate) : new Date();
  const diff = end - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

describe('ageDays calculation', () => {
  it('calculates age for an OPEN complaint (no completionDate)', () => {
    const clock = sinon.useFakeTimers(new Date('2025-08-16T00:00:00Z'));
    expect(ageDays('2025-08-10T00:00:00Z')).to.equal(6); // 16 - 10 = 6
    clock.restore();
  });

  it('calculates age for a CLOSED complaint (uses completionDate)', () => {
    expect(ageDays('2025-08-10T00:00:00Z', '2025-08-12T00:00:00Z')).to.equal(2);
  });
});


describe('GetComplaints Function Test with Filter', () => {
  afterEach(() => sinon.restore());

  it('should return complaints filtered by status', async () => {
    const complaints = [
      { _id: new mongoose.Types.ObjectId(), title: 'Complaint A', status: 'Resolved' },
      { _id: new mongoose.Types.ObjectId(), title: 'Complaint B', status: 'Resolved' },
    ];

    const sortStub = sinon.stub().resolves(complaints);
    const findStub = sinon.stub(Complaint, 'find').returns({ sort: sortStub });

    const req = { query: { status: 'Resolved' } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getComplaints(req, res);

    expect(findStub.calledOnceWith({ status: 'Resolved' })).to.be.true;
    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.be.true;
    expect(res.json.calledWith(complaints)).to.be.true;
    expect(res.status.called).to.be.false; // no error status
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Complaint, 'find').throws(new Error('DB Error'));

    const req = { query: {} };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getComplaints(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });
});
