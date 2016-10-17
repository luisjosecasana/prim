var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require("cloudinary");
var method_override = require("method-override");
var app_password = "12345";
var Schema = mongoose.Schema;

cloudinary.config({
	cloud_name: "luiscasana",
	api_key: "488895136248926",
	api_secret: "5vPEqUQICuW4B8AIL053i1qSErg",
});

var app = express();

mongoose.connect("mongodb://localhost/mipagina")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: "./uploads"}));
app.use(method_override("_method"));

var productSchemaJSON = {
	title:String,
	description:String,
	imageUrl:String,
	pricing:Number,
};

var productSchema = new Schema(productSchemaJSON);

productSchema.virtual("image.url").get(function(){
	if(this.imageUrl === "" || this.imageUrl === "public/data.png"){
		return "public/default.jpg";
	}

	return this.imageUrl;
});

var Product = mongoose.model("Product", productSchema);
app.set("view engine","jade")
app.use(express.static("public"));
app.get("/",function(req,res){
	res.render("index");
});

app.get("/productos",function(req,res){
	Product.find(function(error,documento){
		if(error){ console.log(error); }
		res.render("productos/index",{ products: documento })
	});
});
app.put("/productos/:id",function(req,res){
	if(req.body.password == app_password){
		var data = {
			title:req.body.title,
			brand:req.body.brand,
			model:req.body.model,
			serial:req.body.serial,
			description:req.body.description,
		};

		if(req.files.hasOwnProperty("image_avatar")){
			cloudinary.uploader.upload(req.files.image_avatar.path, 
				function(result) { 
					data.imageUrl = result.url;
	  	
	  				Product.update({"_id": req.params.id},data,function(){
						res.redirect("/productos");
					});	
				}
			);
		}else{
			Product.update({"_id": req.params.id},data,function(){
				res.redirect("/productos");
			});
		}
	}else{
		res.redirect("/");
	}
});
app.get("/productos/edit/:id",function(req,res){
	var id_producto = req.params.id;
	console.log(id_producto);
	Product.findOne({"_id": id_producto},function(error,producto){
		console.log(producto);
		res.render("productos/edit",{ product: producto});
	});
});
app.post("/admin",function(req,res){
if(req.body.password == app_password){
		Product.find(function(error,documento){
		if(error){ console.log(error); }
		res.render("admin/index",{ products: documento })
	});
}else{
	res.redirect("/")
}
});
app.get("/admin",function(req,res){
	res.render("admin/form")
});
app.post("/productos",function(req,res){
	if(req.body.password == app_password){
		var data = {
			title:req.body.title,
			brand:req.body.brand,
			model:req.body.model,
			serial:req.body.serial,
			description:req.body.description,
		}
		var product = new Product(data);
		
		if(req.files.hasOwnProperty("image_avatar")){
			cloudinary.uploader.upload(req.files.image_avatar.path, 
				function(result) { 
					product.imageUrl = result.url;
	  	
	  				product.save(function(error){
						console.log(product);
						res.redirect("/productos");
					});	
				}
			);	
		}else{
			product.save(function(error){
				console.log(product);
				res.redirect("/productos");
			});	
		}
	}else{
		res.render("productos/new");
		}
});
		
app.get("/productos/new",function(req,res){
	res.render("productos/new")
});

app.get("/productos/delete/:id",function(req,res){
	var id = req.params.id;

	Product.findOne({"_id": id },function(error,producto){
		res.render("productos/delete",{producto: producto});
	});
});
app.delete("/productos/:id",function(req,res){
	var id= req.params.id;
	if(req.body.password == app_password){
		Product.remove({"_id": id },function(error){
			if(error){console.log(error); }
			res.redirect("/productos");
		});
	}else{
		res.redirect("/productos");
	}
});
app.listen(8181);