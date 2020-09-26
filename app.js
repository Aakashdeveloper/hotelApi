const express = require('express');
const app = express();
const port = process.env.PORT||8999;
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:mongo@123@cluster0-f8vmc.mongodb.net/hotels?retryWrites=true&w=majority";

var cors = require('cors');
let db;
app.use(cors());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send("Health check working")
})

//restaurant
app.get('/hotels',(req,res) => {
    var query = {}
    if(req.query.city && req.query.bookingtype){
        query={city:req.query.city,"type.roomtype": req.query.bookingtype}
    }
    else if(req.query.city){
        query = {city:req.query.city} 
    }else if(req.query.bookingtype){
        query={"type.roomtype": req.query.bookingtype}
    }
    
    db.collection('hotelname').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.get('/hotelsdetails/:id',(req,res) => {
    console.log(req.params.id)
    var query = {_id:req.params.id}
    db.collection('hotelname').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.get('/hotellist/:trip',(req,res) => {
    var query = {}
    var sort = {cost:1}
    if(req.params.trip&&req.query.lcost && req.query.hcost&&req.query.sort){
        query = {"type.roomtype": req.query.roomtype,"tripType.trip":req.params.trip,cost:{$lt:parseInt(req.query.hcost),$ht:parseInt(req.query.lcost)}}
        sort={cost:parseInt(req.query.sort)} 
    }
    else if(req.params.trip&&req.query.lcost && req.query.hcost){
        query = {"tripType.trip":req.params.trip,cost:{$lt:parseInt(req.query.hcost),$gt:parseInt(req.query.lcost)}}
    }
    else if(req.params.trip&&req.query.sort){
        query = {"type.roomtype": req.query.roomtype,"tripType.trip":req.params.trip}
        sort={cost:parseInt(req.query.sort)} 
    }
    else if(req.query.lcost && req.query.hcost){
        query = {"type.roomtype": req.query.roomtype,cost:{$lt:parseInt(req.query.hcost),$gt:parseInt(req.query.lcost)}}
        sort={cost:1} 
    }
    else if(req.params.trip&&req.query.roomtype){
        query = {"type.roomtype": req.query.roomtype,"tripType.trip":req.params.trip} 
    }
    else if(req.params.trip){
        query = {"tripType.trip":req.params.trip}
    } 
    else if(req.query.lcost && req.query.hcost){
        query={"type.roomtype": req.query.roomtype,cost:{$gt:parseInt(req.query.hcost),$lt:parseInt(req.query.lcost)}}
    }else if(req.query.sort){
        query={"type.roomtype": req.query.roomtype}
        sort={cost:parseInt(req.query.sort)}
    }else{
        query = {"type.roomtype": req.query.roomtype}
        sort = {cost:1}
    }
    db.collection('hotelname').find(query).sort(sort).toArray((err,result) => {
        if(err) throw err;
        res.status(200).send(result)
    })
})

//hotels
app.get('/hotelall',(req,res) => {
    db.collection('hotelname').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


//City List
app.get('/location',(req,res) => {
    db.collection('city').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//room
app.get('/rooms',(req,res) => {
    db.collection('rooms').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//room
app.get('/booking',(req,res) => {
    db.collection('bookingtype').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})




app.get('/allBooking',(req,res) => {
    db.collection('booking').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//placeorder
//Post
app.post('/placeBooking',(req,res)=>{
    console.log(">>>>>>",req.body);

    db.collection('booking').insertOne(req.body,(err,result) => {
        if(err){
            throw err
        }else{
            res.redirect('/')
        }
    });
});

MongoClient.connect(uri,{ useUnifiedTopology: true },(err,client) => {
    if(err) console.log(err)
    db= client.db('hotels');
    app.listen(port,(err) => {
        if(err) throw err;
        console.log(`Server is running on port ${port}`)
    })
})
