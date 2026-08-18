import mongoose, { Document } from 'mongoose';
export interface ICreative extends Document {
    tenantId: mongoose.Types.ObjectId;
    campaignId: mongoose.Types.ObjectId;
    name: string;
    type: 'IMAGE' | 'VIDEO';
    assetUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    publishStatus: 'UNPUBLISHED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
    platformsPublished: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICreative, {}, {}, {}, Document<unknown, {}, ICreative, {}, mongoose.DefaultSchemaOptions> & ICreative & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICreative>;
export default _default;
//# sourceMappingURL=creative.model.d.ts.map