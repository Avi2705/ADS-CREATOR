import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    actorId: mongoose.Types.ObjectId;
    actorName: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
export default _default;
//# sourceMappingURL=AuditLog.d.ts.map