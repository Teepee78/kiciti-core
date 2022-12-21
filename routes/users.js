import Router from 'express';
import validateAccount from '../middlewares/validateAccount.js';
import authenticate from '../middlewares/auth.js';
import User from "../models/users.js";
import bcrypt from "bcrypt";
import _ from "lodash";

const router = Router();


/**
 * @openapi
 *
 * /api/users/signup:
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
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum:
 *                  - male
 *                  - female
 *             required:
 *               - username
 *               - first_name
 *               - last_name
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
router.post('/signup', validateAccount, async (req, res) => {
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
    res.cookie("X-auth-token", token);
    // Set cookie as header
    res.setHeader("X-auth-token", token);

    res.json(_.omit(user.toObject(), [ "password", "posts", "likes", "created_at", "__v" ]));
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


/**
 * @openapi
 *
 * /api/users/{user_id}:
 *   get:
 *     summary: Get information about a user for profile page
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: id of user (string)
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         description: Bad Request
 */
router.get('/:user_id', authenticate, async (req, res) => {
  try {
    // Get user by id
    let user = await User.findById(req.params.user_id);

    res.json(_.omit(user.toObject(), [ "password", "posts", "created_at", "__v", "likes" ]));
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
