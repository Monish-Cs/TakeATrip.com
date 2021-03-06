const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router({ mergeParams: true });

// /review
// tour/tourID/review


router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.requireTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(authController.requireTo('admin','user'),reviewController.deleteReview)
  .patch(authController.requireTo('admin','user'),reviewController.updateReview)
  .get(reviewController.getReview);


module.exports = router;