import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const emp = user?.employeeProfile || {};

  const [phone, setPhone] = useState(emp.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [address, setAddress] = useState({
    city: emp.address?.city || '',
    state: emp.address?.state || '',
    zipCode: emp.address?.zipCode || '',
    country: emp.address?.country || 'India',
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: emp.emergencyContact?.name || '',
    relation: emp.emergencyContact?.relation || '',
    phone: emp.emergencyContact?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        phone,
        avatar,
        address,
        emergencyContact,
      });
      toast.success('Profile details saved successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">My Personal Profile</h1>
        <p className="text-muted small mb-0">View your employment records, compensation, and update contact information</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
            <div className="position-relative d-inline-block mx-auto mb-3">
              {avatar ? (
                <img src={avatar} alt={user?.name} className="avatar-xl rounded-circle shadow-sm" />
              ) : (
                <div className="avatar-placeholder-xl rounded-circle bg-primary text-white fw-bold shadow-sm">
                  {user?.name?.[0]}
                </div>
              )}
            </div>

            <h2 className="h5 fw-bold text-dark mb-0">{user?.name}</h2>
            <span className="badge bg-light text-primary border mt-1 mb-2">{emp.employeeId || 'EMP'}</span>
            <p className="text-muted small mb-3">{emp.designation} · {emp.department}</p>

            <div className="p-3 bg-light rounded-3 text-start small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Work Email:</span>
                <span className="text-dark fw-semibold text-truncate max-w-160">{user?.email}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Account Role:</span>
                <span className="badge bg-secondary text-uppercase">{user?.role}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Employment:</span>
                <span className="badge bg-success-subtle text-success">● {emp.status || 'Active'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Joined Date:</span>
                <span className="text-dark">
                  {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h2 className="h5 fw-bold mb-3 border-bottom pb-2">Edit Contact & Personal Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Avatar Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                </div>
              </div>

              <h6 className="fw-bold mt-4 mb-2 small text-uppercase text-muted">Residential Address</h6>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  />
                </div>
              </div>

              <h6 className="fw-bold mt-4 mb-2 small text-uppercase text-muted">Emergency Contact</h6>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Contact Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Relationship</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Spouse / Parent"
                    value={emergencyContact.relation}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Emergency Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3 border-top">
                <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
