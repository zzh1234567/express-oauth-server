
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// // 添加加密支持
var crypto = require('crypto');
/**
 * Schema definitions.
 */

mongoose.model('OAuthTokens', new Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  user : { type: Object },
  userId: { type: String },
}));

mongoose.model('OAuthClients', new Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUris: { type: Array },
  grants: { type: Array }
}));

mongoose.model('OAuthUsers', new Schema({
  user_id: Number,
	email: { type: String, default: '' },
	firstname: { type: String },
	lastname: { type: String },
	password: { type: String },
	username: { type: String }, //// 用户账号
	user_name: { type: String }, //// 用户昵称
}));

var OAuthTokensModel = mongoose.model('OAuthTokens');
var OAuthClientsModel = mongoose.model('OAuthClients');
var OAuthUsersModel = mongoose.model('OAuthUsers');

module.exports.UserModel = OAuthUsersModel;
/**
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
  // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
  return OAuthTokensModel.findOne({ accessToken: bearerToken }).lean();
};

/**
 * Get client.
 */

module.exports.getClient = function(clientId, clientSecret) {
  return OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }).lean();
};

module.exports.getClientCallback = function(clientId, clientSecret, callback) {
  return OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, function(err,doc){
		if(err){
			callback(err,doc);	
		}
    else
    {
      callback(null,doc);
    }
	});
};

/**** 
 * Create client.
 */

module.exports.createClient = function(clientId, clientSecret, redirectUris, grants) {
  return OAuthClientsModel.create({ clientId: clientId, clientSecret: clientSecret, 
    redirectUris:redirectUris, grants:grants });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function(refreshToken) {
  return OAuthTokensModel.findOne({ refreshToken: refreshToken }).lean();
};

// // md5 password
function encryption(password){
  const newpassword = Md5(Md5(password).substr(2, 7) + Md5(password));
  return newpassword
};

function Md5(password){
  const md5 = crypto.createHash('md5');
  return md5.update(password).digest('base64');
};
/**
 * Get user.
 */
module.exports.getUser = function(username, password) {
  // // return OAuthUsersModel.findOne({ username: username, password: password }).lean();
  // // md5
  const newpassword = encryption(password);
  return OAuthUsersModel.findOne({ username: username, password: newpassword }).lean();
};


/* *** 遗漏了，补上，否则会抛出异常
https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getauthorizationcode-authorizationcode-callback
*/
module.exports.getAuthorizationCode = function(authorizationCode) {
  return getRefreshToken(authorizationCode); // //先假设返回refreshToken，以后补上代码
};
/* *** 遗漏了，补上，否则会抛出异常
 * Save saveAuthorizationCode.
 */
module.exports.saveAuthorizationCode = function(authorizationCode) {
  return undefined; // //先假设返回refreshToken，以后补上代码
};
/**
 * Save token.
 */

module.exports.saveToken = function(token, client, user) {
  var accessToken = new OAuthTokensModel({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    client : client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    user : user,
    userId: user.uid,
  });
  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  return new Promise( function(resolve,reject){
    accessToken.save(function(err,data){
      if( err ) reject( err );
      else resolve( data );
    }) ;
  }).then(function(saveResult){
    // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
    saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;
    
    // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
    var data = new Object();
    for( var prop in saveResult ) data[prop] = saveResult[prop];
    
    // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
    // //data.client = data.clientId;
    // // data.user = data.userId;

    return data;
  });
};
