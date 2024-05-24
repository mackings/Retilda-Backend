const express = require('express');
const Product = require('../../models/Productmodel'); 
const { successResponse, errorResponse } = require('../components');



exports.products = async (req, res) => {
    try {
        const products = await Product.find({}, 'name  price description specification brand images categories')
                                       .sort({ createdAt: -1 }) 
                                       .populate('categories'); 
    
        if (!products || products.length === 0) {
            return res.status(404).json(errorResponse('No products found', 404));
        }
    
        res.status(200).json(successResponse('Products retrieved successfully', products));
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
    
};


exports.searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) {
            return res.status(400).json({ message: 'Query parameter q is required' });
        }

        const regex = new RegExp(searchTerm, 'i'); 

        const products = await Product.find({
            $or: [
                { name: regex },
                { description: regex },
                { brand: regex },
                { categories: regex }
            ]
        }, 'name price description specification brand images categories')
        .populate('categories');

        if (!products || products.length === 0) {
            return res.status(404).json(errorResponse('No products found', 404));
        }

        res.status(200).json(successResponse('Products retrieved successfully', products));
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
};



exports.getAllProductCategories = async (req, res) => {

  try {
      const products = await Product.find({}, 'categories');

      const categories = [...new Set(products.flatMap(product => product.categories))];
      if (!categories || categories.length === 0) {
          return res.status(404).json(errorResponse('No categories found', 404));
      }

      res.status(200).json(successResponse('Categories retrieved successfully', categories));
  } catch (error) {
      console.error('Error retrieving product categories:', error);
      res.status(500).json(errorResponse('Internal server error', 500));
  }
};




exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.categoryName;

        const products = await Product.find({ categories: categoryName }, 'name price description images categories brand');

        if (!products || products.length === 0) {
            return res.status(404).json(errorResponse('No products found in the specified category', 404));
        }

        res.status(200).json(successResponse('Products retrieved successfully',  products ));
    } catch (error) {
        console.error('Error retrieving products by category:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
};



exports.priceFilter = async (req, res) => {

    try {
      const type = req.query.type;
  
      if (!['lowest', 'highest'].includes(type)) {
        return res.status(400).json(errorResponse('Invalid type parameter. Use either "lowest" or "highest".', 400));
      }
  
      const sortDirection = type === 'lowest' ? 1 : -1;
      const products = await Product.find({}, { 
        name: 1,
        price: 1,
        description: 1,
        images: 1,
        categories: 1,
      }).sort({ price: sortDirection });
  
      const message = `Products retrieved successfully (sorted by ${type} price)`;
      console.log(message);
      res.status(200).json(successResponse(message, products));
    } catch (error) {
      console.error('Error retrieving products by price filter:', error);
      res.status(500).json(errorResponse('Internal server error', 500));
    }

  };
  

