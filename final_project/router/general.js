const express = require('express');
let books = require("./booksdb.js");
const { JsonWebTokenError } = require('jsonwebtoken');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if(!username || !password)
    {
        return res.status(400).json({message: 'Username and password are required'});
    }

    const exists = users.find(user => user.username === username);

    if(exists)
    {
        return res.status(400).json({message: 'Username already exists'});
    }

    users.push({username, password}); // In real life I woul'd hash the password before storing

  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];

  if(!book) 
  {
    return res.status(404).json({message: 'Book not found'});
  }

  return res.status(200).send(JSON.stringify(book));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const book = Object.values(books).filter(b => b.author === req.params.author);

  if(!book)
  {
    return res.status(404).json({message: 'Book not found'});
  }

  return res.status(200).send(JSON.stringify(book));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const book = Object.values(books).filter(b => b.title === req.params.title);

  if(!book)
  {
    return res.status(404).json({message: 'Book not found'})
  }

  return res.status(200).send(JSON.stringify(book));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];

  if(!book)
  {
    return res.status(404).json({message: 'Book not found'});
  }

  if(!book.reviews || book.reviews.length === 0)
  {
    return res.status(200).json({message: 'No reviews'});
  }
  
  return res.status(200).send(JSON.stringify(book.reviews));
});

module.exports.general = public_users;
