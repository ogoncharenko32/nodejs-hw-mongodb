import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNamber: {
      type: String,
      required: true,
    },
    email: String,
    isFavorite: {
      type: Boolean,
      required: true,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
  },
  {
    timestamps: true,
  },
);

export const ContactsCollection = model('contacts', contactSchema);
