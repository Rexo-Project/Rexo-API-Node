module.exports = (function() {
  var winston = require('winston'),
      log = winston.log,
      Postgres = require('pg').Client,
      pgClient = new Postgres({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_BASE
      }),
      controller = {};
  
  //Set the logging level
  winston.level = process.env.LOG_LEVEL || 'info';
  
  //Connect the to the database
  pgClient.connect(function(err) {
    if(err) {
      log('error', 'Database Conenction Error. :(\n', err);
    } else {
      log('info', 'Database Connected.');
    }
  });

  /*
   * Generates a callback that will return the error or
   * the data from a database query. Currently does not
   * support multiple record queries.
   * @param {string} dataKey - The object key to retrieve
   * from the first row of the data returned.
   * @param {function(err, data)} callback - The callback
   * to run when the query returns.
   */
  var getSimpleCallback = function(dataKey, callback) {
    return function(err, res) {
      if(err) {
        log('error', 'Error Retrieving %s! :(\n', dataKey, err);
      } else {
        log('debug', 'Data Retrieved:\n', res.rows);
      }

      callback(err, (!err ? res.rows[0][dataKey] : null));
    };
  };

  //Queries used to get data, organized by data type.
  var queries = {
    /*
     * Gets a page definition, which includes
     * its required templates, metadata information,
     * and any markdown content.
     * @param {string} slug - The URL slug for the
     * page to retrieve. Aliases will be checked as well.
     * @param {function(err,page)} callback - The
     * callback to run when database query returns.
     */
    page: function(slug, callback) {
      pgClient.query('SELECT * FROM "getPage"($1);', [slug], 
        getSimpleCallback('PageJSON', callback));
    },

    /*
     * Gets a post.
     * @param {string} slug - The URL slug for the post.
     * @param {function(err,post)} callback - The callback
     * to run when the database query returns. 
     */
    post: function(slug, callback) {
      pgClient.query('SELECT * FROM "getPost"($1);', [slug],
        getSimpleCallback('PostJSON', callback));
    }
  };

  /*
   * Gets a data set based on a data type and
   * an optional data key (IE a record Id).
   * @param {string} type - The data type to
   * query. Must match up with one of the object
   * keys of the queries object.
   * @param {various} key - The optional identifier
   * used to get a single record (or subset of records) 
   * for a type. If no key is given, it is assumed the 
   * entire record set is wanted.
   * @param {function(err,data)} callback - The function
   * to call when the data is retrieved. 
   */
  controller.get = function(type, key, callback) {
    log('debug', 'Getting data of type [%s] with key [%s]', type, key);

    if(queries[type]) {
      queries[type](key, callback);
    } else {
      callback(null, null);
    }
  };

  return controller;
})();
