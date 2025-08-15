import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    user: {},
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    date_of_birth: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      
      // Set image preview from profile_image field
      const profileImageUrl = response.data.profile_image || response.data.user?.profile_image;
      if (profileImageUrl) {
        setImagePreview(profileImageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      
      // Add user fields
      formData.append('first_name', profile.user?.first_name || '');
      formData.append('last_name', profile.user?.last_name || '');
      formData.append('username', profile.user?.username || '');
      formData.append('email', profile.user?.email || '');
      
      // Add profile fields
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');
      formData.append('city', profile.city || '');
      formData.append('state', profile.state || '');
      formData.append('pincode', profile.pincode || '');
      formData.append('date_of_birth', profile.date_of_birth || '');
      
      // Add image if selected
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }
      
      const response = await userAPI.updateProfile(formData);
      
      // Update local state
      setProfile(response.data);
      
      // Update auth context with the updated user data including profile image
      const updatedUser = {
        ...response.data.user,
        profile_image: response.data.profile_image || response.data.user?.profile_image
      };
      updateUser(updatedUser);
      
      // Update image preview
      if (response.data.profile_image) {
        setImagePreview(response.data.profile_image);
      }
      
      // Clear file input
      setProfileImage(null);
      const fileInput = document.getElementById('profileImageInput');
      if (fileInput) fileInput.value = '';
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '120px', minHeight: '100vh'}}>
        <div className="container text-center py-5">
          <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
          <h2>Access Required</h2>
          <p className="text-muted">Please login to view your profile</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            <i className="fas fa-sign-in-alt me-2"></i>Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{paddingTop: '120px', minHeight: '100vh'}} className="d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Profile...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '120px', minHeight: '100vh'}}>
      <div className="container py-5">
        <div className="row">
          {/* Profile Image Section */}
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body text-center">
                <div className="position-relative d-inline-block mb-3">
                  <div 
                    className="rounded-circle overflow-hidden border mx-auto d-flex align-items-center justify-content-center"
                    style={{width: '150px', height: '150px', cursor: 'pointer'}}
                    onClick={() => document.getElementById('profileImageInput').click()}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 w-100 bg-light">
                        <i className="fas fa-user fa-3x text-muted"></i>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn btn-primary btn-sm rounded-circle position-absolute"
                    style={{bottom: '10px', right: '10px', width: '35px', height: '35px'}}
                    onClick={() => document.getElementById('profileImageInput').click()}
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                  <input 
                    type="file" 
                    id="profileImageInput" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{display: 'none'}} 
                  />
                </div>
                <h4>{profile.user?.first_name} {profile.user?.last_name}</h4>
                <p className="text-muted">@{profile.user?.username}</p>
                <p className="text-muted small">{profile.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Personal Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.user?.first_name || ''}
                        onChange={(e) => setProfile({
                          ...profile, 
                          user: {...profile.user, first_name: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.user?.last_name || ''}
                        onChange={(e) => setProfile({
                          ...profile, 
                          user: {...profile.user, last_name: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.user?.username || ''}
                        onChange={(e) => setProfile({
                          ...profile, 
                          user: {...profile.user, username: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profile.user?.email || ''}
                        onChange={(e) => setProfile({
                          ...profile, 
                          user: {...profile.user, email: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={profile.date_of_birth || ''}
                        onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={profile.address || ''}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.city || ''}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.state || ''}
                        onChange={(e) => setProfile({...profile, state: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.pincode || ''}
                        onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;