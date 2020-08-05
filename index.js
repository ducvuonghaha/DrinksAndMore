let express = require('express');
let app = express();
let hbs = require('express-handlebars');

let path = require('path');
app.use(express.static(path.join(__dirname + '/public')));

let bp = require('body-parser');
app.use(bp.urlencoded({extended: false}));

let mongoDB = 'mongodb+srv://vuong:meovuong201099@cluster0-rarlv.gcp.mongodb.net/DRINKS';

let db = require('mongoose');

let Schema = db.Schema;

let collection = "Foods";

let foods = new Schema({
    name: String,
    price: Number,
    description: String
});

db.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log('ket noi mongoDB thanh cong');

app.engine('.hbs', hbs({

    extname: 'hbs',
    defaultLayout: '',
    layoutsDir: ''

}));

app.set('view engine', '.hbs');

app.post('/', function (req, res) {

});

let model = 'Foods';

app.get('/add', (req, res) => {
    let add = db.model(collection, foods, 'Foods');
    let result = add({
        name: 'Kẹo Lạc',
        price: 50000,
        description: 'Ngon hơn khi ăn cùng trà'
    }).save(function (err) {
        if (err == null)
            res.send('Luu thanh cong, kiem tra DB');
        else res.send('Luu that bai : ' + err.message);
    });
});

app.get('/update', (req, res) => {
    let id = '5f2a0b347717535bf0a1a4a5';
    let update = db.model(collection, foods, 'Foods');
    let kq = update.updateOne({_id: id}, {
        name: 'Kẹo bông',
        price: 40000,
    }, function (err) {
        if (err == null)
        res.send('Sua thanh cong, kiem tra DB');
        else res.send('Sua that bai : ' + err.message)
    });
});

app.get('/delete', (req, res) => {
    let id = '5f2a0b347717535bf0a1a4a5';
    let update = db.model(collection, foods, 'Foods');
    let kq = update.deleteOne({_id: id}, function (err) {
        if (err == null)
        res.send('Xoa thanh cong, kiem tra lai DB');
        else res.send('Xoa that bai : ' + err.message);
    });
});

app.get('/select', (req, res) => {
    let list = db.model(collection, foods, 'Foods');
    let result = list.find({}, function (err, data) {
        if (err == null)
        res.send(data);
        else res.send('Lay danh sach that bai : ' + err.message);
    });
});


app.get('/signup', function (req, res) {
    res.render('signup');
});

app.get('/product', function (req, res) {
    res.render('product');
});

app.post('/home', function (req, res) {
    res.render('home');
});

app.get('/', function (req, res) {
    res.render('index');
}).listen(6969);