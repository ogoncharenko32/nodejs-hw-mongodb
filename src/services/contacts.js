import { ContactsCollection } from '../db/models/Contact.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';

export const getAllContacts = async (
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.userId) {
    contactsQuery.where('userId').equals(filter.userId);
  }

  const total = await ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const data = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });

  const paginationData = calcPaginationData({ total, page, perPage });

  return {
    data,
    ...paginationData,
  };
};

export const getContact = async (filter) => ContactsCollection.findOne(filter);
export const getContactById = async (id) => {
  const data = await ContactsCollection.findById(id);
  return data;
};

export const addContact = async (contact) => {
  const data = await ContactsCollection.create(contact);
  return data;
};

export const updateContact = async (filter, payload, options = {}) => {
  const data = await ContactsCollection.findOneAndUpdate(filter, payload, {
    new: true,
    ...options,
  });
  return data;
};

export const deleteContact = async (filter) => {
  const data = await ContactsCollection.findByIdAndDelete(filter);
  return data;
};
