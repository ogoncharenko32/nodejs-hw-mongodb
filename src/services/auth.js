import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import { SessionCollection } from '../db/models/Session.js';
import { randomBytes } from 'crypto';
import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/auth.js';

const createSessionData = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + accessTokenLifetime,
  refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
});

export const register = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  const hashPassword = await bcrypt.hash(payload.password, 10);

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const newUser = await UsersCollection.create({
    ...payload,
    password: hashPassword,
  });
  return {
    name: newUser.name,
    email: newUser.email,
    _id: newUser._id,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
};

export const login = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: user._id,
    ...sessionData,
  });
};

export const refresh = async (payload) => {
  const oldSession = await SessionCollection.findOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });
  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (Date.now() > oldSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Reefresh token expired');
  }

  await SessionCollection.deleteOne({ _id: payload.sessionId });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: oldSession.userId,
    ...sessionData,
  });
};

export const logout = async ({ sessionId }) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const getSession = async (filter) =>
  await SessionCollection.findOne(filter);

export const getUser = async (filter) => await UsersCollection.findOne(filter);
