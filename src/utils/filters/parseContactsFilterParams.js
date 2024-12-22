import { contactTypeList } from '../../constants/contacts.js';

const parseBoolean = (value) => {
  if (typeof value !== 'string') return;

  // const parsedValue = JSON.parse(value);

  return value;
};

const parseType = (value) => {
  if (typeof value !== 'string') return;

  const parsedValue = (value) => contactTypeList.includes(value);

  if (parsedValue(value)) return value;
};

export const parseContactsFilterParams = ({ isFavourite, type }) => {
  const parsedType = parseType(type);
  const parsedIsFavourite = parseBoolean(isFavourite);
  return {
    isFavourite: parsedIsFavourite,
    contactType: parsedType,
  };
};
