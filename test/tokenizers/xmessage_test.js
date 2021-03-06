/**
 * Copyright (c) 2017 Translation Exchange, Inc.
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

var XMessageTokenizer = require('../../lib/tokenizers/xmessage.js');
var assert = require('assert');
var helper = require("../test_helper");

describe('XMessageTokenizer', function () {
  describe('parsing', function () {
    it('should properly parse various xmessage syntax', function (done) {
      helper.models.application({locales: ["en"]}, function (err, app) {
        var language = app.getLanguage("en");

        var messages = [
          {
            message: "Hello World",
            tree: [{"type": "trans", "value": "Hello World"}],
            test_cases: [
              {tokens: [], result: "Hello World"}
            ]
          },
          {
            message: "{0} members",
            tree: [{"type": "param", "index": 0}, {"type": "trans", "value": " members"}],
            test_cases: [
              {tokens: [5], result: "5 members"}
            ]
          },

          {
            message: "{0} tagged himself/herself in {1,choice,singular#{1,number} {2,map,photo#photo|video#video}|plural#{1,number} {2,map,photo#photos|video#videos}}.",
            tree: [{"type":"param","index":0},{"type":"trans","value":" tagged himself/herself in "},{"index":1,"type":"choice","styles":[{"key":"singular","items":[{"type":"number","index":1},{"type":"trans","value":" "},{"index":2,"type":"map","styles":[{"key":"photo","items":[{"type":"trans","value":"photo"}]},{"key":"video","items":[{"type":"trans","value":"video"}]}]}]},{"key":"plural","items":[{"type":"number","index":1},{"type":"trans","value":" "},{"index":2,"type":"map","styles":[{"key":"photo","items":[{"type":"trans","value":"photos"}]},{"key":"video","items":[{"type":"trans","value":"videos"}]}]}]}]},{"type":"trans","value":"."}],
            test_cases: [
              {tokens: ['Michael', 1, 'photo'], result: "Michael tagged himself/herself in 1 photo."},
              {tokens: ['Michael', 5, 'photo'], result: "Michael tagged himself/herself in 5 photos."},
              {tokens: ['Michael', 1, 'video'], result: "Michael tagged himself/herself in 1 video."},
              {tokens: ['Michael', 5, 'video'], result: "Michael tagged himself/herself in 5 videos."}
            ]

          },

          {
            message: "{0} tagged himself/herself in {1,number} {2,map,photo#{1,choice,singular#photo|plural#photos}|video#{1,choice,singular#video|plural#videos}}.",
            tree: [{"type":"param","index":0},{"type":"trans","value":" tagged himself/herself in "},{"type":"number","index":1},{"type":"trans","value":" "},{"index":2,"type":"map","styles":[{"key":"photo","items":[{"index":1,"type":"choice","styles":[{"key":"singular","items":[{"type":"trans","value":"photo"}]},{"key":"plural","items":[{"type":"trans","value":"photos"}]}]}]},{"key":"video","items":[{"index":1,"type":"choice","styles":[{"key":"singular","items":[{"type":"trans","value":"video"}]},{"key":"plural","items":[{"type":"trans","value":"videos"}]}]}]}]},{"type":"trans","value":"."}],
            test_cases: [
              {tokens: ['Michael', 1, 'photo'], result: "Michael tagged himself/herself in 1 photo."},
              {tokens: ['Michael', 5, 'photo'], result: "Michael tagged himself/herself in 5 photos."},
              {tokens: ['Michael', 1, 'video'], result: "Michael tagged himself/herself in 1 video."},
              {tokens: ['Michael', 5, 'video'], result: "Michael tagged himself/herself in 5 videos."}
            ]

          },

          {
            message: "{0} {0,choice,singular#member|plural#members}",
            tree: [{"type": "param", "index": 0}, {"type": "trans", "value": " "}, {
              "index": 0,
              "type": "choice",
              "styles": [{"key": "singular", "items": [{"type": "trans", "value": "member"}]}, {
                "key": "plural",
                "items": [{"type": "trans", "value": "members"}]
              }]
            }],
            test_cases: [
              {tokens: [1], result: "1 member"},
              {tokens: [5], result: "5 members"}
            ]
          },

          {
            message: "{:numViews,number,integer} {:numViews,choice,singular#view|plural#views}",
            tree: [{"index": ":numViews", "type": "number", "value": "integer"}, {
              "type": "trans",
              "value": " "
            }, {
              "index": ":numViews",
              "type": "choice",
              "styles": [{"key": "singular", "items": [{"type": "trans", "value": "view"}]}, {
                "key": "plural",
                "items": [{"type": "trans", "value": "views"}]
              }]
            }],
            test_cases: [
              {tokens: {numViews: 1}, result: "1 view"},
              {tokens: {numViews: 4}, result: "4 views"}
            ]
          },

          {
            message: "You have {0,choice,singular#{2,anchor,text#{0,number} new {1,map,conn#connection|inv#invite}}|plural#{2,anchor,text#{0,number} new {1,map,conn#connections|inv#invites}}}.",
            tree: [{"type": "trans", "value": "You have "}, {
              "index": 0,
              "type": "choice",
              "styles": [{
                "key": "singular",
                "items": [{
                  "index": 2,
                  "type": "anchor",
                  "styles": [{
                    "key": "text",
                    "items": [{"type": "number", "index": 0}, {"type": "trans", "value": " new "}, {
                      "index": 1,
                      "type": "map",
                      "styles": [{"key": "conn", "items": [{"type": "trans", "value": "connection"}]}, {
                        "key": "inv",
                        "items": [{"type": "trans", "value": "invite"}]
                      }]
                    }]
                  }]
                }]
              }, {
                "key": "plural",
                "items": [{
                  "index": 2,
                  "type": "anchor",
                  "styles": [{
                    "key": "text",
                    "items": [{"type": "number", "index": 0}, {"type": "trans", "value": " new "}, {
                      "index": 1,
                      "type": "map",
                      "styles": [{"key": "conn", "items": [{"type": "trans", "value": "connections"}]}, {
                        "key": "inv",
                        "items": [{"type": "trans", "value": "invites"}]
                      }]
                    }]
                  }]
                }]
              }]
            }, {"type": "trans", "value": "."}],
            test_cases: [
              {tokens: [1, 'conn', 'google.com'], result: "You have <a href='google.com'>1 new connection</a>."},
              {tokens: [2, 'conn', 'google.com'], result: "You have <a href='google.com'>2 new connections</a>."},
              {tokens: [3, 'inv', 'google.com'], result: "You have <a href='google.com'>3 new invites</a>."}
            ]
          },

          {
            message: "You have {0,anchor,text#messages}.",
            tree: [{"type":"trans","value":"You have "},{"index":0,"type":"anchor","styles":[{"key":"text","items":[{"type":"trans","value":"messages"}]}]},{"type":"trans","value":"."}],
            test_cases: [
              {tokens: ['google.com'], result: "You have <a href='google.com'>messages</a>."},
              {tokens: ['yahoo.com'], result: "You have <a href='yahoo.com'>messages</a>."}
            ]
          },

          {
            message: "You have {:link,link,text#messages}.",
            tree: [{"type":"trans","value":"You have "},{"index":":link","type":"link","styles":[{"key":"text","items":[{"type":"trans","value":"messages"}]}]},{"type":"trans","value":"."}],
            test_cases: [
              {tokens: {link: {href: 'google.com'}}, result: "You have <a href='google.com'>messages</a>."}
            ]
          },

          {
            message: "You have {:link1,link,text#messages}.",
            tree: [{"type":"trans","value":"You have "},{"index":":link1","type":"link","styles":[{"key":"text","items":[{"type":"trans","value":"messages"}]}]},{"type":"trans","value":"."}],
            test_cases: [
              {tokens: {link1: {href: 'google.com'}}, result: "You have <a href='google.com'>messages</a>."}
            ]
          },

          {
            message: "{0,choice,male#He|female#She|other#He/She} tagged {0,choice,male#himself|female#herself} in {1} {1,choice,singular#photo|plural#photos}",
            tree: [{"index":0,"type":"choice","styles":[{"key":"male","items":[{"type":"trans","value":"He"}]},{"key":"female","items":[{"type":"trans","value":"She"}]},{"key":"other","items":[{"type":"trans","value":"He/She"}]}]},{"type":"trans","value":" tagged "},{"index":0,"type":"choice","styles":[{"key":"male","items":[{"type":"trans","value":"himself"}]},{"key":"female","items":[{"type":"trans","value":"herself"}]}]},{"type":"trans","value":" in "},{"type":"param","index":1},{"type":"trans","value":" "},{"index":1,"type":"choice","styles":[{"key":"singular","items":[{"type":"trans","value":"photo"}]},{"key":"plural","items":[{"type":"trans","value":"photos"}]}]}],
            test_cases: [
              {tokens: [{name: 'Michael', gender: 'male'}, 5], result: "He tagged himself in 5 photos"}
            ]
          }

        ];

        var tokenizer = null;
        messages.forEach(function (obj) {
          tokenizer = new XMessageTokenizer(obj.message);
          // console.log(JSON.stringify(tokenizer.tree));
          assert.deepEqual(obj.tree, tokenizer.tree);

          if (obj.test_cases) {
            obj.test_cases.forEach(function (test_case) {
              var result = tokenizer.substitute(language, test_case.tokens);
              assert.deepEqual(test_case.result, result);
            });
          }
        });

        done();
      });
    });
  });
});