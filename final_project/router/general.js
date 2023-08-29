const express = require('express');
let books = require("./booksdb.js");
const { JsonWebTokenError } = require('jsonwebtoken');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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


function getAllBooks() {
    return new Promise((resolve) => {
      resolve(books);
    });
  }
  
  public_users.get('/', async (req, res) => {
    try {
      const allBooks = await getAllBooks();
      return res.status(200).send(JSON.stringify(allBooks));
    } catch (error) {
      return res.status(500).json({message: error.message});
    }
  });
  

// Get book details based on ISBN
function getIsbn(isbn) {
  const book_ = books[isbn];
  return new Promise((resolve, reject) => {
    if (book_) {
      resolve(book_);
    } else {
      reject(new Error("Unable to find book!"));
    }
  });
}

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const bookByIsbn = await getIsbn(req.params.isbn);
    return res.status(200).send(JSON.stringify(bookByIsbn));
  } catch (error) {
    return res.status(404).json({message: error.message});
  }
});


// Get book details based on author
function getByAuthor(author) {
    const booksByAuthor = Object.values(books).filter(b => b.author === author);
    return new Promise((resolve, reject) => {
      if (booksByAuthor.length) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("Unable to find books by this author!"));
      }
    });
  }
  
  public_users.get('/author/:author', async (req, res) => {
    try {
      const books = await getByAuthor(req.params.author);
      return res.status(200).send(JSON.stringify(books));
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
  });
  

// Get all books based on title
function getByTitle(title) {
    const booksByTitle = Object.values(books).filter(b => b.title === title);
    return new Promise((resolve, reject) => {
      if (booksByTitle.length) {
        resolve(booksByTitle);
      } else {
        reject(new Error("Unable to find books with this title!"));
      }
    });
  }
  
  public_users.get('/title/:title', async (req, res) => {
    try {
      const books = await getByTitle(req.params.title);
      return res.status(200).send(JSON.stringify(books));
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
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
