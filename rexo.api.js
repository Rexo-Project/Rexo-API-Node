var winston = require('winston'),
    log = winston.log,
    controller = require(__dirname + '/controller.db.js'),
    sendResponse = function(res, callback) {
      log('debug', 'Sending Response:\n', res);
      res.body = JSON.stringify(res.body);
      callback(null, res);
    };

//Set the logging level
winston.level = process.env.LOG_LEVEL || 'info';

module.exports = function(event, context, callback) {
  //Required to end invoke on callback but persist the db connection
  context.callbackWaitsForEmptyEventLoop = false;

  log('debug', 'Request for %s received.', event.path);

  var urlParts = event.pathParameters.proxy.split('/'),
      res = {
        statusCode: 200,
        body: urlParts,
        headers: {
          "Content-Type": "application/json"
        }
      };
  
  //Currently only supports 2 URL levels deep
  if(urlParts.length > 2) {
    res.statusCode = 404;
    sendResponse(res, callback);
  } else {
    controller.get(urlParts[0], urlParts[1], function(err, data) {
      res.body = data;

      if(err) {
        log('error', 'Error processing request! :(\n', err);
        res.statusCode = 500;
        res.body = err.message;
      } else if(!data) {
        res.statusCode = 404;
      }

      sendResponse(res, callback);
    });    
  }
};