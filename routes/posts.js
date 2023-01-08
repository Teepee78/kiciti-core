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
    let user = await User.findById(req.user_id);

    // Create post
    let post = await Post({
      content: req.body.content,
      user_id: req.user_id,
    });
    await post.save();

    // Add post id to user posts
    if (user.posts === undefined) {
      user.posts = [post._id];
    } else {
      user.posts.push(post._id);
    }
    await user.save();

    res.json({
      message: "Post created successfully!",
      status: "OK",
      post: _.omit(post.toObject(), ["__v"]),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 *
 * /api/posts/:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *           type: integer
 *        description: The page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: The number of items to return
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Not found
 */
router.get("/", async (req, res) => {
  try {
    // Get page and limit
    const { page = 1, limit = 30 } = req.query;

    // Get Posts
    let posts = await Post.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Parse result
    let result = [];
    const posts_objects = Object.values(posts);
    for (let post of posts_objects) {
      const user = await User.findById(post.user_id.toString());
      console.log(user);
      result.push({
        post: _.omit(post.toObject(), ["__v"]),
        user: _.omit(user.toObject(), [
          "password",
          "posts",
          "created_at",
          "__v",
          "likes",
        ]),
      });
    }

    // get total documents in the Posts collection
    const count = await Post.countDocuments();

    res.json({
      status: "OK",
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit: limit,
      posts: result,
    });
  } catch (error) {
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
router.get("/:user_id", authenticate, async (req, res) => {
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
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });
  }
});

/**
 * @openapi
 *
 * /api/posts/post/{post_id}:
 *   get:
 *     summary: Get a particular post by id
 *     tags: [Posts]
 *     parameters:
 *      - in: path
 *        name: post_id
 *        schema:
 *          type: string
 *        required: true
 *        description: id of post (string)
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         description: Bad Request
 *       "404":
 *         description: Not Found
 */
router.get("/post/:post_id", async (req, res) => {
  try {
    // Get post by id
    let post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({
      status: "OK",
      post: post,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
