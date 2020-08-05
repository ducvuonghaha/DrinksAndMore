let express = require('express');
let app = express();
let hbs = require('express-handlebars');

let path = require('path');
app.use(express.static(path.join(__dirname + '/public')));

let bp = require('body-parser');
app.use(bp.urlencoded({extended: false}));

let multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './public/uploads/images');
    },
    filename(req, file, cb) {
        cb(null, file.originalname);
    }
});

let upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        // allow images only
        if (!file.originalname.match(/\.(png)$/)) {
            return cb(new Error('chỉ tải được ảnh'), false);
        }
        cb(null, true);
    }
});


let mongoDB = 'mongodb+srv://vuong:meovuong201099@cluster0-rarlv.gcp.mongodb.net/DRINKS';

let db = require('mongoose');

let Schema = db.Schema;

let collection = "Foods";

let foods = new Schema({
    name: String,
    price: Number,
    description: String,
    type: String,
    quantity: Number,
    image: String
});

db.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log('ket noi mongoDB thanh cong');

app.engine('.hbs', hbs({

    extname: 'hbs',
    defaultLayout: false,
    layoutsDir: 'views'

}));

app.set('view engine', '.hbs');

let file = upload.single("exImage");

app.post('/uploadPD', function (req, res) {
    file(req, res, async function (err) {
        if (err) {
            res.render('uploadPD', {status: err});
        }
        let sm = req.body.sm;
        let nameSP = req.body.nameSP;
        let priceSP = req.body.priceSP;
        let descriptionSP = req.body.descriptionSP;
        let typeSP = req.body.typeSP;
        let slSP = req.body.slSP;
        let image = req.file.originalname;
        let add = db.model(collection, foods, 'Foods');

        if (nameSP && priceSP && descriptionSP && typeSP && image && sm == 1) {
            let products = await add.find({
                name: nameSP,
                price: priceSP,
                description: descriptionSP,
                type: typeSP,
                quantity: slSP,
                image: image
            }).lean();   //dk
            if (products.length <= 0) {
                let result = add({
                    name: nameSP,
                    price: priceSP,
                    description: descriptionSP,
                    type: typeSP,
                    quantity: slSP,
                    image: image
                }).save(function (err) {
                    if (err == null)
                        res.render('uploadPD', {status: 'Thêm thành công'});
                    else res.render('uploadPD', {status: err.message});
                });
            } else {
                res.render('uploadPD', {status: 'Sản phẩm đã tồn tại'});
            }
        } else {
            res.render('uploadPD');
        }
    })
});

app.get('/uploadPD', function (req, res) {
    res.render('uploadPD');
});

app.get("/updatePD", async function (req, res) {
    let id = req.query.idSP;
    let list = db.model(collection, foods, 'Foods');
    let result = await list.findById(id);
    console.log(id);
    res.render('updatePD', {
        id: result._id,
        name: result.name,
        price: result.price,
        image: result.image,
        description: result.description,
        type: result.type,
        quantity: result.quantity
    });

});

let file2 = upload.single("exImageUD");
app.post('/updatePD', function (req, res) {
    file2(req, res, async function (err) {
        if (err) {
            res.render('updatePD', {status: err});
        }
        let id = '5f2b039068b0ca0d14db8760';
        let name = req.body.nameSPUD;
        let price = req.body.priceSPUD;
        let descriptionSP = req.body.descriptionSPUD;
        let typeSP = req.body.typeSPUD;
        let slSP = req.body.slSPUD;
        let image = req.file.originalname;
        let update = db.model(collection, foods, 'Foods');

        console.log(id);
        let kq = await update.updateOne({_id: id}, {
            name: name,
            price: price,
            description: descriptionSP,
            type: typeSP,
            quantity: slSP,
            image: image
        }, function (err) {
            if (err == null)
                res.render('updatePD', {status: 'Sửa thành công'});
            else res.render('updatePD', {status: err.message});
        });
    })
});


app.get('/deletePd', (req, res) => {
    let id = req.query.idSP;
    let deletee = db.model(collection, foods, 'Foods');
    let kq = deletee.deleteOne({_id: id}, function (err) {
        if (err == null)
            res.render('product', {status: 'Xóa thành công'});
        else res.render('product', {status: err.message});
    });
});

app.get('/product', (req, res) => {
    let list = db.model(collection, foods, 'Foods');
    let result = list.find({}, function (err, data) {
        if (err == null)
            res.render('product', {data: data});
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
});


app.get('/signup', function (req, res) {
    res.render('signup');
});

app.get('/product', function (req, res) {
    let list = db.model(collection, foods, 'Foods');
    let result = list.find({}, function (err, data) {
        if (err == null)
            res.render('product', {data: data});
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
});

app.post('/home', function (req, res) {
    res.render('home');
});

app.get('/', function (req, res) {
    res.render('index');
}).listen(9696);