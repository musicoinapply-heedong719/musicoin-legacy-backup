const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const moment = require('moment');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');

const LOGS_DIR = process.env.LOG_PATH || path.join(__dirname, '../logs');

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// file size limit 10M
const LOGGER_COMMON_CONFIG = {
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
    prepend: true,
    datePattern: 'YYYY-MM-DD',
    maxsize: "10m",
    maxFiles: "14d",
    colorize: false,
    json: false,
    handleExceptions: true,
};

function generateLogger(level) {
    let transport;
    
    if(process.env['NODE_ENV'] !== 'production'){
        transport = new winston.transports.Console({
            name: level,
            level: level,
            ...LOGGER_COMMON_CONFIG,
            colorize: true,
        });
    }else{
        transport = new DailyRotateFile({
            name: level,
            level: level,
            filename: `${LOGS_DIR}/${level}-%DATE%.log`,
            ...LOGGER_COMMON_CONFIG,
        });
    }
    const config = {
        level,
        transports: [
            transport
        ],
        exitOnError: false,
    };
    return new winston.Logger(config);
}

const error_logger = generateLogger("error");
const debug_logger = generateLogger("debug");
const info_logger = generateLogger("info");
const warn_logger = generateLogger("warn");

const Logger = {

    initRequestLogger: function (app) {
        app.use(morgan(function (tokens, req, res) {
            const method = req.method;
            const url = req.originalUrl;
            let request_params = {
                ...req.body
            };
            if (request_params.password) {
                request_params.password = "******";
            }
            request_params = JSON.stringify(request_params);
            return [
                method,
                url,
                "params:",
                request_params,
                tokens.status(req, res),
                tokens['response-time'](req, res), 'ms'
            ].join(' ')
        }, {
            stream: {
                write: function (message) {
                    info_logger.info(message.trim())
                }
            }
        }));
    },
    info: function (msg, args) {
        info_logger.info(msg, args);
    },
    warn: function (msg, args) {
        warn_logger.warn(msg, args);
    },
    debug: function (msg, args) {
        debug_logger.debug(msg, args);
    },
    error: function (msg, args) {
        error_logger.error(msg, args);
    },
};
module.exports = Logger;