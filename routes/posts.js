import Post from "../models/posts.js";
import User from "../models/users.js";
import authenticate from "../middlewares/auth.js";
// import _ from "lodash";
import Router from "express";
import _ from "lodash";

const router = Router();

/**
 * @openapi
 *
 * /api/posts/:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       "200":
 *         description: OK
 *       "403":
 *         description: Forbidden
 */
router.post("/", authenticate, async (req, res) => {
  try {
    // Get user
    let user = await User.findById(req.body._id);

    // Create post
    let post = await Post({
      content: req.body.content,
      user_id: req.body._id
    });
    await post.save();

    // Add post id to user posts
    user.posts.push(post._id);
    await user.save();

    res.json({
      message: "Post created successfully!",
      status: "OK",
      post: _.omit(post.toObject(), [ "__v"])
    });
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


/**
 * @openapi
 *
 * /api/posts/{user_id}:
 *   get:
 *     summary: Get all posts for a user
 *     tags: [Posts]
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
 *       "403":
 *         description: Forbidden
 */
router.get('/:user_id', authenticate, async (req, res) => {
  try {
    // Get user by id
    let user = await User.findById(req.params.user_id);

    // Get all posts by user
    let posts = [];
    for (let post_id of user.posts) {
      let post = await Post.findById(post_id);
      posts.push(post);
    }

    res.json({
      status: "OK",
      posts: posts
    });
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


export default router;
