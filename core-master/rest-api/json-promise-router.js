function JsonPromiseRouter(expressRouter, name) {
  this.router = expressRouter;
  this.name = name;
  this.promiseHandler = function handleJsonPromise(p, res) {
    p.then(function (output) {
      res.json(output);
    })
      .catch(function (err) {
        console.log(`Request failed in ${name}: ${err}`);
        res.status(500);
        res.send(err);
      });
  };
}

JsonPromiseRouter.prototype.post = function() {
  const routeArgs = [...arguments].slice(0, arguments.length-1);
  const promiseProvider = arguments[arguments.length-1];
  this.router.post(...routeArgs, function(req, res, next) {
    this.promiseHandler(promiseProvider(req, res, next), res, next);
  }.bind(this))
};

JsonPromiseRouter.prototype.get = function() {
  const routeArgs = [...arguments].slice(0, arguments.length-1);
  const promiseProvider = arguments[arguments.length-1];
  this.router.get(...routeArgs, function(req, res, next) {
    console.log(`Calling route: ${routeArgs[0]} in ${this.name} with params: ${JSON.stringify(req.params)}`);
    this.promiseHandler(promiseProvider(req, res, next), res, next);
  }.bind(this))
};

module.exports = JsonPromiseRouter;