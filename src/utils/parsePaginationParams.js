const parseNamber = (number, defaultValue) => {
  if (typeof number !== 'string') {
    return defaultValue;
  }
  const parsedNumber = parseInt(number);

  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }
  return parsedNumber;
};

export const parsePaginationParams = ({ page, perPage }) => {
  const parsedPage = parseNamber(page, 1);
  const parsedPerPage = parseNamber(perPage, 10);

  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};
