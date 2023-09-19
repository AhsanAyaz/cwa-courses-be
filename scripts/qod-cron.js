const { default: axios } = require("axios");
const { default: axiosRetry } = require("axios-retry");
const createCWALogger = require("../utils/logger");
require("dotenv").config();
const logger = createCWALogger("qod-cron");
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 3 });

const generateQOD = async () => {
  const { QOD_EP_API_KEY } = process.env;
  let resp;
  try {
    resp = await axios.get(
      `https://codewithahsan.dev/api/qod?key=${QOD_EP_API_KEY}`
    );
    logger.debug({ resp: resp.data });
  } catch (e) {
    logger.error(e);
  }
  return resp.data;
};

module.exports = {
  generateQOD,
};
