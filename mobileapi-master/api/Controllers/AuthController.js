/**
 *
 *   MODELS
 *
 * */
const User = require('../../db/core/user');
const ApiUser = require('../../db/core/api-user');
/**
 *   VALIDATION SCHEMAS
 */
const AuthSchema = require('../ValidatorSchema/AuthSchema');
/**
 *  LIBS
 *
 * */
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const TIMEOUT = require('../constant').TIMEOUT;

/**
 *  AUTH CONTROLLER
 *
 *  Controls users functional on authentication and authorization
 *
 *
 * */
class AuthController {

  registerNewUser(req, res) {

    const $this = this;
    let body = req.body;

    body.password = bcrypt.hashSync(body.password);

    let errors = Validator.validate(body, AuthSchema.signup);

    if (errors === true) {
      User.create({
        // only local auth supported for now, other stuff later
          local: body
        }).then(user => {
          ApiUser.create({
            // the api user doesn't clientId since he has an accessToken
            email: body.email,
            clientSecret: this.randomTokenGenerate(30),
            timeout: 3600
          }).then(apiuser => {
            res.send({
              success: true,
              clientSecret: apiuser.clientSecret,
              id: apiuser._id
            });
          }).catch(Error => {
            res.status(400);
            res.send({
              success: false,
              error: Error
            })
          });
        })
        .catch(Error => {
          console.log("ERR1");
          res.status(400);
          res.send({
            success: false,
            error: Error
          });
        });
    } else {
      res.send(errors);
    }
  }

  authenticateUser(Request, Response) {
    let Errors = Validator.validate(Request.body, AuthSchema.login);
    if (Errors === true) {
      User.findOne({
        "local.email": Request.body.email,
      }).then(user => {
        if (user && bcrypt.compareSync(Request.body.password, user.local.password)) {
          Response.send({
            success: true
          })
        } else {
          Response.send({
            success: false
          });
        }
      });
    } else {
      Response.send({
        success: false
      });
    }
  }

  getAPICredentials(Request, Response) {
    let Errors = Validator.validate(Request.body, AuthSchema.login);
    if (Errors === true) {
      User.findOne({
        "local.email": Request.body.email,
      }).then(user => {
        if (user && bcrypt.compareSync(Request.body.password, user.local.password)) {
          ApiUser.findOne({
            email: Request.body.email
          }).then(apiUser => {
            if (apiUser) {
              Response.send({
                success: true,
                clientSecret: apiUser.clientSecret
              });
            } else {
              Response.send({
                success: false,
                error: 'Api User Account not found'
              });
            }
          })
        } else {
          Response.send(401);
          Response.send({
            success: false,
            error: 'Invalid Credentials'
          });
        }
      });
    } else {
      Response.send(Errors);
    }
  }

  randomTokenGenerate(count) {
    return crypto.randomBytes(count).toString('hex');
  }

  async genTokenTest(Request, Response) {
    User.findOne({
      "local.email": Request.body.email,
    }).then(user => {
      ApiUser.findOne({
        email: Request.body.email
      }).then(user1 => {
        if (user1.clientSecret == Request.body.clientSecret) {
          const accessToken = this.randomTokenGenerate(40);
          user1.timeout = Date.now();
          user1.accessToken = accessToken; // save it here TODO
          console.log("USER1", user1);
          user1.save(function(err, dummy) {
            if (err) {
              console.log(err);
              Response.send({
                success: false,
                error: 'Client Secrets dont match'
              });
            } else {
              Response.send({
                success: true,
                accessToken: accessToken
              });
            }
          });
        } else {
          Response.send({
            success: false,
            error: 'Client Secrets dont match'
          });
        }
      }).catch(Error => {
        Response.send({
          success: false,
          error: Error
        });
      });
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error
      });
    });
  }

  async getTokenValidity(Request, Response) {
    ApiUser.findOne({
      email: Request.body.email
    }).then(user1 => {
      if (user1.accessToken == Request.body.accessToken) {
        if (Date.now() - user1.timeout > TIMEOUT) {
          // error out
          Response.send({
            success: false,
            error: 'Access Token timed out'
          });
        } else {
          var timeElapsed = (Date.now() - user1.timeout) / 1000; // ms to s
          Response.send({
            timeout: timeElapsed
          });
        }
      } else {
        console.log(user1.accessToken, Request.body.accessToken);
        Response.send({
          success: false,
          error: 'Invalid Access Token'
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error
      });
    });
  }

}

module.exports = new AuthController();
