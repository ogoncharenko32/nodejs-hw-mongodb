import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import { SessionCollection } from '../db/models/Session.js';
import { randomBytes } from 'crypto';
import {
  SMTP,
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/auth.js';

import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { sendEmail } from '../utils/sendEmail.js';
import { TEMPLATES_DIR } from '../constants/index.js';

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

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'resetPassword.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-pwd?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    console.log(error.message);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ token, password }) => {
  let entries;

  try {
    entries = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await UsersCollection.updateOne(
    {
      _id: entries.sub,
    },
    {
      password: hashPassword,
    },
  );

  await SessionCollection.deleteOne({ userId: user._id });
};
