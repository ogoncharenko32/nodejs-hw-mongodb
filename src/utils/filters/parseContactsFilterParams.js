import { contactTypeList } from '../../constants/contacts.js';

const parseBoolean = (value) => {
  if (typeof value !== 'string') return;

  const parsedValue = JSON.parse(value);

  return parsedValue;
};

const parseType = (value) => {
  if (typeof value !== 'string') return;

  const parsedValue = (value) => contactTypeList.includes(value);

  if (parsedValue(value)) return value;
};

export const parseContactsFilterParams = ({ isFavorite, type }) => {
  const parsedType = parseType(type);
  const parsedIsFavorite = parseBoolean(isFavorite);
  return {
    isFavorite: parsedIsFavorite,
    contactType: parsedType,
  };
};
