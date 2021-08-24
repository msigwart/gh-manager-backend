import {RequestHandler} from "express";
import {LOGGER} from "../config";
import {Container} from "typedi";

export const log: RequestHandler = (req, res, next) => {
  const logger = Container.get(LOGGER);
  logger.info(`${req.method} ${req.path}, payload: ${JSON.stringify(req.body)}`);
  next();
}
