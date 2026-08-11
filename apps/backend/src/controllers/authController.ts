import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { httpStatus } from '../constants/httpStatus';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { LoginInput, RegisterInput } from '@gigflow/shared';

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, env.jwt.secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, env.jwt.secret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already in use');
  }

  // Force registration role to SALES only, ignoring incoming role.
  const user = await UserModel.create({ name, email, password, role: 'SALES' });
  const { accessToken, refreshToken } = generateTokens({ id: user.id as string, email: user.email, role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: env.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, {
      user: user.toJSON(),
      accessToken,
    }, 'Registration successful')
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens({ id: user.id as string, email: user.email, role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: env.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, {
      user: user.toJSON(),
      accessToken,
    }, 'Login successful')
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(httpStatus.NO_CONTENT);
  const refreshToken = cookies.jwt;

  const user = await UserModel.findOne({ refreshToken });
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.clearCookie('jwt', { httpOnly: true, secure: env.env === 'production', sameSite: 'strict' });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, 'Logged out successfully'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'No refresh token provided');
  }
  const refreshToken = cookies.jwt;

  const user = await UserModel.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwt.secret) as { id: string };
    if (user.id !== decoded.id) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token payload');
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwt.secret, { expiresIn: '15m' });
    res.status(httpStatus.OK).json(
      new ApiResponse(httpStatus.OK, { accessToken }, 'Token refreshed successfully')
    );
  } catch (err) {
    user.refreshToken = undefined;
    await user.save();
    throw new ApiError(httpStatus.FORBIDDEN, 'Refresh token expired');
  }
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, { user: req.user }, 'Current user fetched')
  );
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await UserModel.find().select('-password -refreshToken -__v');
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, users, 'Users fetched successfully')
  );
});
