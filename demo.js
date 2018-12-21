var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mldn");
    // dbo.collection("site").insertOne({ "username": "123456", "password": "123456" }, function(err, result) {
    //     if (err) throw err;
    //     // console.log(result);
    //     db.close();
    // });
    dbo.collection("site").find().toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;
        console.log(result);
        db.close();
    });
    // dbo.collection("site").find({ "username": "admin" }, { "_id": 0 }).toArray(function(err, result) {
    //     if (err) throw err;
    //     console.log(result);
    //     db.close();
    // });
    // dbo.collection("site").deleteOne({ "username": "yuytu" }, function(err, result) {
    //     if (err) throw err;
    //     // console.log(result);
    //     db.close();
    // });
});