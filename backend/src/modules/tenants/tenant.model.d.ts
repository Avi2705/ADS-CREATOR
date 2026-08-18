import mongoose, { Document } from 'mongoose';
export interface ITenant extends Document {
    name: string;
    type: 'B2C' | 'B2B';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITenant, {}, {}, {}, Document<unknown, {}, ITenant, {}, mongoose.DefaultSchemaOptions> & ITenant & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITenant>;
export default _default;
//# sourceMappingURL=tenant.model.d.ts.map