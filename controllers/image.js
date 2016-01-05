var fs = require('fs'),
    path = require('path');

var sidebar = require('../helpers/sidebar'),
    Models = require('../models');;

var viewModel = {
    image: {},
    comments: []
};


module.exports = {
    index: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function(err, image) {
            if (err) { 
                throw err; 
            }
            if (image) {
                image.views = image.views + 1;
                viewModel.image = image;
                image.save();
                
                Models.Comment.find({ image_id: image._id}, {}, { sort: { 'timestamp': 1 }}, function(err, comments){
                    if (err) { 
                        throw err; 
                    }

                    viewModel.comments = comments;
                    sidebar(viewModel, function(viewModel) {
                        res.render('image', viewModel);
                    });     
                });  
                
            } else {
                res.redirect('/');
            } 
        });
    },
    
    create: function(req, res) {
        var saveImage = function() {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';

            for(var i=0; i < 6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            Models.Image.find({ filename: imgUrl }, function(err, images) {
                if (images.length> 0) {
                    saveImage();
                } else {
                    var tempPath = req.file.path,
                        ext = path.extname(req.file.originalname).toLowerCase(),
                        targetPath = path.resolve('./public/upload/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, function(err) {
                            if (err) throw err;
                            
                            var newImg = new Models.Image({
                                title: req.body.title,
                                description: req.body.description,
                                filename: imgUrl + ext
                            });
                            newImg.save(function(err, image) {
                                if (err) { 
                                    throw err; 
                                }
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/' + image.uniqueId);
                            });            
                        });
                    } else {
                        fs.unlink(tempPath, function(err) {
                            if (err) throw err;
                            res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        }
        
        saveImage();
    },
    like: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function(err, image) {
            if (!err && image) {
                image.likes = image.likes + 1;
                image.save(function(err) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json({ likes: image.likes });
                    }
                });
            }
        });
    },
    comment: function(req, res) {
        res.send('The image:comment POST controller');
    }
};