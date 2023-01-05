import jwt from "jsonwebtoken";


// Make sure a user is signed in before they acess certain resources
async function authenticate (req, res, next) {
  console.log("\nAuthenticating User...");
  // check for jwt
  if (req.cookies["X-auth-token"] === undefined && req.headers['x-auth-token'] === undefined) {
    return res.status(400).json({message: "User not logged in"});
  }
  // verify user is signed in
  try {
    let user = jwt.verify(req.cookies["X-auth-token"], process.env.KICITI_JWT);
  } catch (e) {
    let user = jwt.verify(req.headers["x-auth-token"], process.env.KICITI_JWT);
    if (!user) return res.status(400).json({message: "User not logged in"});
  }

  console.log("User logged in...")
  // set user id in request object
  req.user_id = user._id;

  next();
}

export default authenticate;
