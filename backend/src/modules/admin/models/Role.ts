import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string; // e.g., 'SUPER_ADMIN', 'MANAGER', 'DESIGNER'
  description?: string;
  permissions: string[]; // Array of granular permission strings
  isSystem: boolean; // True if it's a default system role that cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IRole>('Role', RoleSchema);
