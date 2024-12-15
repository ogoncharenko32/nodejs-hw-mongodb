import createHttpError from 'http-errors';
import * as contactsServices from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const data = await contactsServices.getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
};

export const getContactByIdController = async (req, res, next) => {
  console.log(req);
  const { contactId } = req.params;
  const data = await contactsServices.getContactById(contactId);

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
  const data = await contactsServices.addContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const data = await contactsServices.updateContact(contactId, req.body);

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
  const { contactId } = req.params;
  const data = await contactsServices.deleteContact(contactId);

  if (!data) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).send();
};
