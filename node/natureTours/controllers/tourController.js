const TourModel = require('../models/tour');
const AppError = require('../utils/ErrorHandler');
const factory = require('./factory');



// Middleware
exports.getTop = async (req , res , next) => {
  // req.query.limit = '5';
  // req.query.sort = '-ratingsAverage,price';
  // req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next();
}

exports.getAllTours = factory.getAllOnes( TourModel );


exports.getATour = async (req , res , next) => {
  try {
    const tour = await TourModel.findById(req.params.id).populate('reviews');
    if(!tour){
      return next( new AppError(`Sorry, we couldn't find any associated tour` , 404)) 
    }
    return res.status(200).json({
      data: tour
    })
  } 
  catch (error) {
    return res.status(500).json({ msg: error.message })
  }
}

exports.addTour = factory.createOne( TourModel );
exports.updateTour = factory.updateOne(TourModel);
exports.deleteTour = factory.deleteOne(TourModel);


//=============  STATS  ===============

// GET Customized stats 
exports.getTourStats = async ( req, res ) => {
  try {
    // Pipeline Aggregation
    const stats = await TourModel.aggregate([
      { //filter
        $match: { ratingsAverage: { $gte: 4.5 }}
      },
      {  //group This Stats
        $group: {
          _id: '$difficulty' ,
          numTours: { $sum: 1 } ,
          numRatings: { $sum: '$ratingsQuantity' } ,
          avgRating: { $avg: '$ratingsAverage' } ,
          avgPrice: { $avg: '$price' } ,
          minPrice: { $min: '$price' } ,
          maxPrice: { $max: '$price' } 
        }
      },
      { //Sorting Ascending
        $sort: {
          avgPrice: 1
        }
      }
    ])  
    return res.status(200).json({
      data: {
        stats
      }
    })
  } 
  catch (error) {
    return res.status(404).json({ msg: error.message })
  }
}

exports.getMonthlyPlan = async ( req, res ) => {
  try {
    const year = req.params.year * 1;

    // Pipeline Aggregation
    const plan = await TourModel.aggregate([
      { // deconstruct arrays and output data 1 by 1
        $unwind: '$startDates'
      },
      { // Select 
        $match: { 
          startDates: {
            $gte: new Date(`${year}-01-01`) ,
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      { // Agrupa
        $group: {
          _id: { $month: '$startDates'} ,
          numStarts: { $sum: 1 } ,
          tours: { $push: '$name' }
        }
      },
      { // + month field => Start Date
        $addFields: { month: '$_id'}
      } ,
      { // hide id
        $project: { _id: 0 }
      },
      { // descending
        $sort: { numStarts : -1 }
      }
    ])  
    return res.status(200).json({
      data: {
        plan
      }
    })
  } 
  catch (error) {
    return res.status(404).json({ msg: error.message })
  }
}

exports.getToursWithinRatio = async ( req , res , next ) => {
  const { distance , latlng , unit } = req.params;
  const [ latitude , longitude ] = latlng.split(',')
  
  try {
    if(!latitude || !longitude) return next( 
      new AppError('Please provide us with your current location ,thanks!')
    )
    
    const radius = 
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1 ;

    const tours = await TourModel.find({ 
      startLocation: { $geoWithin: { $centerSphere: [[ longitude , latitude ] ,radius ] }}
    });
  
    return res.status(200).json({
      status: 'success' ,
      results: tours.length ,
      data: {
        tours
      }
    })
  } 
  catch (error) {
    return res.status(404).json({ msg: error.message })
  }
} 

exports.getDistancesForTours = async ( req , res , next ) => {
  const { latlng , unit } = req.params;
  const [ latitude , longitude ] = latlng.split(',')
  
  try {
    if(!latitude || !longitude) return next( 
      new AppError('Please provide us with your current location ,thanks!')
    )
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await TourModel.aggregate([
      { // always 1st stage
        $geoNear: {
          near: {
            type: 'Point' ,
            coordinates: [ longitude * 1 , latitude * 1 ]
          },
          distanceField: 'distance' ,
          distanceMultiplier: multiplier
        },
      },
      {
        // 2nd stage -->Project ( choose just the Needed fields)
        $project: {
          distance: 1 ,
          name:  1
        }
      }
    ])

    return res.status(200).json({
      status: 'success' ,
      data: {
        distances
      }
    })
  } 
  catch (error) {
    return res.status(404).json({ msg: error.message })
  }   
}