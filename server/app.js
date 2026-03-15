const express = require('express')
const path = require('path')
const tasks = require('./tasks.json');


const app = express()
const port = 5000
const ROOT_DIR = path.dirname(__dirname)
let ACCESS_TOKEN = null

app.use(express.json())
app.use('/static', express.static(path.join(ROOT_DIR, 'public')))

app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.sendFile(path.join(ROOT_DIR, 'public/index.html'))
})

app.get('/tasks', (req, res) => {
    if (req.headers?.authorization?.toUpperCase() !== `BEARER ${ACCESS_TOKEN}`) {
        res.sendStatus(401)
        return
    }
    const { status = 'all', title = '' } = req.query
    let items = tasks.items;
    if (status.toLowerCase() === 'completed') {
        items = items.filter(item => item.completed)
    }
    if (status.toLowerCase() === 'uncompleted') {
        items = items.filter(item => !item.completed)
    }
    if (title) {
        items = items.filter(item => item.title.toLowerCase().includes(title.toLowerCase()))
    }
    res.send({ items, total: items.length, query: req.query })
})

app.post('/login', (req, res) => {
    const credentials = Object.entries(req.body).map(item => [item[0].toLowerCase(), item[1]])
    const username = credentials.find(item => item[0] === 'username')
    const password = credentials.find(item => item[0] === 'password')
    if (!username || !password) {
        res.sendStatus(400)
        res.send('Данные должны быть в формате JSON! username и password – обязательные поля')
        return
    }
    ACCESS_TOKEN = 1234567890
    res.json({ accessToken: ACCESS_TOKEN })
})

app.post('/logout', (req, res) => {
    if (req.headers.authorization?.toUpperCase() !== `BEARER ${ACCESS_TOKEN}`) {
        res.sendStatus(401)
        res.send('Вы не авторизованы')
        return
    }
    ACCESS_TOKEN = null
    res.sendStatus(200)
})

app.post('/analytics', (req, res) => {
    res.sendStatus(200)
    res.send('OK')
})

app.delete('/clear', (req, res) => {
    if (req.headers.authorization?.toUpperCase() !== `BEARER ${ACCESS_TOKEN}`) {
        res.sendStatus(401)
        res.send('Вы не авторизованы')
        return
    }
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

