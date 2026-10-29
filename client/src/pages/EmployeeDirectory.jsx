import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function EmployeeDirectory() {
  const { isHR } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'StaffSync@123',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 70000,
    phone: '',
    role: 'employee',
  });

  const departments = ['All', 'Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Design'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees || []);
    } catch {
      toast.error('Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', newEmp);
      toast.success(`Created employee profile for ${newEmp.firstName}!`);
      setShowAddModal(false);
      setNewEmp({
        firstName: '',
        lastName: '',
        email: '',
        password: 'StaffSync@123',
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 70000,
        phone: '',
        role: 'employee',
      });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create employee.');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success(`${name} deactivated successfully.`);
      fetchEmployees();
    } catch {
      toast.error('Failed to deactivate employee.');
    }
  };

  return (
    <div className="directory-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Employee Directory</h1>
          <p className="text-muted small mb-0">Browse company personnel, teams, and contact profiles</p>
        </div>
        {isHR && (
          <button className="btn btn-primary btn-sm fw-semibold shadow-sm px-3" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-person-plus-fill me-1"></i> Add Team Member
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="input-group max-w-400">
            <span className="input-group-text bg-white text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, ID, role, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex gap-1 flex-wrap">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`btn btn-sm ${selectedDept === dept ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading directory...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-person-x fs-1 text-muted"></i>
          <h5 className="mt-2 fw-bold">No Employees Found</h5>
          <p className="text-muted small">Try tweaking your search term or department filter.</p>
        </div>
      ) : (
        <div className="row g-4">
          {employees.map((emp) => (
            <div className="col-12 col-md-6 col-lg-4" key={emp._id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white position-relative hover-lift">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {emp.user?.avatar ? (
                    <img src={emp.user.avatar} alt={emp.firstName} className="avatar-lg rounded-circle" />
                  ) : (
                    <div className="avatar-placeholder-lg rounded-circle bg-primary text-white fw-bold">
                      {emp.firstName[0]}
                    </div>
                  )}
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">
                      {emp.firstName} {emp.lastName}
                    </h2>
                    <span className="badge bg-light text-primary border small mt-1">{emp.employeeId}</span>
                    <small className="d-block text-muted">{emp.designation}</small>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 small mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Department:</span>
                    <strong className="text-dark">{emp.department}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Email:</span>
                    <span className="text-dark text-truncate max-w-150">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Phone:</span>
                      <span className="text-dark">{emp.phone}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Manager:</span>
                    <span className="text-dark">{emp.manager?.name || 'Leadership'}</span>
                  </div>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className={`badge ${emp.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    ● {emp.status}
                  </span>

                  {isHR && emp.status === 'Active' && (
                    <button
                      className="btn btn-outline-danger btn-sm text-xs"
                      onClick={() => handleDeactivate(emp._id, `${emp.firstName} ${emp.lastName}`)}
                      title="Deactivate Employee"
                    >
                      <i className="bi bi-person-dash"></i> Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-600 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Add New Employee Profile</h5>
              <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Work Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Department</label>
                  <select
                    className="form-select"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Role</label>
                  <select
                    className="form-select"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Administrator</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Salary</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
