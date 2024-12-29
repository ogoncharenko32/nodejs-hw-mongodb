import createHttpError from 'http-errors';
import * as contactsServices from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';

import { sortByList } from '../db/models/Contact.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactsFilterParams } from '../utils/filters/parseContactsFilterParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, sortByList);
  const filter = parseContactsFilterParams(req.query);
  filter.userId = req.user._id;

  const data = await contactsServices.getAllContacts(
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  );
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { contactId } = req.params;
  const data = await contactsServices.getContact({ _id: contactId, userId });

  if (!data) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const { _id: userId } = req.user;
  const data = await contactsServices.addContact({ ...req.body, userId });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const updateContactController = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { contactId } = req.params;

  const data = await contactsServices.updateContact(
    { _id: contactId, userId },
    req.body,
  );

  if (!data) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact',
    data,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { contactId } = req.params;
  const data = await contactsServices.deleteContact({ _id: contactId, userId });

  if (!data) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).send();
};
