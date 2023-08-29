const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (authenticatedUser(username, password)) {
        const token = jwt.sign(
            {
                data: password,
            },
            "fingerprint_customer",
            {
                expiresIn: 60 * 60,
            });

        req.session.token = token;

        return res.json({ token: token });
    } else {
        return res.status(403).send("Invalid username or password");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!books[isbn]) {
        return res.status(404).send("Book not found");
    }

    const user = jwt.verify(req.session.token, "fingerprint_customer").name;
    books[isbn].reviews[user] = review;

    return res.status(200).send("Review added/updated successfully");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const user = jwt.verify(req.session.token, "fingerprint_customer").name;

    if (!books[isbn] || !books[isbn].reviews[user]) {
        return res.status(404).send("Review not found");
    }

    delete books[isbn].reviews[user];
    return res.status(200).send("Review deleted successfully");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
