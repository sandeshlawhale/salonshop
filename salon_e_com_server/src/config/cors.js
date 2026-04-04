export const allowedOrigins = [
    "https://www.glowbshine.com",
    "https://glowbshine.com",
    "https://salonshop-rho.vercel.app"
];

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 200
};
