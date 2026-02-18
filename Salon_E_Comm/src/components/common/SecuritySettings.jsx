
import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '../ui/dialog';
import { authAPI } from '../../utils/apiClient';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleShowPassword = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated successfully");
            setIsPasswordModalOpen(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Password change failed:", error);
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500 mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-neutral-900/20">
                    <Lock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Security <span className="text-emerald-600">Configuration</span></h2>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Manage your account security and access protocols</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Password Change Card */}
                <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="font-black text-neutral-900 tracking-wide text-sm">Change Password</h3>
                        <p className="text-xs text-neutral-500 font-medium max-w-md">Update your password regularly to maintain optimal security posture.</p>
                    </div>
                    <Button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-sm transition-all"
                    >
                        Change Password
                    </Button>
                </div>

                {/* 2FA Toggle Card (Disabled) */}
                <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-75">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h3 className="font-black text-neutral-900 tracking-wide text-sm">Two-Factor Auth</h3>
                            <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-[9px] font-black uppercase tracking-widest rounded-md">Expected Soon</span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium max-w-md">Add an extra layer of security to your account access.</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 cursor-not-allowed">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-neutral-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <DialogHeader>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center mb-4 border border-white/10">
                                <Shield className="text-emerald-400" size={24} />
                            </div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Update Password</DialogTitle>
                            <DialogDescription className="text-neutral-400 text-xs font-medium mt-2">
                                Enter your current password and a new strong password to update your credentials.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 bg-white space-y-6">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.old ? "text" : "password"}
                                        name="oldPassword"
                                        value={passwords.oldPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowPassword('old')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? "text" : "password"}
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowPassword('new')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwords.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowPassword('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="font-bold text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-neutral-900 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-lg shadow-neutral-900/10 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
