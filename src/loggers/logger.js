import fs from "node:fs";
import morgan from "morgan";
import config from "config";

const streamConfig = config.get("morgan.stream");
const morganType = config.get("morgan.type");
const morganStream = streamConfig == "console" ? process.stdout : fs.createWriteStream(streamConfig, { flags: 'a' });
export const logger = morgan(morganType, { stream: morganStream });


