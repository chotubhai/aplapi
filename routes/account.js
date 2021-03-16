const router = require("express").Router();

const authorize = require("../middlewares/auth");
const account = require("../controllers/account");

router.get("/", authorize.auth, account.get);
router.post("/update", authorize.auth, account.update);
router.post("/password/change", authorize.auth, account.changePassword);
router.post("/delete", authorize.auth, account.remove);

module.exports = router;
