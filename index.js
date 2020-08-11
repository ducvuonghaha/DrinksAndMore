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
        let id = req.body.IDSPUD;
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
        // res.send(JSON.stringify(data));
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
});

app.get('/productJSON', (req, res) => {
    let list = db.model(collection, foods, 'Foods');
    let result = list.find({}, function (err, data) {
        if (err == null)
            // res.render('product', {data: data});
            res.send(JSON.stringify(data));
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
});


// app.get('/product', function (req, res) {
//     let list = db.model(collection, foods, 'Foods');
//     let result = list.find({}, function (err, data) {
//         if (err == null)
//             res.render('product', {data: data});
//         else res.send('Lay danh sach that bai : ' + err.message);
//     }).lean();
// });

app.post('/home', function (req, res) {
    res.render('home');
});


let collectionUsers = "Users";

let Users = new Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    address: String
});


app.get('/signup', function (req, res) {
    res.render('signup');
});


app.post('/addUser', async function (req, res) {
    let btnUser = req.body.btnUser;
    let username = req.body.usernameSU;
    let password = req.body.passwordSU;
    let repassword = req.body.repasswordSU;
    let name = req.body.nameSU;
    let phone = req.body.phoneSU;
    let address = req.body.addressSU;
    let add = db.model(collectionUsers, Users, 'Users');

    if (repassword != password) {
        res.render('signup', {statusUS: 'Mật khẩu chưa trùng'});
    } else if (username && password && name && phone && address && btnUser == 1) {
        let users = await add.find({
            username: username,
            password: password,
            name: name,
            phone: phone,
            address: address,
        }).lean();   //dk
        console.log("A", "kiem tra");
        if (users.length <= 0) {
            let result = add({
                username: username,
                password: password,
                name: name,
                phone: phone,
                address: address,
            }).save(function (err) {
                if (err == null) {
                    console.log("A", "Thêm thành công");
                    res.render('signup', {statusUS: 'Thêm thành công'});
                } else res.render('signup', {statusUS: err.message});
            });
        } else {
            res.render('signup', {statusUS: 'Tài khoản đã tồn tại'});
        }
    } else {
        res.render('signup');
    }
});


app.post('/login', async function (req, res) {
    let usernameLG = req.body.username;
    let passwordLG = req.body.password;
    let btnLG = req.body.btnLG;
    let list = db.model(collectionUsers, Users, 'Users');
    if (usernameLG && passwordLG && btnLG == 1) {
        let users = await list.find({
            username: usernameLG,
            password: passwordLG
        }).lean();   //dk
        if (users.length > 0) {
            res.render('home');
        } else {
            res.render('index', {statusLG: 'Tài khoản chưa tồn tại'});
        }
    } else {
        res.render('index', {statusLG: 'Sai tên đăng nhập hoặc mật khẩu'});
    }
});

app.get('/updateAD', async function (req, res) {
    let id = req.query.idAd;
    let phone = req.query.phoneAd;
    let list = db.model(collectionUsers, Users, 'Users');
    let result = await list.findById(id);
    console.log(id);
    res.render('updateAD', {
        id: result._id,
        username: result.username,
        password: result.password,
        name: result.name,
        phone: phone,
        address: result.address
    });
    console.log(phone);
});

app.post('/updateAD', async function (req, res) {
    let id = req.body.idAd;
    let username = req.body.userAd;
    let password = req.body.passAd;
    let name = req.body.nameAd;
    let phone = req.body.phoneAd;
    let address = req.body.addressAd;
    let repass = req.body.repasswordADDT;

    let update = db.model(collectionUsers, Users, 'Users');
    if (repass != password) {
        res.render('updateAD', {status: 'Mật khẩu chưa trùng'});
    } else {
        let kq = await update.updateOne({_id: id}, {
            username: username,
            password: password,
            name: name,
            address: address,
            phone: phone
        }, function (err) {
            if (err == null)
                res.render('updateAD', {status: 'Sửa thành công'});
            else res.render('updateAD', {status: err.message});
        });
    }

});

app.get('/deleteAD', (req, res) => {
    let id = req.query.idAd;
    let deletee = db.model(collectionUsers, Users, 'Users');
    let kq = deletee.deleteOne({_id: id}, function (err) {
        if (err == null)
            res.render('adminList', {status: 'Xóa thành công'});
        else res.render('adminList', {status: err.message});
    });
});


app.get('/adminList', function (req, res) {
    let list = db.model(collectionUsers, Users, 'Users');
    let result = list.find({}, function (err, data) {
        if (err == null)
            res.render('adminList', {data: data});
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
});


let collectionClient = "Buyers";

let Buyers = new Schema({
    username: String,
    password: String,
    name: String,
    phone: String,
    email: String,
    age: String,
    address: String,
});

app.get('/buyersList', function (req, res) {
    let list = db.model(collectionClient, Buyers, 'Buyers');
    let result = list.find({}, function (err, data) {
        if (err == null)
            res.render('buyersList', {data: data});
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
})

app.get('/buyersListJSON', function (req, res) {
    let list = db.model(collectionClient, Buyers, 'Buyers');
    let result = list.find({}, function (err, data) {
        if (err == null)
            // res.render('buyersList', {data: data});
        res.send(JSON.stringify(data));
        else res.send('Lay danh sach that bai : ' + err.message);
    }).lean();
})

app.get('/addBuyers', function (req, res) {
        res.render('addBuyers');
})

app.post('/addBuyers', async function (req, res) {
    let btnBuyers = req.body.btnBuyers;
    let username = req.body.usernameB;
    let password = req.body.passwordB;
    let repassword = req.body.repasswordB;
    let name = req.body.nameB;
    let phone = req.body.phoneB;
    let address = req.body.addressB;
    let email = req.body.emailB;
    let age = req.body.ageB;
    let add = db.model(collectionClient, Buyers, 'Buyers');

    if (repassword != password) {
        res.render('addBuyers', {status: 'Mật khẩu chưa trùng'});
    } else if (username && password && name && phone && address && email && age && btnBuyers == 1) {
        let buyers = await add.find({
            username: username,
            password: password,
            name: name,
            phone: phone,
            address: address,
            email: email,
            age: age
        }).lean();   //dk
        console.log("A", "kiem tra");
        if (buyers.length <= 0) {
            let result = add({
                username: username,
                password: password,
                name: name,
                phone: phone,
                address: address,
                email: email,
                age: age
            }).save(function (err) {
                if (err == null) {
                    console.log("A", "Thêm thành công");
                    res.render('addBuyers', {status: 'Thêm thành công'});
                } else res.render('addBuyers', {status: err.message});
            });
        } else {
            res.render('addBuyers', {status: 'Tài khoản đã tồn tại'});
        }
    } else {
        res.render('addBuyers');
    }
})

app.get('/updateBuyers', async function (req, res) {
    let id = req.query.idB;
    let phone = req.query.phoneB;
    let list = db.model(collectionClient, Buyers, 'Buyers');
    let result = await list.findById(id);
    console.log(id);
    res.render('updateBuyers', {
        id: result._id,
        username: result.username,
        password: result.password,
        name: result.name,
        phone: phone,
        address: result.address,
        age: result.age,
        email: result.email
    });
});

app.post('/updateBuyers', async function (req, res) {
    let id = req.body.idUDB;
    let username = req.body.usernameUDB;
    let password = req.body.passwordUDB;
    let name = req.body.nameUDB;
    let phone = req.body.phoneUDB;
    let address = req.body.addressUDB;
    let repass = req.body.repasswordUDB;
    let email = req.body.emailUDB;
    let age = req.body.ageUDB;
    let update = db.model(collectionClient, Buyers, 'Buyers');
    if (repass != password) {
        res.render('updateBuyers', {status: 'Mật khẩu chưa trùng'});
    } else {
        let kq = await update.updateOne({_id: id}, {
            username: username,
            password: password,
            name: name,
            phone: phone,
            address: address,
            age: age,
            email: email
        }, function (err) {
            if (err == null)
                res.render('updateBuyers', {status: 'Sửa thành công'});
            else res.render('updateBuyers', {status: err.message});
        });
    }

});

app.get('/deleteBuyers', function (req, res) {
    let id = req.query.idB;
    let deletee = db.model(collectionClient, Buyers, 'Buyers');
    let kq = deletee.deleteOne({_id: id}, function (err) {
        if (err == null)
            res.render('buyersList', {status: 'Xóa thành công'});
        else res.render('buyersList', {status: err.message});
    });
});

app.get('/', function (req, res) {
    res.render('index');
}).listen(9696);