var debug = require('debug')('x-code:v1:controllers:user'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
    path = require('path'),
    shortid = require('shortid'),
    _ = require('underscore'),

    UserSchema = require('../models/User'),
    StudentSchema = require('../models/Student'),
    PermissionSchema = require('../models/Permissions')
    PuzzleSchema = require('../models/Puzzle'),
    PuzzleCategorySchema = require('../models/Puzzle_category'),

    config = rootRequire('config/global'),
    ED = rootRequire('services/encry_decry'),
    Uploader = rootRequire('support/uploader'),
    Mailer = rootRequire('support/mailer'),
    DS = rootRequire('services/date'),
    multer = require('multer');
    
    var multiparty = require("multiparty");
    var fileExtension = require('file-extension');
    var crypto = require('crypto');
    var fs = require('fs');
    var mongoose = require('mongoose');

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'uploads/pgn/')
        },
        filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
        }
    });
    var upload = multer({storage: storage});


/** Sync */
function randomString(length, chars) {
    if (!chars) {
      throw new Error('Argument \'chars\' is undefined');
    }
  
    var charsLength = chars.length;
    if (charsLength > 256) {
      throw new Error('Argument \'chars\' should not have more than 256 characters'
        + ', otherwise unpredictability will be broken');
    }
  
    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
  
    var cursor = 0;
    for (var i = 0; i < length; i++) {
      cursor += randomBytes[i];
      result[i] = chars[cursor % charsLength];
    }
  
    return result.join('');
  }
  
  /** Sync */
  function randomAsciiString(length) {
    return randomString(length,
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  }

  function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

module.exports = {

    login: function(req, res) {
        async.waterfall([
            function(nextCall) { // check required parameters

                req.checkBody('email', 'Email is required').notEmpty(); // Name is required
                req.checkBody('email', 'Email is not a valid').isEmail();
                req.checkBody('password', 'Password is required').notEmpty(); // password is required

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }
                nextCall(null, req.body);
            },
            function (body, nextCall) {
                password = ED.encrypt(body.password);
                console.log('password',password);
                UserSchema.find({ 'email': new RegExp(body.email, 'i'), 'password': password }, function (err, user) {
                    // console.log('user', user.length);
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    if (user.length > 0) {
                        nextCall(null, user[0]);
                        // res.status(200).send({"status":0,"message":"Email already exist!"});
                    } else {
                        return nextCall({ "status": 200, "message": "This email and password doesn't match." });
                    }

                });
            },
            function(user, nextCall) {

                var jwtData = {
                    _id: user._id,
                    email: user.email,
                    timestamp:DS.now()
                };

                // create a token
                access_token = jwt.sign(jwtData, config.secret, {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });

                UserSchema.findOneAndUpdate({ "_id": user._id }, { $set: { "access_token": access_token } }, function (error, results) {
                        if (error) {
                            console.log('LOGIN DEVICE TOKEN UPDATE ERROR:', error);
                        }

                        var data = {
                            '_id': results._id,
                            'firstname': results.firstname,
                            'lastname': results.lastname,
                            'phone': results.phone,
                            'email': results.email,
                            'created_at': results.created_at,
                            'updated_at': results.updated_at,
                            'access_token': access_token,
                            'user_type':results.user_type
                        }
                        nextCall(null, data);
                    });

                // nextCall(null, body);
            },
            function(body, nextCall) {

                // return the information including token as JSON
                nextCall(null, {
                    status: 1,
                    message: 'Login successfully',
                    data: body
                });
            }
        ], function(err, response) {
            if (err) {
                debug('Login Error', err);
                return res.sendToEncode({ status: 0, message: (err && err.message) || "Oops! You could not be logged in." });
            }

            res.sendToEncode(response);
        });
    },

    // add: function(req, res) {
    //     async.waterfall([
    //         function(nextCall) { // check required parameters

    //             req.checkBody('email', 'Email is required').notEmpty(); // Name is required
    //             req.checkBody('email', 'Email is not a valid').isEmail();
    //             req.checkBody('password', 'Password is required').notEmpty(); // password is required

    //             var error = req.validationErrors();
    //             if (error && error.length) {
    //                 return nextCall({ message: error[0].msg });
    //             }
    //             nextCall(null, req.body);
    //         },
    //         function (body, nextCall) {
    //             var password = ED.encrypt(body.password);
    //             var data = {
    //                 'email': req.body.email,
    //                 'password':password
    //             }

    //             // return false;
    //             var user = new UserSchema(data);
    //             user.save(function (error, result) {
    //                 console.log(error);
    //                 if (error) {
    //                     // res.send({ "status":0, "message": 'Opps! You could not be registered.'});
    //                     return nextCall({ "status": 400, "message": 'Opps! You could not be registered.' });
    //                 }
    //                 // res.send({"status":1,"message":"Email has been sent. Please verify your account once."});
    //                 nextCall(null, {
    //                     status: 200,
    //                     message: 'Signup successfully.',
    //                     data: data
    //                 });
    //             });
    //         },
    //         function(body, nextCall) {

    //             var jwtData = {
    //                 _id: 1,
    //                 email: body.email
    //             };

    //             // create a token
    //             body.access_token = jwt.sign(jwtData, config.secret, {
    //                 expiresIn: 60 * 60 * 24 // expires in 24 hours
    //             });

    //             nextCall(null, body);
    //         },
    //         function(body, nextCall) {

    //             // return the information including token as JSON
    //             nextCall(null, {
    //                 status: 1,
    //                 message: 'Login successfully',
    //                 data: body
    //             });
    //         }
    //     ], function(err, response) {
    //         if (err) {
    //             debug('Login Error', err);
    //             return res.sendToEncode({ status: 0, message: (err && err.message) || "Oops! You could not be logged in." });
    //         }

    //         res.sendToEncode(response);
    //     });
    // },


    admin_dashboard: function (req, res) {
        async.waterfall([
            function (nextCall) {
                // UserSchema.find({'user_type':'coach'}.populate('tbl_student'), function (err, results) {

                   UserSchema.find({'user_type':'coach'}, function (error, coach) {
                    if (error) {
                            console.log('LOGIN DEVICE TOKEN UPDATE ERROR:', error);
                    }
                        nextCall(null, coach.length)
                });
            },
             function (coach, nextCall) {
                StudentSchema.find({}, function (error, student) {
                    if (error) {
                            console.log('LOGIN DEVICE TOKEN UPDATE ERROR:', error);
                    }

                    dataValue = {
                        'totalCoach':coach,
                        'totalStudent':student.length,
                    }

                    nextCall(null, {
                        status: 1,
                        message: 'Dashboard result.',
                        data: dataValue
                    })
                });
            }

        ],function (err, response) {
                if (err) {
                    debug('coach List Error', err);
                    return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
                }

                res.sendToEncode(response);
            });
    }, 


/////////start admin ////////coach list //////////////////////////////

addedCoach : function(req, res)
{
        async.waterfall([
        function (nextCall) 
        {
             var form = new multiparty.Form();
             form.parse(req, function(err, fields, files) 
             {  
                    fields = fields || [];

                    for (var key in fields) {
                        if (fields[key].length === 1) {
                            fields[key] = fields[key][0];
                        }
                    }

                    req.body = fields;
                    req.files = files;
                    nextCall(null,req.body,req.files);


             });
        },
        function(new_array,files_array,nextCall)
        { 
            var update_record = {};

             if(!isEmpty(req.files))
             {
                _.map(files_array['files'],function (val, key) 
                {
                    var original_file_namee = val.originalFilename;
                    var get_ext_name = fileExtension(original_file_namee);
                    var download_file_namee = new Date().getTime()+'_'+randomAsciiString(25)+'.'+get_ext_name;
                    var temp_path = val.path;
    
                    var physical_path = './uploads/user/'+download_file_namee;
    
                    fs.readFile(temp_path, function(err, data1) {
                        var path = physical_path;    
                            fs.writeFile(path, data1, function(error) {
                                if (error) 
                                { 
                                    console.log(error) 
                                }
                                else{
                                      update_record.image = download_file_namee;

                                      nextCall(null, new_array,update_record);
                                }
                            });
    
                    });
    
                });

             }
             else{
                        update_record.image = '';
                        nextCall(null, new_array,update_record);

                        /*PuzzleSchema.findOneAndUpdate({ "_id": new_array._id }, { $set: update_record }, function (error, results) {
                            if (error) {
                                console.log(err);
                            } 
                        });*/
             }            

           
        },
        function(new_array,update_record,nextCall)
        {    
            var postData = {
                        'email':new_array.email,
                        'first_name': new_array.first_name,
                        'last_name': new_array.last_name,
                        'password':new_array.password,
                        'phone': new_array.phone,                
                        'image': update_record.image,
                        'user_type':'coach',
                        'status':new_array.status
                }

              var user = new UserSchema(postData);

              user.save(function (error, res) {

                        if (error) throw error;

                        nextCall(null, {
                                status: 1,
                                message: 'Coach added successfully.',
                                data: res
                        });
                 });
            
        }      
    ],
        function (err, response) {
            if (err) {
                debug('Logout Error', err);
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
            }
            
            res.sendToEncode(response);    
        })
        
        

}, 

addCoach: function (req, res) {
    // console.log('test',req.body);
    // return false;
    async.waterfall([
        function (nextCall) {
            Uploader.getFormFields(req, nextCall);
        },function (fields, files, nextCall) {

            async.mapSeries(Object.keys(files), function (k, nextFile) {


                // skip files except image files
                if (files.image.type.indexOf('image') === 1) {
                    return nextFile(null, null);
                }
                // console.log('files[k].name', k);
                var extension = path.extname(files.image.name);
                var filename = DS.getTime() + extension;
                var thumb_path = 'uploads/';
                // var large_path = 'uploads/event/large/';
                var thumb_image = thumb_path + filename;
                // var large_image = large_path + filename;
                var imageId;

                async.series([
                    function (nextProc) {
                        Uploader.upload({ // upload thumb file
                            src: files.image.path,
                            dst: rootPath + '/' + thumb_image
                        }, nextProc);
                    },
                    // function (nextProc) { // upload large file
                    //     Uploader.upload({
                    //         src: files.flyer_image.path,
                    //         dst: rootPath + '/' + large_image
                    //     }, nextProc);
                    // },
                    function (nextProc) { // save into tbl_media
                        imageId = filename;
                        nextProc();
                    }
                ], function (err) {
                    console.log('imageId', imageId)
                    return nextFile(err, imageId);
                });
            }, function (err, images) {
                nextCall(err, fields, files, images);
            });
        },
        function (fields, files, images, nextCall) {

            var flyer_image = images;

            var postData = {
                    'email':fields.email,
                    'name': fields.name,
                    //'last_name': fields.last_name,
                    'password':fields.password,
                    'phone': fields.phone,
                    'image': images,
                    'user_type': 'coach',
                    'status':fields.status
            }
            // console.log(postData);
            var user = new UserSchema(postData);

            user.save(function (error, res) {

                if (error) throw error;

                nextCall(null, {
                    status: 1,
                    message: 'Coach added successfully.',
                    data: res
                });
            });
        }
    ],
        function (err, response) {
            if (err) {
                debug('Logout Error', err);
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
            }

                res.sendToEncode(response);
        });
},


coachList: function (req, res) {
    async.waterfall([
        function (nextCall) {
            // UserSchema.find({'user_type':'coach'}.populate('tbl_student'), function (err, results) {
                let length = parseInt(req.query.length);
                let start = parseInt(req.query.start);

                var query = [
                    {
                        "$match":{
                                "user_type" : "coach"
                        }
                    },
                    {
                        "$lookup": {
                            "from" : "tbl_students",
                            "localField" : "_id",
                            "foreignField" : "coach_id",
                            "as" : "total_students"
                        }
                    },
                    {
                        "$project":{
                            "_id": 1,
                            "first_name":1,
                            "last_name":1,
                            "email": 1,
                            "image":1,
                            "created_at":1,
                            "updated_at":1,
                                "total_students": {
                                    "$size": "$total_students"
                                }
                            }
                    },
                    {
                        "$facet": {
                        "totalData": [
                        { "$skip": start },
                        { "$limit": length }
                        ],
                        "totalCount": [
                        { "$count": "count" }
                        ]
                    }
                },
                ]

                UserSchema
                    .aggregate(query)
                    .exec(function (error, results) {
                if (error) {
                        console.log('LOGIN DEVICE TOKEN UPDATE ERROR:', error);
                }
                    nextCall(null, {
                        status: 1,
                        message: 'Coach List',
                        data: results[0]
                    })
            });
        }
    ],function (err, response) {
            if (err) {
                debug('coach List Error', err);
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
            }

            res.sendToEncode(response);
        });
},

getadmin_coach_list : function(req,res)
{
    async.waterfall([
        function (nextCall) 
        {
                var query1 = {};
                var query = {};
                if (req.body.type !== 'all') 
                {
                    var query = {
                        order: [],
                        offset: req.body.offset ? req.body.offset : 0,
                        limit: req.body.limit ? req.body.limit : config.LimitPerPage
                    };
                } else {
                    var query = {
                        order: []
                    };
                }

                /*check for sorting data */
                if (req.body.sort && _.keys(req.body.sort).length > 0) 
                {
                    var sortValues = _.values(req.body.sort);
                    var sortField = _.values(req.body.sort)[0].split('.');
                    if (sortField.length > 1) {
                    } else {
                        query.order.push([sortValues[0], sortValues[1]])
                    }
                } else {
                    query.order.push(['_id', 'DESC'])
                }


                var aggregateQuery = [];

                if (req.body.filter && _.keys(req.body.filter).length > 0) {
                    _.map(req.body.filter, function (val, key) {
                        if (key === 'first_name') 
                        {
                            query1["first_name"] = { $regex: val, $options: 'i' };

                            aggregateQuery.push({
                                $match: {
                                    "first_name": { $regex: val, $options: 'i' }//req.body.filter['name'],
                                }
                            });

                        }
                        else if (key === 'last_name') 
                        {
                            query1["last_name"] = { $regex: val, $options: 'i' };

                            aggregateQuery.push({
                                $match: {
                                    "last_name": { $regex: val, $options: 'i' }//req.body.filter['name'],
                                }
                            });

                        }
                        else if (key === 'date') 
                        {
                            var startDate = moment(val.startDate, "YYYY-MM-DD").startOf('day').toISOString();
                            var endDate = moment(val.endDate, "YYYY-MM-DD").endOf('day').toISOString();

                            query1['created_at'] = { $gt: new Date(startDate), $lt: new Date(endDate) };

                            aggregateQuery.push({
                                $match: {
                                    created_at: { $gt: new Date(startDate), $lt: new Date(endDate) }
                                }
                            });

                        }
                    });
                }
                 

             
                // Stage 1

                aggregateQuery.push({
                    $match: {
                        "user_type" : "coach"
                    }
                });

                // Stage 2
                aggregateQuery.push({
                    $lookup: {
                        from: 'tbl_students',
                        localField: '_id',
                        foreignField: 'coach_id',
                        as: 'total_students'
                    }
                });

                // Stage 3
                aggregateQuery.push({
                    $project: { 
                        "_id":1,
                        "first_name":1,
                        "last_name":1,    
                        "email":1,
                        "image":1,
                        "phone":1,
                        "created_at":1,
                        "updated_at":1, 
                        "status":1,
                        "total_students": {
                            "$size": "$total_students"
                        }
                    }
                });


                // Stage 4
                /*aggregateQuery.push({
                    $facet: { 
                        "totalCount":[
                            { "$count": "count" }
                        ]
                        
                    }
                });*/

                
                 // Stage 5
                /*aggregateQuery.push({
                     $sort: {
                        updated_at: -1, 
                        }
                });*/

                //Stage 6
                aggregateQuery.push({
                    $skip: Number(query.offset)
                });
               
                 // Stage 7
                 aggregateQuery.push({
                    $limit: Number(query.limit)
                });
                

                UserSchema.aggregate(aggregateQuery, function (err, result) 
                    {
                        if (err) 
                        {
                            console.error(err);
                        }
                        else{
                             var body = {};
                             body.rows = result;
                             nextCall(null, body,aggregateQuery,query1)
                             
                        }                            
                    });

                    
        },
        function (body, query2,query1, nextCall) {
            UserSchema.count(query1, function (err, counts) {
                var returnData = {
                    count: counts,
                    rows: body.rows
                }
                nextCall(null, returnData);
            });
        }
    ],
        function (err, response) {
            if (err) {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! Something went wrong." });
            }
            return res.sendToEncode({
                status: 200,
                message: '',
                data: response
            })
        }) 

},

update_status_coach : function(req,res)
{
    async.waterfall([
        function (nextCall) { 

            req.checkBody('cate_id', 'Coach id is required.').notEmpty();

            var error = req.validationErrors();
            if (error && error.length) {
                return nextCall({ message: error[0].msg });
            }

            nextCall(null, req.body);
        },
        function (body, nextCall) {

            var postdata = {
                'status': body.status
            }
              var _id = body.cate_id;

              UserSchema.findOneAndUpdate({ "_id": _id }, { $set: postdata }, function (error, results) {
                if (error) {
                    nextCall({ message: 'Something went wrong.' });
                } else {
                    nextCall(null, {
                        status: 200,
                        message: 'Coach status update successfully.',
                        // data: results
                    });
                }
            });
        }
    ], function (err, response) {
        if (err) {
            return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be update." });
        }

        res.sendToEncode(response);
    });

},

delete_coach : function(req,res)
{
    async.waterfall([
        function (nextCall) {
            req.checkBody('cate_id', 'Coach id is required').notEmpty();

            var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }

                nextCall(null, req.body);
        },
        function (body, nextCall) {
            UserSchema.remove({ _id: body.cate_id }, function (err, adsDetail) 
            {
                if (err) {
                    nextCall({ message: 'Something went wrong.' });
                }
                else{
                    nextCall(null, {
                        status: 200,
                        message: 'Coach delete successfully.',
                        // data: results
                    });
                }
            });
        }
    ],
        function (err, response) {
            if (err) 
            {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be delete." });
            }

            res.sendToEncode(response);
        });

},

updateadmin_coach : function(req,res)
{

    async.waterfall([
        function (nextCall) 
        {
             var form = new multiparty.Form();
             form.parse(req, function(err, fields, files) 
             {  
                    fields = fields || [];

                    for (var key in fields) {
                        if (fields[key].length === 1) {
                            fields[key] = fields[key][0];
                        }
                    }

                        req.body = fields;
                        req.files = files;

                        console.log('-------body-----------');
                        console.log(req.body);

                        var body = req.body;

                    if(!isEmpty(req.files))
                    {
                        console.log('yes that thing is comming');
                        var file_delete_path = './uploads/user/'+req.body.old_image;

                              fs.unlink(file_delete_path, function(error) {
                                    if (error) {
                                        console.log(error);
                                    }                                  
                               });

                    }

                    nextCall(null,req.body,req.files);
             });
        },
        function(new_array,files_array,nextCall)
        { 
            var update_record = {}; 
             
             if(!isEmpty(req.files))
             {
                _.map(files_array['files'],function (val, key) 
                {
                    var original_file_namee = val.originalFilename;
                    var get_ext_name = fileExtension(original_file_namee);
                    var download_file_namee = new Date().getTime()+'_'+randomAsciiString(25)+'.'+get_ext_name;
                    var temp_path = val.path;
    
                    var physical_path = './uploads/user/'+download_file_namee;
    
                            fs.readFile(temp_path, function(err, data1) {
                                var path = physical_path;    
                                    fs.writeFile(path, data1, function(error) {
                                        if (error) 
                                        { 
                                            console.log(error) 
                                        }
                                        else{
                                            update_record.image = download_file_namee;
                                            nextCall(null, new_array,update_record);
                                        }
                                    });
                            });
    
                    });

             }
             else{
                        update_record.image = '';

                        nextCall(null, new_array,update_record);

                        /*PuzzleSchema.findOneAndUpdate({ "_id": new_array._id }, { $set: update_record }, function (error, results) {
                            if (error) {
                                console.log(err);
                            } 
                        });*/
             }
            

            //nextCall(null, new_array);
        },
        function(new_array,update_record,nextCall)
        {    
            var postData = {
                        'email':new_array.email,
                        'first_name': new_array.first_name,
                        'last_name': new_array.last_name,
                        'phone': new_array.phone,                
                        'image': update_record.image,
                        'status':new_array.status
                }


              //var user = new UserSchema(postData);

              /*user.save(function (error, res) {

                        if (error) throw error;

                        nextCall(null, {
                                status: 1,
                                message: 'Coach added successfully.',
                                data: res
                        });
                 });*/

                 UserSchema.findOneAndUpdate({ "_id": new_array._id }, { $set: postData }, function (error, results) {
                    if (error) {
                        console.log(err);
                    }
                      nextCall(null, {
                                status: 1,
                                message: 'Coach Updated successfully.',
                                data: results
                        }); 
                });

            
        }      
    ],
        function (err, response) 
        {
                if (err) {
                    debug('Logout Error', err);
                    return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
                }
                
                res.sendToEncode(response); 
        })


},

/////////end admin ////////coach list //////////////////////////////    

/////////start////////puzzle Category //////////////////////////////

add_puzzle_category: function(req, res) {

        async.waterfall([
           function(nextCall) { // check required parameters
                req.checkBody('name', 'Name is required').notEmpty(); // Name is required

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }
                nextCall(null, req.body);
            },
            function (body, nextCall) {
                var category = new PuzzleCategorySchema(body);
                 category.save(function (error, result) {
                    // console.log('user', user.length);
                    if (error) {
                        return nextCall({ "message": error });
                    }
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Catgory add succesfully.',
                        data: result
                    });

                });
            }
        ], function(err, response) {
            if (err) {
                debug('Category Error', err);
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be logged in." });
            }

            res.sendToEncode(response);
        });
    },

edit_puzzle_cat: function(req,res){
        async.waterfall([
            function (nextCall) { // check required parameters

                req.checkBody('puzzle_cat_id', 'Puzzle Category id is required.').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }

                nextCall(null, req.body);
            },
            function (body, nextCall) {

                var puzzle_cat_id = body.puzzle_cat_id;
                PuzzleCategorySchema.find({ '_id': puzzle_cat_id }, function (err, results) {
                    // console.log(results);
                    // return false;

                    if (err) {
                        nextCall({ message: 'Something went wrong.' });
                    }
                    // console.log('results',results)
                    if (results.length > 0) {
                        //   console.log(results.length);
                        //  return error !== results[0].email;
                        return nextCall(null, results[0], body);
                    } else {
                        return nextCall({ message: 'Puzzle Category id is wrong.' });
                    }
                });
            },
            function (result, body, nextCall) {

                var postdata = {
                    'name': body.name || result.name,
                    'status':body.status
                }

                PuzzleCategorySchema.findOneAndUpdate({ "_id": result._id }, { $set: postdata }, function (error, results) {
                    if (error) {
                        nextCall({ message: 'Something went wrong.' });
                    } else {
                        nextCall(null, {
                            status: 200,
                            message: 'Puzzle Category update successfully.',
                            // data: results
                        });
                    }
                });
            }
        ], function (err, response) {
            if (err) {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be update." });
            }

            res.sendToEncode(response);
        });
    },

delete_puzzle_category: function(req,res)
{
    async.waterfall([
        function (nextCall) {
            req.checkBody('cate_id', 'Puzzle Category is required').notEmpty();

            var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }

                nextCall(null, req.body);
        },
        function (body, nextCall) {
            PuzzleCategorySchema.remove({ _id: body.cate_id }, function (err, adsDetail) 
            {
                if (err) {
                    nextCall({ message: 'Something went wrong.' });
                }
                else{
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Category delete successfully.',
                        // data: results
                    });
                }
            });
        }
    ],
        function (err, response) {
            if (err) 
            {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be delete." });
            }

            res.sendToEncode(response);
        });
     


},

getpuzzleCategorieslist : function(req,res)
{
    var counts = 0;
    async.waterfall([
        function (nextCall) {
            var query1 = {};
            if (req.body.type !== 'all') 
            {
                var query = {
                    order: [],
                    offset: req.body.offset ? req.body.offset : 0,
                    limit: req.body.limit ? req.body.limit : config.LimitPerPage
                };
            } else {
                var query = {
                    order: []
                };
            }

            /*check for sorting data */
            if (req.body.sort && _.keys(req.body.sort).length > 0) 
            {

                var sortValues = _.values(req.body.sort);
                var sortField = _.values(req.body.sort)[0].split('.');
                if (sortField.length > 1) {
                } else {
                    query.order.push([sortValues[0], sortValues[1]])
                }

            } else {
                query.order.push(['_id', 'DESC'])
            }

            /* Check for filter data */
            query1["status"] = { $in: [0,1] };
            if (req.body.filter && _.keys(req.body.filter).length > 0) 
            {
                _.map(req.body.filter, function (val, key) 
                {
                    if (key === 'name') 
                    {
                        query1["name"] = { $regex: val, $options: 'i' }
                    } 
                });
            }
            
            PuzzleCategorySchema.find(query1, {created_at: 1, name: 1, status: 1 }).sort(query.order).skip(Number(query.offset)).limit(Number(query.limit)).exec(function (err, categoriesList) {
                if (err) {
                    //nextCall('SWW-400', null);
                    nextCall({ "message": err });
                }
                var body = {};
                
                body.rows = categoriesList;
                nextCall(null, body, query1);
            });
        },
        function (body, query1, nextCall) {
            // console.log(query1,body)
            PuzzleCategorySchema.count(query1, function (err, counts) {
                if (err) {
                    //nextCall('SWW-400', null);
                     nextCall({ "message": err });
                }

                var returnData = {
                    count: counts,
                    rows: body.rows
                }
                nextCall(null, returnData);
            });
        }
    ],
        function (err, response) {
            if (err) 
            {
                 return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! Something went wrong." });
            }

            return res.sendToEncode({
                status: 200,
                message: 'listing',
                data: response
            })
        }
    );

},

list_puzzle_category_dropdown: function(req, res) {
    async.waterfall([
        function (nextCall) {
             
               var check_option = req.body.option;

               if(check_option==0)
                {
                    var qq = {'status':'0'};
                }
                else if(check_option==1)
                {
                    var qq = {'status':'1'};
                }
                else
                {
                    var qq = {};
                }

            PuzzleCategorySchema.find(qq, function (err, cat) {
                // console.log('user', user.length);
                if (err) {
                    return nextCall({ "message": err });
                }
                nextCall(null, {
                    status: 200,
                    message: 'Puzzle Catgory list.',
                    data: cat
                });
            });
        }
    ], function(err, response) {
        if (err) {
            debug('Category Error', err);
            return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be logged in." });
        }
        res.sendToEncode(response);
    });
},

update_status_puzzle_category : function(req,res)
{
    async.waterfall([
        function (nextCall) { // check required parameters

            req.checkBody('cate_id', 'Puzzle Category id is required.').notEmpty();

            var error = req.validationErrors();
            if (error && error.length) {
                return nextCall({ message: error[0].msg });
            }

            nextCall(null, req.body);
        },
        function (body, nextCall) {

            var postdata = {
                'status': body.status
            }
              var _id = body.cate_id;

            PuzzleCategorySchema.findOneAndUpdate({ "_id": _id }, { $set: postdata }, function (error, results) {
                if (error) {
                    nextCall({ message: 'Something went wrong.' });
                } else {
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Category status update successfully.',
                        // data: results
                    });
                }
            });
        }
    ], function (err, response) {
        if (err) {
            return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be update." });
        }

        res.sendToEncode(response);
    });

},

/////////End////////puzzle Category //////////////////////////////

/////////start//////puzzle Assignment//////////////////////////////


add_puzzle_assignment : function(req,res)
{
    async.waterfall([
        function (nextCall) 
        {
             var form = new multiparty.Form();
             form.parse(req, function(err, fields, files) 
             {  
                    fields = fields || [];

                    for (var key in fields) {
                        if (fields[key].length === 1) {
                            fields[key] = fields[key][0];
                        }
                    }

                    req.body = fields;
                    req.files = files;

                    var body = req.body;
                    
                    var postData = {
                         category_id:body.puzzle_cate_id,
                    }

                     var new_array = [];

                    _.map(JSON.parse(body['fileInfo']), function (val, key)
                    {
                        new_array.push({'name': val.doc_name, image_name: '','cate_id':body.puzzle_cate_id,'status':body.status});

                    });
                                        
                    nextCall(null,new_array,req.files);

             });
        },
        function(new_array,files_array,nextCall)
        { 
            _.map(files_array['files'],function (val, key) 
            {
                var original_file_namee = val.originalFilename;
                var get_ext_name = fileExtension(original_file_namee);
                var download_file_namee = new Date().getTime()+'_'+randomAsciiString(25)+'.'+get_ext_name;
                var temp_path = val.path;

                var physical_path = './uploads/pgn/'+download_file_namee;

                fs.readFile(temp_path, function(err, data1) {
                    var path = physical_path;    
                        fs.writeFile(path, data1, function(error) {
                            if (error) 
                            { 
                                console.log(error) 
                            }
                            else{
                                  var insert_record = {
                                    name:new_array[key].name,
                                    category_id:new_array[key].cate_id,
                                    pgnFile:download_file_namee,
                                    downloadFile_pgn:original_file_namee,
                                    status:new_array[key].status,
                                  }

                                var added_record = new PuzzleSchema(insert_record);
                                added_record.save(function (err, result) 
                                {
                                        if (err) 
                                        {
                                            console.log(err);
                                        }
                                });

                            }
                        });

                });

            });

            nextCall(null, new_array);
        }      
    ],
        function (err, response) {
            if (err) {
                 console.log(err);
            }
            
            res.sendToEncode({
                 status: 200,
                 message: 'Puzzle added successfully.',
                 data: {}
               });
        })      

        

},

getpuzzleassignmentlist : function(req,res)
{
    async.waterfall([
        function (nextCall) 
        {
            //PuzzleSchema = 'tbl_puzzle',
            //PuzzleCategorySchema = 'tbl_puzzle_category',
            //create_date ki jajah modified date display kar va ni hai.
                var query1 = {};
                var query = {};
                if (req.body.type !== 'all') 
                {
                    var query = {
                        order: [],
                        offset: req.body.offset ? req.body.offset : 0,
                        limit: req.body.limit ? req.body.limit : config.LimitPerPage
                    };
                } else {
                    var query = {
                        order: []
                    };
                }

                /*check for sorting data */
                if (req.body.sort && _.keys(req.body.sort).length > 0) 
                {
                    var sortValues = _.values(req.body.sort);
                    var sortField = _.values(req.body.sort)[0].split('.');
                    if (sortField.length > 1) {
                    } else {
                        query.order.push([sortValues[0], sortValues[1]])
                    }
                } else {
                    query.order.push(['_id', 'DESC'])
                }


                var aggregateQuery = [];

                if (req.body.filter && _.keys(req.body.filter).length > 0) {
                    _.map(req.body.filter, function (val, key) {
                        if (key === 'name') 
                        {
                            query1["name"] = { $regex: val, $options: 'i' }

                            aggregateQuery.push({
                                $match: {
                                    "name": { $regex: val, $options: 'i' }//req.body.filter['name'],
                                }
                            });

                        } else if (key === 'category_id' && val!='undefined') 
                        {
                            aggregateQuery.push({
                                $match: {
                                    "category_id": mongoose.Types.ObjectId(req.body.filter['category_id']),
                                }
                            });

                        } else if (key === 'date') 
                        {
                            var startDate = moment(val.startDate, "YYYY-MM-DD").startOf('day').toISOString();
                            var endDate = moment(val.endDate, "YYYY-MM-DD").endOf('day').toISOString();
                            //query1['updated_at'] = { $gte: startDate, $lt: endDate }
                         
                            /*aggregateQuery.push({
                                $match: {
                                    'created_at': { $gte: startDate, $lt: endDate }
                                }
                            });*/

                            aggregateQuery.push({
                                $match: {
                                    created_at: { $gt: new Date(startDate), $lt: new Date(endDate) }
                                }
                            });

                        }
                    });
                }
                 

                // Stage 2
                aggregateQuery.push({
                    $lookup: {
                        from: 'tbl_puzzle_category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'puzzle_category'
                    }
                });

                aggregateQuery.push({
                    $project: { 
                        "_id":1,
                        "name":1,
                        "category_id":1,    
                        "category_name":"$puzzle_category.name",
                        "updated_at":1,
                        "created_at":1,
                        "pgnFile":1,
                        "downloadFile_pgn":1,
                        "status":1,
                    }
                });

                
                 // Stage 4
                aggregateQuery.push({
                     $sort: {
                        updated_at: -1, 
                        }
                });

                //Stage 5
                aggregateQuery.push({
                    $skip: Number(query.offset)
                });
               
                 // Stage 6
                 aggregateQuery.push({
                    $limit: Number(query.limit)
                });
                

                PuzzleSchema.aggregate(aggregateQuery, function (err, result) 
                    {
                        if (err) 
                        {
                            console.error(err);
                        }
                        else{
                             var body = {};
                             body.rows = result;
                             nextCall(null, body,aggregateQuery)
                        }                            
                    });

                    /*PuzzleSchema.find(query1).sort(query.order).skip(Number(query.offset)).limit(Number(query.limit)).exec(function (err, adsList) {
                        if (err) {
                            console.log(err);
                        }
                        
                         console.log(adsList);                        
                        
                    });*/

                   /* PuzzleSchema
                        .find(query1)
                        .sort(query.order)
                        .skip(Number(query.offset))
                        .limit(Number(query.limit))
                        //.populate('tbl_puzzle_category.category_id', 'cate_name cate_status')
                        .exec(function (err, userData) {                        
                            console.log(userData);                     
                        
                    });*/

                        


        },
        function (body, query2, nextCall) {
            PuzzleSchema.count(query2, function (err, counts) {
                var returnData = {
                    count: counts,
                    rows: body.rows
                }
                nextCall(null, returnData);
            });
        }
    ],
        function (err, response) {
            if (err) {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! Something went wrong." });
            }
            return res.sendToEncode({
                status: 200,
                message: '',
                data: response
            })
        })  


},

download_files : function(req,res)
{
    filepath = path.join(__dirname,'../../../uploads/pgn/')+req.body.filename;
    
    return res.sendfile(filepath);
},

delete_puzzle_assignment : function(req,res)
{
    async.waterfall([
        function (nextCall) {
            req.checkBody('cate_id', 'Puzzle Assignment is required').notEmpty();

            var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }

                nextCall(null, req.body);
        },
        function (body, nextCall) {
            PuzzleSchema.remove({ _id: body.cate_id }, function (err, adsDetail) 
            {
                if (err) {
                    nextCall({ message: 'Something went wrong.' });
                }
                else{
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Assignment delete successfully.',
                        // data: results
                    });
                }
            });
        }
    ],
        function (err, response) {
            if (err) 
            {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be delete." });
            }

            res.sendToEncode(response);
        });

},

update_puzzle : function(req,res){

    async.waterfall([
        function (nextCall) 
        {
             var form = new multiparty.Form();
             form.parse(req, function(err, fields, files) 
             {  
                    fields = fields || [];

                    for (var key in fields) {
                        if (fields[key].length === 1) {
                            fields[key] = fields[key][0];
                        }
                    }

                    req.body = fields;
                    req.files = files;

                    var body = req.body;

                    if(!isEmpty(req.files))
                    {
                        var file_delete_path = './public/uploads/pgn/'+req.body.main_pgnFile;

                              fs.unlink(file_delete_path, function(error) {
                                    if (error) {
                                        console.log(error);
                                    }                                  
                               });

                    }
                    
                    nextCall(null,req.body,req.files);


             });
        },
        function(new_array,files_array,nextCall)
        { 

             if(!isEmpty(req.files))
             {
                _.map(files_array['files'],function (val, key) 
                {
                    var original_file_namee = val.originalFilename;
                    var get_ext_name = fileExtension(original_file_namee);
                    var download_file_namee = new Date().getTime()+'_'+randomAsciiString(25)+'.'+get_ext_name;
                    var temp_path = val.path;
    
                    var physical_path = './uploads/pgn/'+download_file_namee;
    
                    fs.readFile(temp_path, function(err, data1) {
                        var path = physical_path;    
                            fs.writeFile(path, data1, function(error) {
                                if (error) 
                                { 
                                    console.log(error) 
                                }
                                else{
                                      var update_record = {
                                        name:new_array.name,
                                        //category_id:new_array[key].cate_id,
                                        pgnFile:download_file_namee,
                                        downloadFile_pgn:original_file_namee,
                                        status:new_array.status,
                                      }

                                    PuzzleSchema.findOneAndUpdate({ "_id": new_array._id }, { $set: update_record }, function (error, results) {
                                        if (error) {
                                            console.log(err);
                                        } 
                                    });
                                }
                            });
    
                    });
    
                });

             }
             else{
                        var update_record = {
                            name:new_array.name,
                            status:new_array.status,
                        }

                        PuzzleSchema.findOneAndUpdate({ "_id": new_array._id }, { $set: update_record }, function (error, results) {
                            if (error) {
                                console.log(err);
                            } 
                        });
             }
            

            nextCall(null, new_array);
        }      
    ],
        function (err, response) {
            if (err) {
                 console.log(err);
            }
            
            res.sendToEncode({
                 status: 200,
                 message: 'Puzzle updated successfully.',
                 data: {}
               });
        })

},
update_status_puzzle_assignment : function(req,res)
{
    async.waterfall([
        function (nextCall) { // check required parameters

            req.checkBody('cate_id', 'Puzzle Assignment id is required.').notEmpty();

            var error = req.validationErrors();
            if (error && error.length) {
                return nextCall({ message: error[0].msg });
            }

            nextCall(null, req.body);
        },
        function (body, nextCall) {

            var postdata = {
                'status': body.status
            }
              var _id = body.cate_id;

              PuzzleSchema.findOneAndUpdate({ "_id": _id }, { $set: postdata }, function (error, results) {
                if (error) {
                    nextCall({ message: 'Something went wrong.' });
                } else {
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Assignment status update successfully.',
                        // data: results
                    });
                }
            });
        }
    ], function (err, response) {
        if (err) {
            return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be update." });
        }

        res.sendToEncode(response);
    });

},

/////////End//////puzzle Assignment//////////////////////////////


add_puzzle: function(req, res) {
        async.waterfall([
            function (nextCall) {

                Uploader.getFormFields(req, nextCall);
            },function (fields, files, nextCall) {

                async.mapSeries(Object.keys(files), function (k, nextFile) {
                    console.log(files[k].name)
                    var extension = path.extname(files[k].name);
                    var filename = DS.getTime() + extension;
                    var thumb_path = 'uploads/pgn/';
                    var thumb_pgn = thumb_path + filename;
                    var pgnId;

                    async.series([
                        function (nextProc) {
                            Uploader.uploadFile({ // upload thumb file
                                src: files[k].path,
                                dst: rootPath + '/' + thumb_pgn
                            }, nextProc);
                        },
                        function (nextProc) { // save into tbl_media
                            pgnId = filename;
                            nextProc();
                        }
                    ], function (err) {
                        console.log('imageId', pgnId)
                        return nextFile(err, pgnId);
                    });
                }, function (err, pgnFile) {
                    nextCall(err, fields, files, pgnFile);
                });
            },
            function (fields, files, pgnFile, nextCall) {

                // var flyer_image = images;

                var postData = {
                    'name':fields.puzzle,
                    'category_id':fields.category_id,
                    'pgnFile':pgnFile,
                    }
                // console.log(postData);
                var puzzle = new PuzzleSchema(postData);

                puzzle.save(function (error, res) {

                    if (error) throw error;

                    nextCall(null, {
                        status: 1,
                        message: 'Puzzle added successfully.',
                        data: res
                    });
                });

                    
                
            }
        ],
            function (err, response) {
                if (err) {
                    debug('Logout Error', err);
                    return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be Insert." });
                }

                res.sendToEncode(response);
            });
    },

edit_puzzle: function(req,res){
        async.waterfall([
            function (nextCall) { // check required parameters

                req.checkBody('puzzle_id', 'Puzzle id is required.').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }

                nextCall(null, req.body);
            },
            function (body, nextCall) {

                var puzzle_id = body.puzzle_id;
                PuzzleSchema.find({ '_id': puzzle_id }, function (err, results) {
                    // console.log(results);
                    // return false;

                    if (err) {
                        nextCall({ message: 'Something went wrong.' });
                    }
                    // console.log('results',results)
                    if (results.length > 0) {
                        //   console.log(results.length);
                        //  return error !== results[0].email;
                        return nextCall(null, results[0], body);
                    } else {
                        return nextCall({ message: 'Puzzle id is wrong.' });
                    }
                });
            },
            function (result, body, nextCall) {

                var postdata = {
                    'name': body.name || result.name,
                }

                PuzzleSchema.findOneAndUpdate({ "_id": result._id }, { $set: postdata }, function (error, results) {
                    if (error) {
                        nextCall({ message: 'Something went wrong.' });
                    } else {
                        nextCall(null, {
                            status: 200,
                            message: 'Puzzle update successfully.',
                            // data: results
                        });
                    }
                });
            }
        ], function (err, response) {
            if (err) {
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be update." });
            }

            res.sendToEncode(response);
        });
    },

    list_puzzle_category: function(req, res) {
        async.waterfall([
            function (nextCall) {
                PuzzleCategorySchema.find({}, function (err, cat) {
                    // console.log('user', user.length);
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle Catgory list.',
                        data: cat
                    });
                });
            }
        ], function(err, response) {
            if (err) {
                debug('Category Error', err);
                return res.sendToEncode({ status: 400, message: (err && err.message) || "Oops! You could not be logged in." });
            }
            res.sendToEncode(response);
        });
    },


puzzleList: function(req, res) {
        async.waterfall([
            function (nextCall) {
                PuzzleSchema.find().populate('category_id').exec(function (err, res) {
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    nextCall(null, {
                        status: 200,
                        message: 'Puzzle List',
                        data: res
                    });
                });
            }
        ], function(err, response) {
            if (err) {
                debug('Category Error', err);
                return res.sendToEncode({ status: 0, message: (err && err.message) || "Oops! You could not be logged in." });
            }

            res.sendToEncode(response);
        });
    },

studentCoachWise: function(req, res) {
        async.waterfall([
            function(nextCall) { // check required parameters

                req.checkBody('coach_id', 'Coach is required').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }
                nextCall(null, req.body);
            },
            function (body, nextCall) {
                StudentSchema.find({ 'coach_id': body.coach_id }, function (err, student) {
                    if (err) {
                        return nextCall({ "message": err });
                    }
                     nextCall(null, {
                            status: 1,
                            message: 'Student List.',
                            data: student
                        });
                });
            }
        ], function(err, response) {
            if (err) {
                debug('Login Error', err);
                return res.sendToEncode({ status: 0, message: (err && err.message) || "Oops! You could not be logged in." });
            }

            res.sendToEncode(response);
        });
    },
    
test: function (req, res) {
        res.sendToEncode({ status: 1, message: "TEST MESSAGE", data: { message: 'test' } });
    }

};



