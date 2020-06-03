const UserModel = require('./../models/users');
const AppErrors = require('./../utils/AppErrors');

// Get ALL Users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find()
    
    return res.status(200).json({
      status: 'success' ,
      data: {
        users
      }
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: 'failed' ,
      msg: error
    })  
  }
}



exports.get1User = async ( req , res , next) => {
  try {
    const user = await UserModel.findById( req.params.id ) 
    
    if(!user) return next( 
      new AppErrors( 'No user found under that ID' , 404 )
    )

    return res.status(200).json({
      status: 'success' ,
      data: {
        user
      }
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: 'failed' ,
      msg: error.message
    })  
  }
}


// Create 1 User
exports.add1User = async ( req , res , next ) => {
  try {
    const newUser = await UserModel.create( req.body )
    
    return res.status(200).json({
      status: 'success' ,
      data: {
        user: newUser
      }
    })  
  } 
  catch (error) {
    return res.status(400).json({
      status: 'failed' ,
      msg: error
    })
  }
}


// Update 1 User
exports.update1User = async ( req , res , next) => {
  try {
    const userUpdated = await UserModel.findByIdAndUpdate( 
      req.params.id , 
      req.body ,
      {
        new: true ,
        runValidators: true ,
        context: 'query'
      }
    ) 
    
    if(!userUpdated) return next( 
      new AppErrors( 'No tour found under that ID' , 404 )
    )

    return res.status(200).json({
      status: 'success' ,
      data: {
        userUpdated
      }
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: 'failed' ,
      msg: error
    })  
  }
}


// Delete 1 User
exports.delete1User = async ( req , res, next) => {
  try {
    console.log('run');

    const deletedUser  = await UserModel.findByIdAndDelete( req.params.id ) 
    
    if(!deletedUser) return next( 
      new AppErrors( 'No user found under that ID' , 404 )
    )

    return res.status(204).json({
      status: 'success' ,
      data: null
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: 'failed' ,
      msg: error
    })  
  }
}