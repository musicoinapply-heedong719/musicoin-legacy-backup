const BaseController = require('../Controllers/base/BaseController');

class AuthMiddleware extends BaseController {
  constructor(props) {
    super(props);
    this.authenticate = this.authenticate.bind(this);
  }

  async authenticate(Request, Response, next) {

    try {
      const params = Request.query;
      const email = params.email;
      const accessToken = params.accessToken;

      // validate request params
      const validateResult = this.validate(params, this.schema.AuthSchema.tokenValidity);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find api user
      const apiUser = await this.db.ApiUser.findOne({
        email: email
      }).exec();

      // verify api user
      if (apiUser && apiUser.accessToken === accessToken) {
        await apiUser.update({
          calls: apiUser.calls + 1,
          timeout: Date.now()
        });
        Request.apiUser = apiUser;
        next();
      } else if (apiUser && (Date.now() - apiUser.timeout > this.constant.TOKEN_TIMEOUT)) {
        this.reject(Request, Response, 'Access Token Expired');
      } else {
        this.reject(Request, Response, 'Invalid Credentials');
      }
    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}

module.exports = new AuthMiddleware();
