const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router({ mergeParams: true });

// /review
// tour/tourID/review

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.requireTo('user'),
    reviewController.createReview
  );

router.route('/:id').delete(reviewController.deleteReview).patch(reviewController.updateReview);


module.exports = router;