import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin () {
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ivan', password: '123' })
    })
    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    console.log(`searchTitle changed to "${value}"`)
    store.setSearchTitle(value)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    console.log(`filterStatus changed to "${value}"`)
    store.setFilterStatus(value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    console.log('search')
    const token = localStorage.getItem('accessToken')
    const searchTitle = localStorage.getItem('searchTitle') || ''
    const filterStatus = localStorage.getItem('filterStatus') || ''
    const params = new URLSearchParams()

    if (searchTitle) params.append('title', searchTitle)
    if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)
    
    const url = `http://localhost:5000/tasks${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    store.setTasks(JSON.stringify(data.items))
    
    navigator.sendBeacon('http://localhost:5000/analytics', JSON.stringify({
        action: 'search',
        searchTitle: searchTitle,
        filterStatus: filterStatus || 'all'
    }))
}

// Задача #5
async function handleLogout () {
    console.log('logout')
    const token = localStorage.getItem('accessToken')
    await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    localStorage.removeItem('accessToken')
    store.reset()
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
