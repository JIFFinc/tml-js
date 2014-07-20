/**
 * Copyright (c) 2014 Michael Berkovich, TranslationExchange.com
 *
 *  _______                  _       _   _             ______          _
 * |__   __|                | |     | | (_)           |  ____|        | |
 *    | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___
 *    | | '__/ _` | '_ \/ __| |/ _` | __| |/ _ \| '_ \|  __| \ \/ / __| '_ \ / _` | '_ \ / _` |/ _ \
 *    | | | | (_| | | | \__ \ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/
 *    |_|_|  \__,_|_| |_|___/_|\__,_|\__|_|\___/|_| |_|______/_/\_\___|_| |_|\__,_|_| |_|\__, |\___|
 *                                                                                        __/ |
 *                                                                                       |___/
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var utils    = require('../utils');
var Base    = require('./base');

var Memcache = function() {
  var memcache  = require("memcache");
  this.cache = new memcache.Client();
};

Memcache.prototype = utils.extend(new Base(), {

  name: "memcache",
  read_only: false,

  fetch: function(key, def, callback) {
    this.cache.get(key, function(err, data) {
      var value = null;
      if (err || !data) {
        this.info("Cache miss " + key);
        value = (typeof def == "function") ? def() : def || null;
      } else {
        this.info("Cache hit " + key);
        value = data;
      }
      if(callback) callback(value);
    }.bind(this));
  },

  store: function(key, value, callback) {
    this.info("Cache store " + key);
    return this.cache.set(this.versionedKey(key), JSON.stringify(value), callback);
  },

  del: function(key, callback) {
    this.cache.delete(key, callback);
  },

  exists: function(key, callback){
    this.cache.get(key, function(err, data){
      if (callback) callback(!(err || !data));
    });
  }

});

module.exports = Memcache;