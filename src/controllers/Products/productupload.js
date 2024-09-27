const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const Product = require("../../models/Productmodel");
const { errorResponse , successResponse} = require("../components");


cloudinary.config({
    cloud_name: 'dv0anyldo',
    api_key: '838368846159638',
    api_secret: 'urtOYeOUK69LiUqumdH8YVHysf0'
});

const storage = multer.diskStorage({});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // 10 MB limit
}).fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]);



exports.uploadProduct = async (req, res) => {
    
    try {
        upload(req, res, async function (err) {
            try {
                if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.status(400).json(errorResponse('File upload error'));
                } else if (err) {
                    return res.status(500).json(errorResponse('Internal server error'));
                }
                
                if (!req.files || Object.keys(req.files).length === 0) {
                    return res.status(400).json(errorResponse('At least one product image is required'));
                }

                const { name, price, description, specification, brand,availableStock, categories } = req.body;

                const images = [];
                for (let i = 1; i <= 3; i++) {
                    if (req.files[`image${i}`]) {
                        const file = req.files[`image${i}`][0];
                        const allowedFormats = ['jpg', 'jpeg', 'png'];
                        const fileFormat = file.originalname.split('.').pop().toLowerCase();
                        if (!allowedFormats.includes(fileFormat)) {
                            return res.status(400).json(errorResponse(`Image file format ${fileFormat} not allowed`));
                        }
                        
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: 'product-images',
                            allowed_formats: allowedFormats
                        });
                        images.push(result.secure_url);
                    }
                }

                const newProduct = new Product({
                    name,
                    price,
                    description,
                    specification,
                    brand,
                    images,
                    availableStock,
                    categories
                });

                await newProduct.save();

                const uploadedProduct = await Product.findById(newProduct._id);

                res.status(201).json(successResponse('Product uploaded successfully', uploadedProduct));
            } catch (error) {
                console.error('Error uploading product:', error);
                res.status(500).json(errorResponse('Internal Server Error'));
            }
        });
    } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};


