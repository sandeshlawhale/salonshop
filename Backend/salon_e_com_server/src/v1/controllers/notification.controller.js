import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req, res) => {
    try {
        const result = await notificationService.getUserNotifications(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        res.json(notification);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const notification = await notificationService.createNotification(req.body);
        // Here we could also trigger a push notification via socket.io or external service
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
