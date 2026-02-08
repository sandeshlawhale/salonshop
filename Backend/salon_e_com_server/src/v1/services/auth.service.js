// src/v1/services/auth.service.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as notificationService from './notification.service.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (userData) => {
    const { email, password, firstName, lastName, role, phone, agentId } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user object
    const newUserObj = {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: role || 'SALON_OWNER',
        status: (role === 'SALON_OWNER' || !role) ? 'ACTIVE' : 'PENDING' // Salon owners are auto-approved
    };

    // Strict Access Control: Public registration cannot create ADMIN or AGENT
    if (role === 'ADMIN' || role === 'AGENT') {
        throw new Error('Unauthorized role registration. Please contact administrator.');
    }

    // Salon Owner Specific Logic
    if (newUserObj.role === 'SALON_OWNER') {
        newUserObj.salonOwnerProfile = {
            agentId: agentId || null,
            rewardPoints: { locked: 0, unlocked: 0 }
        };
    }

    const user = await User.create(newUserObj);

    if (user) {
        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.role === 'SALON_OWNER' && user.status === 'REJECTED') {
        throw new Error('Your account has been rejected. Please contact support.');
    }

    if (user.role === 'SALON_OWNER' && user.status === 'DEACTIVE') {
        throw new Error('Your account is deactivated. Please contact support.');
    }

    // Note: PENDING users can login to check status, but routes should handle access control

    if (await bcrypt.compare(password, user.passwordHash)) {
        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Invalid credentials');
    }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new Error('Incorrect old password');

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
};
