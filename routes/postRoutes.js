const express = require('express');

const postController = require('../controllers/postController');

const router = express.Router();

// localhost:3000/api/v1/posts
router.route('/').get(postController.getAllPosts).post(postController.createPost);

// localhost:3000/api/v1/posts/:id
router
  .route('/:id')
  .get(postController.getOnePost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
