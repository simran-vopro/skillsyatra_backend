import authController from "../controllers/authController";

const express = require("express");
const router = express.Router();

const { signupValidation } = require("../utils/validators/authValidator");

router.post("/signup", signupValidation, authController.signUp);
router.post("/login", authController.login);

module.exports = router;
