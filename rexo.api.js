var controller = require(__dirname + '/controller.db.js'),
    sendResponse = function(res, callback) {
      res.body = JSON.stringify(res.body);
      callback(null, res);
    };

module.exports = function(event, context, callback) {
  //Required to end invoke on callback but persist the db connection
  context.callbackWaitsForEmptyEventLoop = false;

  var urlParts = event.pathParameters.proxy.split('/'),
      res = {
        statusCode:200,
        body: urlParts,
        headers: {
          "Content-Type": "application/json"
        }
      };
  
  if(urlParts.length > 2) {
    res.statusCode = 404;
    sendResponse(res, callback);
  } else {
    controller.get(urlParts[0], urlParts[1], function(err, data) {
      res.body = data;

      if(err) {
        res.statusCode = 500;
        res.body = err.message;
      } else if(!data) {
        res.statusCode = 404;
      }

      sendResponse(res, callback);
    });    
  }
};