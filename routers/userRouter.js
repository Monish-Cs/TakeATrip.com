const express=require('express');
const usercontroller=require('./../controllers/usercontroller')
const authController=require('./../controllers/authController')

const router=express.Router();

router.post("/signup",authController.signUp);
router.post("/login",authController.login);
router.post("/forgotPassword",authController.forgotPassword);
router.patch("/resetPassword/:token",authController.resetPassword);
router.patch("/updateMyPassword",authController.protect,authController.updatePassword);
router.patch("/updateMe",authController.protect,usercontroller.updateMe);
router.delete("/deleteMe",authController.protect,usercontroller.deleteMe);
router.get("/Me",authController.protect,usercontroller.getMe,usercontroller.getuser);

router.route("/").get(usercontroller.getAllUsers).post(usercontroller.createuser);
router.route("/:id")
    .get(usercontroller.getuser)
    .patch(usercontroller.updateuser)
    .delete(usercontroller.deleteuser);

module.exports=router;