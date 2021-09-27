const express=require('express');
const usercontroller=require('./../controllers/usercontroller')
const authController=require('./../controllers/authController')

const router=express.Router();

router.post("/signup",authController.signUp);
router.post("/login",authController.login);
router.post("/forgotPassword",authController.forgotPassword);
router.patch("/resetPassword/:token",authController.resetPassword);

router.use(authController.protect);
router.patch("/updateMyPassword",authController.updatePassword);
router.patch("/updateMe",usercontroller.updateMe);
router.delete("/deleteMe",usercontroller.deleteMe);
router.get("/Me",usercontroller.getMe,usercontroller.getuser);


router.use(authController.requireTo('admin'))

router.route("/").get(usercontroller.getAllUsers).post(usercontroller.createuser);
router.route("/:id")
    .get(usercontroller.getuser)
    .patch(usercontroller.updateuser)
    .delete(usercontroller.deleteuser);

module.exports=router;