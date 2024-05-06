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
            if (err instanceof multer.MulterError) {
                console.log(err);
                return res.status(400).json(errorResponse('File upload error'));
            } else if (err) {
                return res.status(500).json(errorResponse('Internal server error'));
            }
            
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json(errorResponse('At least one product image is required'));
            }

            const { name, price, description, paymentPlan } = req.body;

            const images = [];
            for (let i = 1; i <= 3; i++) {
                if (req.files[`image${i}`]) {
                    const result = await cloudinary.uploader.upload(req.files[`image${i}`][0].path, {
                        folder: 'product-images',
                        allowed_formats: ['jpg', 'jpeg', 'png']
                    });
                    images.push(result.secure_url);
                }
            }

            const newProduct = new Product({
                name,
                price,
                description,
                paymentPlan,
                images
            });

            await newProduct.save();

            const uploadedProduct = await Product.findById(newProduct._id);

            res.status(201).json(successResponse('Product uploaded successfully', uploadedProduct));
        });
    } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};
