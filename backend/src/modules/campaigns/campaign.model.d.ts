import mongoose, { Document } from 'mongoose';
export interface ICampaign extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    platforms: string[];
    budget: number;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICampaign, {}, {}, {}, Document<unknown, {}, ICampaign, {}, mongoose.DefaultSchemaOptions> & ICampaign & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICampaign>;
export default _default;
//# sourceMappingURL=campaign.model.d.ts.map