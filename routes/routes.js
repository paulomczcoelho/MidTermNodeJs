const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// image upload
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single('image');

//Insert an user into database route
router.post('/add', upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();
    
    req.session.message = {
      type: 'success',
      message: 'User Added Successfully',
    };
    console.log(req.session.message);
    res.redirect('/');
  } catch (error) {
    res.json({ message: error.message, type: 'danger' });
  }
});


//Get all users route
router.get('/', async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('index.ejs', {
        title: "Home Page",
        users: users,
      });
    } catch (error) {
      res.json({ message: error.message });
    }
  });

  // Edit user route
  router.get('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id).exec();
  
      if (user == null) {
        res.redirect('/');
      } else {
        res.render('edit_users.ejs', {
          title: "Edit User",
          user: user,
        });
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  });

  //Update user route 
  router.post('/update/:id', upload, async (req, res) => {
    try {
      const id = req.params.id;
      let newImage = '';
  
      if (req.file) {
        newImage = req.file.filename;
        try {
          fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (error) {
          console.log(error);
        }
      } else {
        newImage = req.body.old_image;
      }
  
      const updatedUser = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
      };
  
      await User.findByIdAndUpdate(id, updatedUser).exec();
      req.session.message = {
        type: 'success',
        message: 'User Updated Successfully!',
      };
      res.redirect('/');
    } catch (error) {
      res.json({ message: error.message, type: 'danger' });
    }
  });

router.get('/add', (req, res) => {
  res.render('add_users.ejs', { title: 'Add Users' });
});

//Delete user route

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id).exec();
        try {
        fs.unlinkSync('./uploads/' + deletedUser.image);
        } catch (error) {
        console.log(error);
        }
        req.session.message = {
        type: 'success',
        message: 'User Deleted Successfully!',
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});

module.exports = router;

