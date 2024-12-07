import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import dotenv from 'dotenv';

import { getEnvVar } from '../utils/getEnvVar.js';
import * as contactsServices from './services/contacts.js';

dotenv.config();

const PORT = Number(getEnvVar('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    const data = await contactsServices.getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    console.log(req);
    const { contactId } = req.params;
    const data = await contactsServices.getContactById(contactId);

    if (!data) {
      return res.status(404).json({
        message: `Contact not found'`,
      });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data,
    });
  });

  app.get('*', (req, res) => {
    res.status(404).json({
      message: 'Not Found',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
