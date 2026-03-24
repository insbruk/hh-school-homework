import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin(username='vanya', password='123') {
    if (!username || !password)
        throw new Error("Отсутствуют данные")

    await fetch('login', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username, password: password}),
    })
        .then(res => {
            res.json().then(body => {
                    localStorage.setItem('accessToken', body.accessToken);
                })
        })
        .catch(err => console.log(err))
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    console.log(`searchTitle changed to "${value}"`)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    console.log(`filterStatus changed to "${value}"`)
}

// Задача #3 и #4
async function handleSearchTasks() {
    console.log('search')
}

// Задача #5
async function handleLogout () {
    console.log('logout')
}

// Код ниже редактировать не нужно
async function handleSearch() {
    await handleSearchTasks()
    view.updateAppContent()
}

async function handleAuthorization () {
    try {
        if (store.isAuthorized()) {
            await handleLogout()
            store.reset()
        } else {
            await handleLogin()
            store.setSearchTitle('')
            store.setFilterStatus('')
            view.updateSearchInput('')
            view.updateFilterStatus('')
            await handleSearchTasks()
        }
        view.updateAppContent()
    } catch (e) {
        alert('Не удалось. Попробуйте еще раз!')
    }
}

handleSearchTasks().then(() => {
    view.updateAppContent()
    view.updateSearchInput(localStorage.getItem('searchTitle') || '')
    view.updateFilterStatus(localStorage.getItem('filterStatus') || '')
})

const searchInputElement = document.getElementById('searchInput')
const filterSelectElement = document.getElementById('filterStatus')
const authButtonElement = document.getElementById('authButton')
const searchButtonElement = document.getElementById('searchButton')

searchInputElement.addEventListener('keyup', handleInputChange)
filterSelectElement.addEventListener('change', handleSelectChange)
authButtonElement.addEventListener('click', handleAuthorization)
searchButtonElement.addEventListener('click', handleSearch)
