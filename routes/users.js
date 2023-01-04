import Router from 'express';
import validateAccount from '../middlewares/validateAccount.js';
import authenticate from '../middlewares/auth.js';
import User from "../models/users.js";
import bcrypt from "bcrypt";
import _ from "lodash";
import multer from 'multer';
import { uploadPfp, downloadPfp, deletePfp } from '../utilities/s3.js';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: './uploads' });


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
    // Set cookie in response
    const response = {
      "user": _.omit(user.toObject(), [ "password", "posts", "likes", "created_at", "__v" ]),
      "X-auth-token": token
    };

    res.json(response);
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

/**
 * @openapi
 *
 * /api/users/{user_id}:
 *   put:
 *     summary: Update a user's profile
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: id of user (string)
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
 *               phone_number:
 *                 type: string
 *               country:
 *                 type: string
 *             required:
 *               - username
 *               - first_name
 *               - last_name
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         description: Bad Request
 */
router.put('/:user_id', authenticate, async (req, res) => {
  try {
    // Get user object values
    let userObject = req.body;

    // Get user from database
    let user = await User.findById(req.params.user_id);
    if (!user) return res.status(400).json({ message: "User does not exist" });

    // Check that first_name and last_name are provided
    if (!("first_name" in userObject) || !("last_name" in userObject)) return res.status(400).json({ message: "first_name and last_name are required"});

    // Update user
    if (user.username != userObject.username) user.username = userObject.username;
    if (user.first_name != userObject.first_name) user.first_name = userObject.first_name;
    if (user.last_name != userObject.last_name) user.last_name = userObject.last_name;
    if (userObject.middle_name) user.middle_name = userObject.middle_name;
    if (userObject.phone_number) user.phone_number = userObject.phone_number;
    if (userObject.country) user.country = userObject.country;
    await user.save();

    // Return updated user
    const response = {
      "user": _.omit(user.toObject(), [ "password", "posts", "created_at", "__v", "likes" ]),
      "message": "User updated successfully"
    };

    res.json(response);
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 *
 * /api/users/{user_id}/pfp:
 *   post:
 *     summary: Update user's profile picture
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: id of user (string)
 *     requestBody:
 *       required: true
 *       content:
 *         image/png:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       "201":
 *         description: Uploaded successfully
 *       "400":
 *         description: Bad Request
 */
// router.post('/:user_id/pfp', [ authenticate, upload.single('pfp') ], async (req, res) => {
router.post('/:user_id/pfp', upload.single('pfp'), async (req, res) => {
  try {
    // Confirm that signed in user is the one setting their pfp
    // if (req.params.user_id !== req.user_id) {
    //   res.status(403).json({ message: 'forbidden' });
    // }
    // Get user by id
    let user = await User.findById(req.params.user_id);

    // Upload image to bucket
    let deets = await uploadPfp(user.id, req.file);

    // Set image as user profile picture
    user.pfp = `pfp-${user.id}.jpg`;
    user.save();

    // Delete image locally
    fs.unlink('./uploads/' + req.file.filename, (err) => {
      if (err) throw err;
    });

    res.status(201).json({
      'status': 'success',
      'message': 'Display picture set',
      'user': _.omit(user.toObject(), [ "password", "posts", "created_at", "__v", "likes" ])
    });
  }
  catch (error) {
    // Delete image locally
    fs.unlink('./uploads/' + req.file.filename, (err) => {
      if (err) throw err;
    });
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 *
 * /api/users/{user_id}/pfp:
 *   get:
 *     summary: get user's profile picture
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
router.get('/:user_id/pfp', authenticate, async (req, res) => {
  try {
    // Get user by id
    let user = await User.findById(req.params.user_id);

    // Download image and send to frontend
    let pfp = await downloadPfp(req.params.user_id);
    
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.write(pfp.Body, 'binary');
    res.end(null, 'binary');
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 *
 * /api/users/{user_id}/pfp:
 *   delete:
 *     summary: delete user's profile picture
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
router.delete('/:user_id/pfp', authenticate, async (req, res) => {
  try {
    // Confirm that signed in user is the one deleting their pfp
    if (req.params.user_id !== req.user_id) {
      res.status(403).json({ message: 'forbidden' })
    }
    // Get user by id
    let user = await User.findById(req.params.user_id);

    // Delete image
    let pfp = await deletePfp(user.id);

    // Unset pfp in user schema
    user.pfp = null;
    user.save();
    
    res.json({
      'status': 'success',
      'message': 'Display picture deleted successfully',
      'user': _.omit(user.toObject(), [ "password", "posts", "created_at", "__v", "likes" ])
    });
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
