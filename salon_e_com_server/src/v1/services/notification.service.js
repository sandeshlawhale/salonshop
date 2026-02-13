import Notification from '../models/Notification.js';

export const createNotification = async (data) => {
    return await Notification.create(data);
};

export const getUserNotifications = async (userId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await Notification.countDocuments({ userId });
    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { notifications, count: total, page, limit };
};

export const markAsRead = async (notificationId) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        throw new Error('Notification not found');
    }
    return notification;
};
