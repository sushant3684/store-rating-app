import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const UpdatePasswordModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
            setErrors({ newPassword: 'password must be 8-16 chars' });
            return;
        }

        setLoading(true);

        try {
            await authAPI.updatePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success('password updated');
            onSuccess();
        } catch (error) {
            const errorData = error.response?.data;
            toast.error(errorData?.message || 'failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Change Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password *</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            placeholder="current password"
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password *</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            placeholder="new password"
                        />
                        {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                        <small>8-16 chars, uppercase + special char</small>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="confirm password"
                        />
                        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordModal;
