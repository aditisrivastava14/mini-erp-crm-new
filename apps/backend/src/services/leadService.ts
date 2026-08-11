import { LeadModel, ILeadDocument } from '../models/Lead';
import { CreateLeadInput, UpdateLeadInput, LeadStatus, LeadSource, User } from '@gigflow/shared';
import { ApiError } from '../utils/ApiError';
import { httpStatus } from '../constants/httpStatus';
import mongoose from 'mongoose';
import { scoreLead } from '@gigflow/shared';

const decorateLead = (lead: any) => {
  const plainLead = typeof lead?.toObject === 'function' ? lead.toObject() : lead;
  const scoredLead = scoreLead(plainLead);

  return {
    ...plainLead,
    score: scoredLead.score,
    priority: scoredLead.priority,
    scoreBreakdown: scoredLead.breakdown,
    scoreExplanation: scoredLead.explanation,
  };
};

export class LeadService {
  static async createLead(data: CreateLeadInput, performedBy: string, activityEvents: any[] = []): Promise<ILeadDocument> {
    const existingLead = await LeadModel.findOne({ email: data.email });
    if (existingLead) {
      throw new ApiError(httpStatus.CONFLICT, 'Lead with this email already exists');
    }

    const lead = new LeadModel({
      ...data,
      activityTimeline: activityEvents.length
        ? activityEvents
        : [
            {
              action: 'Lead Created',
              performedBy: new mongoose.Types.ObjectId(performedBy),
              timestamp: new Date(),
            },
          ],
    });

    const savedLead = await lead.save();

    // Emit real-time event for lead creation
    try {
      const { emit } = await import('../socket');
      const payload = decorateLead(savedLead);
      emit('lead:created', payload);
      if (performedBy) emit('user:' + performedBy + ':lead:created', payload, `user:${performedBy}`);
    } catch (e) {
      // ignore socket errors
    }

    return decorateLead(savedLead) as ILeadDocument;
  }

  static async getLeads(queryParams: {
    page?: number;
    limit?: number;
    status?: LeadStatus;
    source?: LeadSource;
    search?: string;
    sort?: string;
  }, user: User) {
    const { page = 1, limit = 10, status, source, search, sort } = queryParams;
    const query: any = {};

    if (user.role === 'SALES') {
      query.assignedTo = user.id;
    }

    // Filtering
    if (status) query.status = status;
    if (source) query.source = source;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: latest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'name_desc') sortOption = { name: -1 };

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      LeadModel.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .populate('activityTimeline.performedBy', 'name email'),
      LeadModel.countDocuments(query),
    ]);

    return {
      leads: leads.map((lead) => decorateLead(lead)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLeadById(id: string, user: User): Promise<ILeadDocument> {
    const query: any = { _id: id };
    if (user.role === 'SALES') {
      query.assignedTo = user.id;
    }

    const lead = await LeadModel.findOne(query)
      .populate('assignedTo', 'name email')
      .populate('activityTimeline.performedBy', 'name email');
      
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found or unauthorized');
    }
    return decorateLead(lead) as ILeadDocument;
  }

  static async updateLead(id: string, data: UpdateLeadInput, user: User, activityEvents: any[] = []): Promise<ILeadDocument> {
    const query: any = { _id: id };
    if (user.role === 'SALES') {
      query.assignedTo = user.id;
    }

    const lead = await LeadModel.findOne(query);
      if (!lead) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found or unauthorized');
      }

      // Check if email is being updated and if it conflicts
    if (data.email && data.email !== lead.email) {
      const existingLead = await LeadModel.findOne({ email: data.email });
      if (existingLead) {
        throw new ApiError(httpStatus.CONFLICT, 'Lead with this email already exists');
      }
    }

    if (activityEvents.length) {
      lead.activityTimeline.push(
        ...activityEvents.map((event) => ({
          ...event,
          performedBy: new mongoose.Types.ObjectId(user.id) as any,
        }))
      );
    }

    // Apply updates
    Object.assign(lead, data);
    const savedLead = await lead.save();

    // Emit real-time event for lead update
    try {
      const { emit } = await import('../socket');
      const payload = decorateLead(savedLead);
      emit('lead:updated', payload);
      if (user.id) emit('user:' + user.id + ':lead:updated', payload, `user:${user.id}`);
      if (savedLead.assignedTo) emit('user:' + String(savedLead.assignedTo) + ':lead:assigned', payload, `user:${String(savedLead.assignedTo)}`);
    } catch (e) {
      // ignore socket errors
    }

    return decorateLead(savedLead) as ILeadDocument;
  }

  static async deleteLead(id: string): Promise<void> {
    const lead = await LeadModel.findByIdAndDelete(id);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }
  }
}
