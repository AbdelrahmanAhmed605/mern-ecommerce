const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = process.env.TOKEN_SECRET;
const expiration = "5h";

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }

    // if token can be verified, add the decoded user's data to the request so it can be accessed in the resolver
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("Invalid token");
    }

    // return the request object so it can be passed to the resolver as `context`
    return req;
  },
  signToken: function ({ role, email, username, _id }) {
    const payload = { role, email, username, _id };
    token = jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    return token;
  },
};
