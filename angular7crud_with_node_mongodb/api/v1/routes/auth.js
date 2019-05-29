var debug = require('debug')('x-code:v1:routes'),
    express = require('express'),
    router = express.Router(),

    isLoggedInPolicie = require('../policies/isLoggedIn.js'),
    isUserAuthenticatedPolicy = require('../policies/isUserAuthenticated.js'),

    UserController = require('../controllers/user.js');
    StudentController = require('../controllers/student.js');

var decodeReqPolicy = require('../policies/decodeRequest.js');
var encodeResPolicy = require('../policies/encodeResponse.js');
var AESCrypt = rootRequire('services/aes');

router.get('/encode', function(req, res) {
    res.render('encode');
});

router.post('/encode', function(req, res) {
    var body = req.body;
    console.log('resaaaaaaaaaaaaaaa',body)
    debug('ENCODE BREQ BODY :->', body);

    try {
        var json = eval("(" + body.data + ")");
        var enc = AESCrypt.encrypt(JSON.stringify(json));
    } catch (e) {
        var enc = 'Invalid parameters';
    }
    res.send({ "encoded": enc });
});

router.get('/decode', function(req, res) {
    res.render('decode');
});

router.post('/decode', function(req, res) {
    var body = req.body;
    console.log('resaaaaaaaaaaaaaaa',body)

    debug('DECODE REQ BODY :->', body);

    try {
        var dec = AESCrypt.decrypt(JSON.stringify(body.data));
    } catch (e) {
        var dec = 'Invalid parameters';
    }
    res.send(dec);
});

// decode request data
router.all('/*', function(req, res, next) {
    res.sendToEncode = function(data) {
        req.resbody = data;
        next();
    };
    next();
}, decodeReqPolicy);

/**
 * Users Account & Authentication APIs
 */
router.post('/login', UserController.login);
// 


/**
 * Authentication Middleware (BEFORE)
 * Serve all apis before MIDDLE if they serve like /api/*
 */
router.all('/api/*', isUserAuthenticatedPolicy, isLoggedInPolicie);
// router.post('/api/add', UserController.add);



router.get('/api/coachList', UserController.coachList); 
router.get('/api/studentList', StudentController.studentList); 
router.get('/api/puzzleList', UserController.puzzleList); 
router.post('/api/edit_puzzle', UserController.edit_puzzle);






/*****start*************Admin related routes***************************************************/

router.get('/api/studentList', StudentController.studentList);
router.post('/api/getstudentlist_admin', StudentController.getstudentlist_admin);
router.post('/api/update_status_student_admin', StudentController.update_status_student_admin);




router.post('/api/addCoach', UserController.addCoach); 
router.post('/api/addedCoach', UserController.addedCoach); //using that thing to web api 
router.post('/api/updateadmin_coach', UserController.updateadmin_coach);
router.post('/api/getadmin_coach_list', UserController.getadmin_coach_list);
router.post('/api/update_status_coach', UserController.update_status_coach);
router.post('/api/delete_coach', UserController.delete_coach);




router.post('/api/add_puzzle_category', UserController.add_puzzle_category);   
router.post('/api/edit_puzzle_cat', UserController.edit_puzzle_cat);        
router.post('/api/delete_puzzle_category', UserController.delete_puzzle_category);  
router.post('/api/getpuzzleCategorieslist', UserController.getpuzzleCategorieslist);  
router.post('/api/list_puzzle_category_dropdown', UserController.list_puzzle_category_dropdown);  
router.post('/api/update_status_puzzle_category', UserController.update_status_puzzle_category);  




router.post('/api/add_puzzle_assignment', UserController.add_puzzle_assignment);  
router.post('/api/getpuzzleassignmentlist', UserController.getpuzzleassignmentlist);  
router.post('/api/download_files', UserController.download_files);  
router.post('/api/delete_puzzle_assignment', UserController.delete_puzzle_assignment); 
router.post('/api/update_puzzle', UserController.update_puzzle);        
router.post('/api/update_status_puzzle_assignment', UserController.update_status_puzzle_assignment);        



/*****end*************Admin related routes***************************************************/



router.post('/api/add_puzzle', UserController.add_puzzle);  
router.get('/api/admin_dashboard', UserController.admin_dashboard);    
router.post('/api/studentCoachWise', UserController.studentCoachWise);
router.get('/api/list_puzzle_category', UserController.list_puzzle_category); 
router.post('/stu/studentLogin', StudentController.studentLogin);


// coachList    

/**
 * Other APIs Routes (MIDDLE)
 */
router.get('/api/test', UserController.test);


/**
 * Responses Middleware (AFTER)
 * Serve all apis after MIDDLE if they serve like /api/*
 */
router.all('/*', encodeResPolicy);


// exports router
module.exports = router;
