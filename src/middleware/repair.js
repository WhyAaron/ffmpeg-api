const ffmpeg = require('fluent-ffmpeg');
const logger = require('../utils/logger.js')

// repair middleware
function repair(req, res, next) {
  const shouldRepair = req.query.repair === 'true';

  if (shouldRepair) {
    logger.debug(`Doing a basic repair of the file`);
    const savedFile = res.locals.savedFile;
    const fileType = savedFile.split('.').pop();
    const repairedFile = savedFile.replace(new RegExp(`\\.${fileType}$`), `-repaired.${fileType}`);

    repairCorruptedFile(savedFile, repairedFile, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error repairing the file' });
      }

      res.locals.savedFile = repairedFile;
      logger.debug(`${res.locals.savedFile}`);
      next();
    });
  } else {
      logger.debug(`${res.locals.savedFile}`);
      next();
  }
}

// repair small corruptions through copying the file
function repairCorruptedFile(inputFile, outputFile, callback) {
  ffmpeg()
    .input(inputFile)
    .output(outputFile)
    .audioCodec('copy')
    .videoCodec('copy')
    .on('end', callback)
    .on('error', (err) => {
      console.error(`Error repairing the file: ${err}`);
      callback(err);
    })
    .run();
}

module.exports = {
  repair
}