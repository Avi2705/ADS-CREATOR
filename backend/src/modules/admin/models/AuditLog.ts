import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId; // User who performed the action
  actorName: string;
  action: string; // e.g., 'UPDATE_SUBSCRIPTION', 'CREATE_CUSTOMER'
  entity: string; // e.g., 'User', 'Subscription'
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Logs are immutable, no updatedAt needed
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
