import * as walletService from '../services/wallet.service.js';
import * as commissionSlabService from '../services/commissionSlab.service.js';
import * as settlementService from '../services/settlement.service.js';
import Settlement from '../models/Settlement.js';
import User from '../models/User.js';

// REMOVED: getPayoutRequests (Legacy)
// REMOVED: approvePayout (Legacy)

export const getAllSettlements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, month } = req.query;

        let query = {};
        if (month) query.month = month;
        if (search) {
            query.$or = [
                { setid: { $regex: search, $options: 'i' } },
                // Note: Searching by populated field (agentId.firstName/lastName) in Mongoose 
                // requires either aggregation or a two-step query. For simplicity here, 
                // we'll use a regex on setid and handle name search if possible.
                // A better approach is to find matching users first.
            ];

            // Search users by name first
            const matchingUsers = await User.find({
                role: 'AGENT',
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            if (matchingUsers.length > 0) {
                query.$or.push({ agentId: { $in: matchingUsers.map(u => u._id) } });
            }
        }

        const [settlements, total] = await Promise.all([
            Settlement.find(query)
                .populate('agentId', 'firstName lastName email')
                .sort({ settledAt: -1 })
                .skip(skip)
                .limit(limit),
            Settlement.countDocuments(query)
        ]);

        res.json({
            items: settlements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSlab = async (req, res) => {
    try {
        const slab = await commissionSlabService.createSlab(req.body);
        res.status(201).json(slab);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSlabs = async (req, res) => {
    try {
        const slabs = await commissionSlabService.getAllSlabs();
        res.json(slabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSlab = async (req, res) => {
    try {
        const { id } = req.params;
        const slab = await commissionSlabService.updateSlab(id, req.body);
        res.json(slab);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const triggerAutoDisbursement = async (req, res) => {
    try {
        const results = await settlementService.processMonthlySettlement();
        res.json({
            message: 'Automated monthly settlement batch completed',
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
