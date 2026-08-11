import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { httpStatus } from '../constants/httpStatus';
import { LeadModel } from '../models/Lead';
import { IActivityTimeline } from '@gigflow/shared';

type LeadActivityAction = 'create' | 'update';

export const logLeadActivity = (action: LeadActivityAction) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      if (action === 'create') {
        req.leadActivityEvents = [
          {
            action: 'Lead Created',
            timestamp: new Date(),
            performedBy: req.user.id,
          },
        ];

        return next();
      }

      const { id } = req.params;
      const existingLead = await LeadModel.findById(id).lean();

      if (!existingLead) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
      }

      const events: IActivityTimeline[] = [];
      const updateKeys = ['name', 'email', 'source', 'status', 'notes', 'assignedTo'] as const;
      const hasAnyChange = updateKeys.some((key) => {
        const incomingValue = req.body[key];
        if (incomingValue === undefined) return false;
        return String(incomingValue) !== String((existingLead as any)[key] ?? '');
      });

      if (hasAnyChange) {
        events.push({
          action: 'Lead Updated',
          timestamp: new Date(),
          performedBy: req.user.id,
        });
      }

      if (req.body.status && req.body.status !== existingLead.status) {
        events.push({
          action: `Status changed from ${existingLead.status} to ${req.body.status}`,
          timestamp: new Date(),
          performedBy: req.user.id,
        });
      }

      if (typeof req.body.notes === 'string' && req.body.notes.trim()) {
        const previousNotes = existingLead.notes?.trim() || '';
        if (!previousNotes && req.body.notes.trim()) {
          events.push({
            action: 'Notes Added',
            timestamp: new Date(),
            performedBy: req.user.id,
          });
        } else if (previousNotes !== req.body.notes.trim()) {
          events.push({
            action: 'Notes Updated',
            timestamp: new Date(),
            performedBy: req.user.id,
          });
        }
      }

      req.leadActivityEvents = events;
      next();
    } catch (error) {
      next(error);
    }
  };
};