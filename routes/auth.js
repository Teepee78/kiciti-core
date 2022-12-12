import Router from 'express';
import User from "../models/users.js";
import bcrypt from "bcrypt";
import _ from "lodash";

const router = Router();


/**
 * @openapi
 *
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         description: Bad Request
 */
router.post('/login', async (req, res) => {
  try {
    // Get user input
    let userInput = req.body.user;
    let password = req.body.password;

    // Get user
    // Check if user email exists
    let user = await User.findOne({email: userInput});
    if (!user) {
      // Check if username exists
      user = await User.findOne({username: userInput});
      if (!user) return res.status(400).json({message: "Incorrect details"});
	  }

    // Check that password is correct
    let correct = await bcrypt.compare(password, user.password);
    if (!correct) return res.status(400).json({message: "Incorrect details"});

    // Get json web token and store in cookie
    const token = user.generateAuthToken();
    res.cookie("X-auth-token", token, { expire: new Date() + 10 });

    res.json(_.omit(user.toObject(), [ "password", "posts", "created_at", "__v", "likes" ]));
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
