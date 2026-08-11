import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { httpStatus } from '../constants/httpStatus';
import mongoose from 'mongoose';

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const healthData = {
    service: 'GigFlow Backend',
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, healthData, 'Health check passed'));
});
