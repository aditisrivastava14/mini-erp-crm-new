import mongoose, { Schema } from 'mongoose';
import { ILead, LEAD_STATUS, LEAD_SOURCE } from '@gigflow/shared';

export interface ILeadDocument extends Omit<ILead, 'id'>, mongoose.Document {}

const activityTimelineSchema = new Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const leadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
    },
    source: {
      type: String,
      enum: Object.values(LEAD_SOURCE),
      required: true,
    },
    notes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    activityTimeline: [activityTimelineSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

// Composite indexes for common queries
leadSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
leadSchema.index({ source: 1, createdAt: -1 }); // Filter by source, sort by date
leadSchema.index({ assignedTo: 1, status: 1 }); // Filter by assignee and status
leadSchema.index({ name: 'text' }); // Full-text search on name

export const LeadModel = mongoose.model<ILeadDocument>('Lead', leadSchema);
