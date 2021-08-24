import {ErrorRequestHandler} from "express";
import {LOGGER} from "../config";
import {Container} from "typedi";
import {UNKNOWN_ERROR} from "../errors";

export const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
  const logger = Container.get(LOGGER);
  logger.error(error);
  if (!error.statusCode) {
    error.statusCode = 500;
    error.errorId = UNKNOWN_ERROR;
    error.errorMsg = error.toString();
  }

  return res
    .status(error.statusCode)
    .send({ id: error.errorId, message: error.errorMsg });
}
