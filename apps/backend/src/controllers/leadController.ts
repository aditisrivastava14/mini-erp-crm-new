import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { LeadService } from '../services/leadService';
import { httpStatus } from '../constants/httpStatus';
import { CreateLeadInput, UpdateLeadInput, LeadStatus, LeadSource } from '@gigflow/shared';

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as CreateLeadInput;
  const user = req.user!;

  if (user.role === 'SALES') {
    data.assignedTo = user.id;
  } else if (!data.assignedTo) {
    data.assignedTo = user.id;
  }

  const lead = await LeadService.createLead(data, user.id, req.leadActivityEvents);
  
  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, lead, 'Lead created successfully')
  );
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const queryParams = {
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    status: req.query.status as LeadStatus | undefined,
    source: req.query.source as LeadSource | undefined,
    search: req.query.search as string | undefined,
    sort: req.query.sort as string | undefined,
  };

  const result = await LeadService.getLeads(queryParams, user);
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, result, 'Leads fetched successfully')
  );
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  
  const lead = await LeadService.getLeadById(id, user);
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, lead, 'Lead fetched successfully')
  );
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body as UpdateLeadInput;
  const user = req.user!;

  if (user.role === 'SALES' && data.assignedTo) {
    // SALES cant assign to others
    data.assignedTo = user.id;
  }

  const lead = await LeadService.updateLead(id, data, user, req.leadActivityEvents);
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, lead, 'Lead updated successfully')
  );
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await LeadService.deleteLead(id);
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, null, 'Lead deleted successfully')
  );
});
