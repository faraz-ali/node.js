var express = require('express');
var router = express.Router();

//date
router.get('/date', function (req, res, next) {
  res.render('date', { title: 'Express' });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

//Get Orders as JSON
router.get('/orderJSON', function (req, res) {
  var db = req.db;

  db.query('SELECT * FROM orders', function (err, rows) {
    if (err) res.send(err);
    console.log(rows);
    res.send(rows);

  });
});

//Get orders page
router.get('/orders', function (req, res) {
  var db = req.db;

  db.query('SELECT * FROM orders', function (err, rows) {
    //if (err) res.send(err);
    //console.log(rows);
    res.render('orders', {
      orders: rows
    });
  });
});


/* GET New Order Form page. */
router.get('/neworder', function (req, res) {
  res.render('neworder', { title: 'Add New Order' });
});


//POST to addorder page
router.post('/addorder', function (req, res) {
  var db = req.db;
  var data = {
    order_type: req.body.order_type,
    product_id: req.body.product_id,
    billing_address: req.body.billing_address,
    shipping_address: req.body.shipping_address
  };

  db.query('INSERT INTO orders SET ?', data, function (err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      // If it worked, set the header so the address bar doesn't still say /addproduct
      res.location("orders");
      // And forward to success page
      res.redirect("orders");
    }
  });
});

/* GET New Order Form page. */
router.get('/search', function (req, res) {
  res.render('search', { title: 'Search Orders and Products' });
});

///// search orders and retrieve products
router.post('/getsearch', function (req, res) {
  var mongodb = req.mongodb;
  var db = req.db;
  var collection = mongodb.get('products');

  var order_id = req.body.order_id;
  var p_id = req.body.product_id;
  //if only product id is provided, search product and any existing orders
  if (!order_id && p_id) {
    collection.find({ "product_id": p_id }, {}, function (e, docs) {
      //find corresponding order in order table
      db.query('SELECT * FROM orders WHERE product_id= ?', [p_id], function (err, rows) {
        if (err) {
          console.log(err); res.send(err);
        }
        console.log(rows, docs);
        res.render('results', { products: docs, orders: rows });
      });
    });
  } else {
    db.query('SELECT * FROM orders WHERE order_id= ?', [order_id], function (err, rows) {
      if (err) {
        console.log(err);
        res.send(err);
      } if (rows.length < 1) {
        return res.send("Order Not found");
      }
      collection.find({ "product_id": rows[0].product_id }, {}, function (e, docs) {
        console.log(rows, docs);

//        res.send({ "order_id": order_id, "product": docs });
        res.render('results', { orders: rows, products: docs });
      });
    });
  }
});

////*MONGO DB*/////////////////////

/* GET products page. */
router.get('/products', function (req, res) {
  var mongodb = req.mongodb;
  var collection = mongodb.get('products');

  collection.find({}, {}, function (e, docs) {
    //console.log(docs);
    res.render('products', {
      products: docs
    });
  });
});

/* GET products as JSON. */
router.get('/productsJSON', function (req, res) {
  var mongodb = req.mongodb;
  var collection = mongodb.get('products');

  collection.find({}, {}, function (e, docs) {
    //console.log(docs);
    res.send(docs);
  });
});

/* GET New Product page. */
router.get('/newproduct', function (req, res) {
  res.render('newproduct', { title: 'Add New Product' });
});

/* POST to Add new product */
router.post('/addproduct', function (req, res) {
  console.log(req.body);  
  // Set our internal DB variable
  var mongodb = req.mongodb;
  // Set our collection
  var collection = mongodb.get('products');
  var cost = req.body.currency + req.body.price;    
  // Submit to the DB
  collection.insert({
    "product_id": req.body.product_id,
    "manufacturer": req.body.manufacturer,
    "device": req.body.device,
    "descriptionEn": req.body.descriptionEn,
    "descriptionCn": req.body.descriptionCn,
    "price": cost,
    "date": req.body.date
  }, function (err, doc) {
      if (err) {
        // If it failed, return error
        console.log(err);
        res.send("There was a problem adding the information to the database.");
      }
      else {
        // If it worked, set the header so the address bar doesn't still say /adduser
        res.location("products");
        // And forward to success page
        res.redirect("products");
      }
    });
});


///////*MONGO DB*//////////////////////