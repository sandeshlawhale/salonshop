import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.id, req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const result = await orderService.getMyOrders(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAgentOrders = async (req, res) => {
    try {
        const orders = await orderService.getAgentOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssignedOrders = async (req, res) => {
    try {
        const result = await orderService.getAssignedOrders(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const assignAgent = async (req, res) => {
    try {
        const { agentId } = req.body;
        const order = await orderService.assignAgent(req.params.id, agentId);
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
