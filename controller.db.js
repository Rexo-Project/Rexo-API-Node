module.exports = (function() {
  var Postgres = require('pg').Client,
      pgClient = new Postgres({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_BASE
      }),
      controller = {};
  
  //Connect the to the database
  pgClient.connect(function(err) {
    if(err) {
      console.log('Conenction to Postgres Failed: ', err);
    } else {
      console.log('Postgres Connected');
    }
  });

  var getSimpleCallback = function(dataKey, callback) {
    return function(err, res) {
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
     * page to retrieve.
     * @param {function(err,page)} callback - The
     * callback to run when database query returns.
     */
    page: function(slug, callback) {
      pgClient.query('SELECT * FROM "getPage"($1);', [slug], 
        getSimpleCallback('PageJSON', callback));
    },

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
    if(queries[type]) {
      queries[type](key, callback);
    } else {
      callback(null, null);
    }
  };

  return controller;
})();
