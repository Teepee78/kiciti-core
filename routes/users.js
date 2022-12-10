import Router from 'express';
import validateAccount from '../middlewares/validateAccount.js';
import User from "../models/users.js";
import bcrypt from "bcrypt";
import _ from "lodash";

let router = Router();


// Create a new user
router.post('/create', validateAccount, async (req, res) => {
  try {
    // Get user object values
    let userObject = _.omit(req.body, "password");

    // Make sure user does not already exist
    let user = await User.find({email: userObject.email});
    if (user.length > 0) return res.status(400).json({ message: "User already exists" });

    // hash password
    let salt = await bcrypt.genSalt(10);
    userObject.password = await bcrypt.hash(req.body.password, salt);

    // Create new user
    user = await new User(userObject);
    await user.save();

    // Get json web token and store in cookie
    const token = user.generateAuthToken();
    res.cookie("X-auth-token", token, { expire: new Date() + 10 });

    res.json(_.omit(user.toObject(), [ "password", "posts", "created_at", "__v" ]));
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
