//Router
const express = require('express');
const router= express.Router();
//controllers
const tourController = require('../controllers/tourController');
const { 
  getATour , 
  getAllTours , 
  updateTour , 
  deleteTour , 
  addTour ,
  getTop
} = tourController;


// @Description     Get all tours
// @Access          Public
router.get( '/' , getAllTours )
 
// @Description     Get 1 tour
// @Access          Public
router.get( '/:id' , getATour );
 
// @Description     Add a new tour
// @Access          Private
router.post( '/:tour' , addTour);
 
// @Description     Update a tour
// @Access          Private
router.put( '/:id' , updateTour )

// @Description     DELETE a  tour
// @Access          Private
router.delete( '/:id' , deleteTour )
  
// @Description     GET + demanded Tours
// @Access          Public
router.get('/top5' , getTop , getAllTours)

module.exports = router;


