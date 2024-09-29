const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

// 用于解析 JSON 和 urlencoded 数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 设置静态文件目录
app.use(express.static('public'));

// MySQL 连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root', // 替换为你的 MySQL 用户名
    password: 'root', // 替换为你的 MySQL 密码
    database: 'bookmanager', // 数据库名
    port: 3306
};

// 创建 MySQL 连接池
const db = mysql.createPool(dbConfig);

// 尝试连接数据库并打印结果
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Successfully connected to the database.');
    // 释放连接
    connection.release();
});

// 定义图书模型
const Book = {
    async findAll() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM books', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    async create(data) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO books SET ?', data, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    async update(id, data) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE books SET ? WHERE id = ?', [data, id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    async destroy(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM books WHERE id = ?', id, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    async search(title) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM books WHERE title LIKE ?', [`%${title}%`], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }
};

// 路由
app.get('/books', async (req, res) => {
    const searchQuery = req.query.search;
    if (searchQuery) {
        try {
            const books = await Book.search(searchQuery);
            res.json(books);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        try {
            const books = await Book.findAll();
            res.json(books);
        } catch (error) {
            res.status(500).send(error);
        }
    }
});

app.post('/books', async (req, res) => {
    try {
        const result = await Book.create({
            title: req.body.title,
            note: req.body.note
        });
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.put('/books/:id', async (req, res) => {
    try {
        const result = await Book.update(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).send();
        }
        res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        const result = await Book.destroy(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).send();
        }
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});