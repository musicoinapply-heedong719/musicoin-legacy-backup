const APIUser = require('../db/core/api-user');

function AccountManager() {

}
/**
 * Deducts the specified amount from the client's account, if they have sufficient balance.
 *
 * @param email The email of the user that is paying
 * @param amount The amount to subtract from the user's balance
 * @returns {Promise<Boolean>} A promise that resolves to true if the amount was subtracted from the user's balance.  An exception
 * will be thrown if the balance is insufficient.
 */
AccountManager.prototype.pay = function(email, amount) {
  return new Promise(function(resolve, reject) {
    APIUser.findOneAndUpdate({
        email: email,
        balance: {
          $gte: amount.toNumber()
        }
      }, {
        $inc: {
          balance: -amount
        }
      },
      function(err, apiUser) {
        if (err) return reject(err);
        if (apiUser) return resolve(true);

        // To ensure the balance doesn't go negative, the balance must be included in the query.
        // However,this means it is not possible to tell WHY no user was found.  It could be an invalid
        // email or an insufficient balance.
        reject(new Error("Insufficient funds (or user not found): " + email));
      }
    )
  })
};

AccountManager.prototype.getAPIUserCount = function() {
  return APIUser.count().exec();
};

AccountManager.prototype.getBalance = function(email) {
  return APIUser.findOne({
      email: email
    }).exec()
    .then(function(record) {
      if (!record) throw new Error(`Balance check failed: email not found`);
      return {
        balance: record.balance
      }
    });
};

AccountManager.prototype.validateClient = function(email) {
  return new Promise(function(resolve, reject) {
    APIUser.findOne({
        email: email
      },
      function(err, apiUser) {
        if (err) return reject(err);
        if (apiUser) return resolve(true);
        reject(new Error("User not found: " + email));
      }
    )
  })
};

AccountManager.prototype.deposit = function(email, amount) {
  return new Promise(function(resolve, reject) {
    APIUser.findOneAndUpdate({
        email: email
      }, {
        $inc: amount
      },
      function(err, apiUser) {
        if (err) return reject(err);
        if (apiUser) return resolve(true);
        reject(new Error("User not found: " + email));
      }
    )
  })
};

AccountManager.prototype.createAccount = function(email, name) {
  return new Promise(function(resolve, reject) {
    const newUser = new APIUser();
    newUser.email = email;
    newUser.name = name;
    newUser.balance = 0;
    newUser.save(function(err) {
      if (err) {
        console.log("Failed create new user: " + err);
        reject(err);
      } else {
        console.log("New user created!");
        resolve(newUser);
      }
    });
  })
};

module.exports = AccountManager;
