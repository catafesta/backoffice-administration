'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileHandler = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    fastcsv = require('fast-csv'),
    async = require('async'),
    fs = require('fs'),
    DBModel = db.epg_data;

/**
 * Create
 */
exports.create = function(req, res) {

  DBModel.create(req.body).then(function(result) {
    if (!result) {
      return res.status(400).send({message: 'fail create data'});
    } else {
      return res.jsonp(result);
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.save_epg_records = function(req, res){

    if(req.body.delete_existing === true){
        DBModel.destroy({
            where: {id: {gt: -1}}
        }).then(function (result) {
            read_and_write_epg();
            return null;
        }).catch(function(error) {
            return res.status(400).send({message: 'Unable to proceed with the action'}); //serverside filetype validation
        });
    }
    else{
        read_and_write_epg();
    }

    function read_and_write_epg(){
        if(fileHandler.get_extension(req.body.epg_file)=== '.csv'){
            var stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file); //link main url

            fastcsv.fromStream(stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
                if(req.body.channel_number){
                    return data.channel_number == req.body.channel_number;
                }
                else{
                    return data;
                }
            }).on("data-invalid", function(data){
                //these data were filtered out
            }).on("data", function(data){
                //TODO: handle error of malformed csv
                DBModel.create({
                    channels_id: data.channel_id,
                    channel_number: data.channel_number,
                    title: data.title,
                    short_name: data.short_name,
                    short_description: data.short_description,
                    program_start: data.program_start,
                    program_end: data.program_end,
                    long_description: data.long_description,
                    duration_seconds: (Date.parse(data.program_end) - Date.parse(data.program_start))/1000 //parse strings as date timestamps, convert difference from milliseconds to seconds
                }).then(function (result) {
                    //todo: return some response?
                }).catch(function(error) {
                    return res.status(400).send({message: 'Unable to save the epg records'}); //serverside filetype validation
                });

            });
            //todo: move response to success case?
            return res.status(200).send({message: 'Epg records were saved'}); //serverside filetype validation
        }
        else if(fileHandler.get_extension(req.body.epg_file)=== '.xml'){
            //TODO: create code for handling other types like xml, xls etc
        }
        else {
            return res.status(400).send({message: 'Incorrect file type'}); //serverside filetype validation
        }
    }
    
}

/**
 * Create
 */
exports.epg_import = function(req, res) {

  var qwhere = {},
      final_where = {},
      query = req.query;

  if(query.q) {
    qwhere.$or = {};
    qwhere.$or.channel_number = {};
    qwhere.$or.channel_number.$like = '%'+query.q+'%';
    qwhere.$or.title = {};
    qwhere.$or.title.$like = '%'+query.q+'%';
    qwhere.$or.short_name = {};
    qwhere.$or.short_name.$like = '%'+query.q+'%';
    qwhere.$or.short_description = {};
    qwhere.$or.short_description.$like = '%'+query.q+'%';
    qwhere.$or.long_description = {};
    qwhere.$or.long_description.$like = '%'+query.q+'%';
  }


  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  final_where.include = [];
  //end build final where


  DBModel.findAndCountAll(
      final_where
  ).then(function(results) {
    if (!results) {
      return res.status(404).send({
        message: 'No data found'
      });
    } else {
      res.setHeader("X-Total-Count", results.count);
      res.json(results.rows);
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};



/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.epgData);
};

/**
 * Update
 */
exports.update = function(req, res) {
  var updateData = req.epgData;

  updateData.updateAttributes(req.body).then(function(result) {
    res.json(result);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.epgData;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {
      result.destroy().then(function() {
        return res.json(result);
      }).catch(function(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });
    } else {
      return res.status(400).send({
        message: 'Unable to find the Data'
      });
    }
    return null;
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List
 */
exports.list = function(req, res) {
    
    var qwhere = {},
      final_where = {},
      query = req.query;

  if(query.q) {
    qwhere.$or = {};
    qwhere.$or.channel_number = {};
    qwhere.$or.channel_number.$like = '%'+query.q+'%';
    qwhere.$or.title = {};
    qwhere.$or.title.$like = '%'+query.q+'%';
    qwhere.$or.short_name = {};
    qwhere.$or.short_name.$like = '%'+query.q+'%';
    qwhere.$or.short_description = {};
    qwhere.$or.short_description.$like = '%'+query.q+'%';
    qwhere.$or.long_description = {};
    qwhere.$or.long_description.$like = '%'+query.q+'%';
  }


  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  final_where.include = [];
  //end build final where

  DBModel.findAndCountAll(
      final_where
  ).then(function(results) {
    if (!results) {
      return res.status(404).send({
        message: 'No data found'
      });
    } else {
      res.setHeader("X-Total-Count", results.count);      
      res.json(results.rows);
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

  if ((id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Data is invalid'
    });
  }

  DBModel.find({
    where: {
      id: id
    },
    include: []
  }).then(function(result) {
    if (!result) {
      return res.send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.epgData = result;
      next();
      return null;
    }
  }).catch(function(err) {
    return next(err);
  });

};
