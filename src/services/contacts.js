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

  console.log(filter);
  if (filter.isFavorite) {
    contactsQuery.where('isFavorite').equals(filter.isFavorite);
  }

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  const data = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });

  const total = await ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const paginationData = calcPaginationData({ total, page, perPage });
  return {
    data,
    ...paginationData,
  };
};

export const getContactById = async (id) => {
  const data = await ContactsCollection.findById(id);
  return data;
};

export const addContact = async (contact) => {
  const data = await ContactsCollection.create(contact);
  return data;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const data = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      ...options,
    },
  );
  return data;
};

export const deleteContact = async (contactId) => {
  const data = await ContactsCollection.findByIdAndDelete({ _id: contactId });
  return data;
};
