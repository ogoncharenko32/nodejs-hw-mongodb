import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  console.log(req);
  if (!isValidObjectId(contactId)) {
    return next(createHttpError(400, `${contactId} is not valid id`));
  }
  next();
};
