import { ContactsCollection } from '../db/models/Contact.js';

export const getAllContacts = async () => {
  const data = await ContactsCollection.find();
  return data;
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
