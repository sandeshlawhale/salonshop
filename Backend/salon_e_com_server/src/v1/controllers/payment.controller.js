import razorpay from '../../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { updateOrderStatus } from '../services/order.service.js';

/**
 * Create a Razorpay order
 * POST /api/v1/payments/create-order
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, orderId } = req.body;

        console.log('[payment] Creating Razorpay order:', { amount, currency, receipt, orderId });

        if (!amount) {
            console.error('[payment] Error: Amount is required');
            return res.status(400).json({ message: 'Amount is required' });
        }

        if (!razorpay || razorpay.isEnabled === false) {
            console.warn('[payment] Razorpay is not configured.');
            return res.status(503).json({ message: 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        console.log('[payment] Razorpay options:', options);

        const response = await razorpay.orders.create(options);
        console.log('[payment] Razorpay order created:', response.id);

        // Optionally attach the razorpay order id to our internal Order for tracking
        if (orderId) {
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentDetails = order.paymentDetails || {};
                    order.paymentDetails.paymentGatewayOrderId = response.id;
                    await order.save();
                    console.log('[payment] Internal order updated with gateway order id');
                }
            } catch (err) {
                console.warn('[payment] Failed to update internal order with gateway id:', err.message);
            }
        }

        res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error('[payment] Razorpay SDK Error:', error);
        if (error.error) console.error('[payment] Error Detail:', error.error);

        res.status(500).json({
            message: 'Razorpay order creation failed',
            error: error.message,
            detail: error.error ? error.error.description : null
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our internal order ID
        } = req.body;

        console.log('[payment] Verifying payment:', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        });

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.warn('[payment] Razorpay secret missing; cannot verify signature.');
            return res.status(503).json({ message: 'Payment verification not configured (missing RAZORPAY_KEY_SECRET).' });
        }

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        console.log('[payment] Signature verification:', {
            received: razorpay_signature,
            generated: expectedSign,
            match: razorpay_signature === expectedSign
        });

        if (razorpay_signature === expectedSign) {
            // Payment verified
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentStatus = 'PAID';
                    order.paymentDetails = order.paymentDetails || {};
                    order.paymentDetails.razorpay_order_id = razorpay_order_id;
                    order.paymentDetails.razorpay_payment_id = razorpay_payment_id;
                    order.paymentDetails.razorpay_signature = razorpay_signature;
                    await order.save();
                    console.log('[payment] Order status updated to PAID:', orderId);

                    // Update order status to PAID
                    await updateOrderStatus(orderId, 'PAID');
                }
            }
            return res.status(200).json({ message: 'Payment verified successfully', status: 'success' });
        } else {
            console.warn('[payment] Invalid signature');
            return res.status(400).json({ message: 'Invalid signature', status: 'failure' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};


