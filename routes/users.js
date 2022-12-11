import Router from 'express';
import validateAccount from '../middlewares/validateAccount.js';
import User from "../models/users.js";
import bcrypt from "bcrypt";
import _ from "lodash";

let router = Router();


/**
 * @openapi
 *
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               first_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum:
 *                  - male
 *                  - female
 *             required:
 *               - username
 *               - first_name
 *               - surname
 *               - email
 *               - password
 *               - dob
 *               - gender
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         description: Bad Request
 */
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
