import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin () {
    const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'ivan',
            password: '123',
        }),
    })

    if (!response.ok) {
        throw new Error('Login failed')
    }

    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    localStorage.setItem('searchTitle', value)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    localStorage.setItem('filterStatus', value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    const accessToken = localStorage.getItem('accessToken')
    const searchTitle = localStorage.getItem('searchTitle') || ''
    const filterStatus = localStorage.getItem('filterStatus') || ''

    if (!accessToken) {
        localStorage.setItem('tasks', JSON.stringify([]))
        return
    }

    const params = new URLSearchParams()

    if (searchTitle) {
        params.append('title', searchTitle)
    }

    if (filterStatus) {
        params.append('status', filterStatus)
    }

    const url = params.toString()
        ? `http://localhost:5001/tasks?${params.toString()}`
        : 'http://localhost:5001/tasks'

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new Error('failed to fetch tasks')
        }

        const { items } = await response.json()
        localStorage.setItem('tasks', JSON.stringify(items))

        const analyticsData = JSON.stringify({
            action: 'search',
            searchTitle,
            filterStatus,
        })

        navigator.sendBeacon(
            'http://localhost:5001/analytics',
            new Blob([analyticsData], { type: 'application/json' }),
        )
    } catch (error) {
        alert('try again')
    }
}

// Задача #5
async function handleLogout () {
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
        return
    }

    const response = await fetch('http://localhost:5001/logout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        throw new Error('Logout failed')
    }

    localStorage.removeItem('accessToken')
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
