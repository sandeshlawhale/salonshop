import * as walletService from '../services/wallet.service.js';
import * as commissionSlabService from '../services/commissionSlab.service.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const getPayoutRequests = async (req, res) => {
    try {
        const requests = await WalletTransaction.find({ type: 'PAYOUT_REQUEST' })
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const approvePayout = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await walletService.approvePayout(id);
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
