const router = require("express").Router();
 
const room = require("../controllers/Room");

router.post('/createroom', room.createRoom)//5 6 7 12
router.get('/fetchrooms', room.fetchRooms)
router.get('/fetchroom/:id', room.fetchRoomById)
router.put('/joinroom/:id', room.joinRoom)
router.get('/fetchuserrooms', room.fetchRoomsByUid)
router.put('/kickuser/:id', room.kickUser)
router.post('/inviteuser/:id', room.inviteUser)//
router.post('/fetchroombycode', room.fetchRoomByCode)
module.exports = router;
