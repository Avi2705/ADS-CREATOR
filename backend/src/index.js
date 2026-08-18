"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/adhunter_db';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const campaign_routes_1 = __importDefault(require("./modules/campaigns/campaign.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const freeAd_routes_1 = __importDefault(require("./modules/creatives/freeAd.routes"));
const b2cRequest_routes_1 = __importDefault(require("./modules/creatives/b2cRequest.routes"));
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ADD CREATOR API is running' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/ai/free-ad', freeAd_routes_1.default);
app.use('/api/b2c-requests', b2cRequest_routes_1.default);
app.use('/api/campaigns', campaign_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
// Connect to MongoDB and start server
mongoose_1.default
    .connect(mongoUri)
    .then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map