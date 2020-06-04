const express = require('express');
const router = express.Router();

const usersController = require('./../controllers/usersController');
const authController = require('./../controllers/authController');

const {
  getAllUsers ,
  add1User ,
  update1User ,
  delete1User ,
  get1User
} = usersController
const { signup , login , forgotPass , resetPass } = authController;


router.post( '/signup' , signup )
router.post( '/login' , login )

router.post( '/forgotPass' , forgotPass )
router.patch( '/resetPass/:token' , resetPass )

//  ADMIN 
router.get('/', getAllUsers );
router.post('/', add1User );
router.get( '/:id' , get1User );
router.patch('/:id', update1User );
router.delete('/:id', delete1User );



module.exports = router;