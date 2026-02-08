import * as userService from '../services/user.service.js';
import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'SALON_OWNER') {
            const walletService = await import('../services/wallet.service.js');
            await walletService.reconcileMaturedPoints(req.user.id);
        }
        const user = await userService.getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await userService.updateUserProfile(req.user.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { role, isActive, status } = req.query;
        const query = {};
        if (role) query.role = role.toUpperCase();
        if (typeof isActive !== 'undefined') query.isActive = (isActive === 'true' || isActive === true);
        if (status) query.status = status.toUpperCase();

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        // Return limited fields for privacy
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('firstName lastName email role isActive status agentProfile salonOwnerProfile createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({ users, count: total, page, limit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInternal = async (req, res) => {
    try {
        const user = await userService.createInternalUser(req.user.role, req.user._id, req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSalonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const salon = await userService.updateSalonStatus(id, status);
        res.json(salon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const assignAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId } = req.body;
        const salon = await userService.assignAgent(id, agentId);
        res.json(salon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Public list of active agents (no auth required)
export const getPublicAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'AGENT', isActive: true }).select('firstName lastName email agentProfile');
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
