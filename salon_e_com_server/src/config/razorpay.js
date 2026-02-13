import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

let razorpayInstance;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  console.log('[razorpay] 🔌 Initializing Real Razorpay SDK');
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  razorpayInstance.isEnabled = true;
} else {
  console.warn('[razorpay] ⚠️  Missing API Keys - Using Mock Mode');
  razorpayInstance = {
    isEnabled: true,
    isMock: true,
    orders: {
      create: async (options) => {
        console.log('[razorpay] 📦 Creating mock order with amount:', options.amount);

        const mockOrder = {
          id: `order_${Date.now()}_mock`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt || null,
          status: 'created',
          attempts: 0,
          notes: {},
          created_at: Math.floor(Date.now() / 1000)
        };

        console.log('[razorpay] ✅ Mock order created:', mockOrder.id);
        return mockOrder;
      }
    }
  };
}

export default razorpayInstance;
