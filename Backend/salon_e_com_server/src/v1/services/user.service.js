import User from '../models/User.js';

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const updateUserProfile = async (userId, updateData) => {
    // Avoid updating sensitive fields like password or role directly through this method if not intended
    // For now, we assume controller filters safe fields or we handle it here.
    // Let's rely on Mongoose to handle schema validation, but be careful with role/password.

    // Explicitly exclude role and password from generic profile update to be safe
    delete updateData.role;
    delete updateData.passwordHash;

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    });

    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const createInternalUser = async (creatorRole, creatorId, userData) => {
    const { email, password, firstName, lastName, role, phone, agentId } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) throw new Error('User already exists');

    // Role-based restrictions
    if (creatorRole === 'AGENT') {
        if (role !== 'SALON_OWNER') throw new Error('Agents can only create Salon Owners');
    } else if (creatorRole !== 'ADMIN') {
        throw new Error('Unauthorized to create users internally');
    }

    if (role === 'AGENT' && creatorRole !== 'ADMIN') {
        throw new Error('Only Admin can create Agents');
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash(password, salt);

    const newUserObj = {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role,
        status: 'ACTIVE' // Internally created users are ACTIVE
    };

    if (role === 'AGENT') {
        const crypto = await import('crypto');
        newUserObj.agentProfile = {
            referralCode: crypto.default.randomBytes(4).toString('hex').toUpperCase(),
            commissionRate: userData.commissionRate || 0.10,
            wallet: { pending: 0, available: 0 }
        };
    }

    if (role === 'SALON_OWNER') {
        newUserObj.salonOwnerProfile = {
            agentId: creatorRole === 'AGENT' ? creatorId : (agentId || null),
            rewardPoints: { locked: 0, available: 0 }
        };
    }

    return await User.create(newUserObj);
};

export const updateSalonStatus = async (salonId, status) => {
    const salon = await User.findById(salonId);
    if (!salon || salon.role !== 'SALON_OWNER') throw new Error('Salon Owner not found');

    salon.status = status;
    await salon.save();
    return salon;
};

export const assignAgent = async (salonId, agentId) => {
    const salon = await User.findById(salonId);
    if (!salon || salon.role !== 'SALON_OWNER') throw new Error('Salon Owner not found');

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') throw new Error('Agent not found');

    salon.salonOwnerProfile.agentId = agentId;
    await salon.save();
    return salon;
};
