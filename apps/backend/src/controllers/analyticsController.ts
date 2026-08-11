import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { httpStatus } from '../constants/httpStatus';
import { AnalyticsService } from '../services/analyticsService';

export const getAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const data = await AnalyticsService.getOverview(user);
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, data, 'Analytics overview fetched successfully')
  );
});