import * as agentService from '../services/agent.service.js';
import * as walletService from '../services/wallet.service.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const getDashboard = async (req, res) => {
    try {
        const stats = await agentService.getAgentStats(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssignedSalons = async (req, res) => {
    try {
        const stats = await agentService.getAgentStats(req.user._id);
        res.json(stats.salons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const requestPayout = async (req, res) => {
    try {
        const { amount } = req.body;
        const transaction = await walletService.requestPayout(req.user._id, amount);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getMyPayouts = async (req, res) => {
    try {
        const payouts = await WalletTransaction.find({
            userId: req.user._id,
            type: 'PAYOUT_REQUEST'
        })
            .sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
