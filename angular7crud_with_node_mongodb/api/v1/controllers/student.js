var debug = require('debug')('x-code:v1:controllers:user'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
    path = require('path'),
    shortid = require('shortid'),
    _ = require('underscore'),

    StudentSchema = require('../models/Student'),
    UserSchema = require('../models/User'),

    config = rootRequire('config/global'),
    ED = rootRequire('services/encry_decry'),
    Uploader = rootRequire('support/uploader'),
    Mailer = rootRequire('support/mailer'),
    DS = rootRequire('services/date'); // date services

module.exports = {
    studentLogin: function(req, res) {
        async.waterfall([
            function(nextCall) { // check required parameters
                req.checkBody('email', 'Email is required').notEmpty(); // Name is required
                req.checkBody('email', 'Email is not a valid').isEmail();
                req.checkBody('first_name', 'First name is required').notEmpty();
                req.checkBody('last_name', 'Last name is required').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    return nextCall({ message: error[0].msg });
                }
                nextCall(null, req.body);
            },
            function (body, nextCall) {
                StudentSchema.find({}, function (err, std) {
                    // console.log('user', user.length);
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    // console.log('std',std.length);
                   nextCall(null, body, std.length)

                });
            },
            function (body, stud, nextCall) {
                // console.log('body.email',body.email);
                StudentSchema.find({ 'email': body.email }, function (err, student) {
                    // console.log('user', user.length);
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    // console.log('studentaaaaaaaaaaaaaaa',student[0]._id);
                    if(student.length > 0 ){ 
                            
                            device_id = body.device_id;
                            StudentSchema.findOneAndUpdate({ "_id": student[0]._id }, { $set: { "device_id": device_id } }, function (error, results) {
                                    if (error) {
                                        console.log('LOGIN DEVICE TOKEN UPDATE ERROR:', error);
                                    }

                                    var data = {
                                        '_id': results._id,
                                        'first_name': results.first_name,
                                        'last_name': results.last_name,
                                        'phone': results.phone,
                                        'email': results.email,
                                        'created_at': results.created_at,
                                        'updated_at': results.updated_at,
                                    }
                                    nextCall(null,{
                                        status: 1,
                                        message: 'Signup successfully.',
                                        data: data
                                    });
                                });



                    } else {

                    let dateObj = new Date();
                    let month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2);
                    let year = dateObj.getUTCFullYear();
                    

                        if(stud < 10){

                            count = stud;
                            total = stud == 0 ? 1 : Number(count) + 1;
                            total = '0' + total;
                        } else {
                            count = stud;
                            total = Number(count) + 1;
                            
                        }
                    var postData = {
                        'coach_id':body.coach_id,
                        'email':body.email,
                        'first_name': body.first_name,
                        'last_name': body.last_name,
                        'uniqueId': 'STU/'+month+year+'/'+total,
                    }

                    //   console.log('postData',postData);
                      var studentTab = new StudentSchema(postData);

                    //   console.log('student',student);

                        studentTab.save(function (error, result) {
                            console.log(error);
                            if (error) {
                                // res.send({ "status":0, "message": 'Opps! You could not be registered.'});
                                return nextCall({"message": 'Opps! You could not be registered.' });
                            }
                            // res.send({"status":1,"message":"Email has been sent. Please verify your account once."});
                            nextCall(null, {
                                status: 200,
                                message: 'Signup successfully.',
                                data: result
                            });
                        });
                    }


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

    studentList: function(req, res) {
        async.waterfall([
            function (nextCall) {
                console.log('req,',JSON.stringify(req.query.order));
                 let length = parseInt(req.query.length);
                 let start = parseInt(req.query.start);

                 console.log(start);

                 var query = [
                     
                       {
                       "$lookup": {
                        "from": 'tbl_users',
                        "localField": 'coach_id',
                        "foreignField": '_id',
                        "as": 'coach'
                        }
                   },
                //    {
                //         "$project": {
                //         "coach": {
                //             "$arrayElemAt": [ '$coach', 0 ]
                //         }
                //         }
                //     },
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

                    StudentSchema
                        // .populate('coach_id')
                        .aggregate(query)
                        .exec(function (err, res) {
            //   StudentSchema.find().populate('coach_id').limit(length).skip(start).exec(function (err, res) {
                    if (err) {
                        return nextCall({ "message": err });
                    }
                    // res['totalrecords']= res.count();
                    nextCall(null, {
                        status: 200,
                        message: 'Student List',
                        data: res[0]
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

    getstudentlist_admin:function(req,res)
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
        
                        /*aggregateQuery.push({
                            $match: {
                                "user_type" : "coach"
                            }
                        });*/
        
                        // Stage 2
                        aggregateQuery.push({
                            $lookup: {
                                from: 'tbl_users',
                                localField: 'coach_id',
                                foreignField: '_id',
                                as: 'coach'
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
                                'coach_id':1,
                                "coach_first_name":"$coach.first_name",
                                "coach_last_name":"$coach.last_name",
                                "uniqueId":1,

                            }
                        });
        
                        
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
                        
        
                        StudentSchema.aggregate(aggregateQuery, function (err, result) 
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
                    StudentSchema.count(query1, function (err, counts) {
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

    update_status_student_admin : function(req,res)
    {
        async.waterfall([
            function (nextCall) { 
    
                req.checkBody('cate_id', 'Student id is required.').notEmpty();
    
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
    
                  StudentSchema.findOneAndUpdate({ "_id": _id }, { $set: postdata }, function (error, results) {
                    if (error) {
                        nextCall({ message: 'Something went wrong.' });
                    } else {
                        nextCall(null, {
                            status: 200,
                            message: 'student status update successfully.',
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
        

    }
};
