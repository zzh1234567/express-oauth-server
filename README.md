# Express OAuth Server [![Build Status](https://travis-ci.org/oauthjs/express-oauth-server.png?branch=master)](https://travis-ci.org/oauthjs/express-oauth-server)

Complete, compliant and well tested module for implementing an OAuth2 Server/Provider with [express](https://github.com/expressjs/express) in [node.js](http://nodejs.org/).

This is the express wrapper for [oauth2-server](https://github.com/oauthjs/node-oauth2-server).

我需要用 https://github.com/oauthjs/express-oauth-server.但是发现有bug。所以，我修改了其中的bug，提交到自己github上。但文档和代码的共享都归功于原作者。

## Quick Start

The module provides two middlewares - one for granting tokens and another to authorize them. `express-oauth-server` and, consequently `oauth2-server`, expect the request body to be parsed already.

##-------------------------------- Usage 1

The following example uses `body-parser` but you may opt for an alternative library.

```js
var bodyParser = require('body-parser');
var express = require('express');
var OAuthServer = require('express-oauth-server');

var app = express();

app.oauth = new OAuthServer({
  model: {}, // See https://github.com/oauthjs/node-oauth2-server for specification
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(app.oauth.authorize());

app.use(function(req, res) {
  res.send('Secret area');
});

app.listen(3000);
```
##-------------------------------- Usage 2

export default app => {

	//// 如果没有oauth client，那么用clientid和client secret创建一个作为测试用
	if( undefined == oauthModel.getClient('KzEZED7aC0vird8jWyHM38mXjNTY', 'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP'))
		{
		oauthModel.createClient(
		'KzEZED7aC0vird8jWyHM38mXjNTY',  
		'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP',
		'/oauth/redirect',
		[
			"password",
			"authorization_code",
			"refresh_token"
		]
	);
	}

	// // add express oauth server
	app.oauth = new oauthserver({
		model: oauthModel,
		grants: ['password', 'authorization_code', 'refresh_token'],
		debug: true
	});
	// // https://github.com/expressjs/body-parser
	app.use('/auth/token', bodyParser.urlencoded({ extended: false }), app.oauth.token()); // // // create application/x-www-form-urlencoded parser,发送Post请求获取Token
##---------------------------------

## Options

```
var options = { 
  useErrorHandler: false, 
  continueMiddleware: false,
}
```
* `useErrorHandler`
(_type: boolean_ default: false)

  If false, an error response will be rendered by this component.
  Set this value to true to allow your own express error handler to handle the error.

* `continueMiddleware`
(_type: boolean default: false_)

  The `authorize()` and `token()` middlewares will both render their 
  result to the response and end the pipeline.
  next() will only be called if this is set to true.

  **Note:** You cannot modify the response since the headers have already been sent.

  `authenticate()` does not modify the response and will always call next()
