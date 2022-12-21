import jwt from "jsonwebtoken";


// Make sure a user is signed in before they acess certain resources
async function authenticate (req, res, next) {
  console.log("\nAuthenticating User...");
  // check for jwt
  if (req.cookies["X-auth-token"] === undefined) {
    return res.status(400).json({message: "User not logged in"});
  }
  // verify user is signed in
  let user = await jwt.verify(req.cookies["X-auth-token"], process.env.KICITI_JWT);
  if (!user) return res.status(400).json({message: "User not logged in"});

  console.log("User logged in...")
  // set user id in body
  req.body._id = user._id;

  next();
}

export default authenticate;