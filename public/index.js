import * as store from './storage.js'
import * as view from './view.js'

// Задача #1
async function handleLogin() {
    const credentials = {username: 'denis', password: '12345678!'}
    const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`Ошибка авторизации: ${response.status}`)
    }

    const data = await response.json()

    if (!data.accessToken) {
        throw new Error('Токен не получен')
    }

    localStorage.setItem('accessToken', data.accessToken)
}

// Задача #2
function handleInputChange({target: {value}}) {
    store.setSearchTitle(value)
}

// Задача #2
function handleSelectChange({target: {value}}) {
    store.setFilterStatus(value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    const token = localStorage.getItem('accessToken')
    if (!store.isAuthorized()) {
        throw new Error("Неверный токен")
    }

    const params = new URLSearchParams()
    const searchTitle = localStorage.getItem('searchTitle')
    const filterStatus = localStorage.getItem('filterStatus')

    if (searchTitle) {
        params.append('title', searchTitle)
    }

    if (filterStatus) {
        params.append('status', filterStatus)
    }

    const query = params.toString()
    const queryString = query ? `?${query}` : ''

    const response = await fetch(`/tasks${queryString}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
    }

    const data = await response.json()
    store.setTasks(JSON.stringify(data.items))

    const analyticsBody = new Blob(
        [
            JSON.stringify({
                action: 'search',
                searchTitle,
                filterStatus
            })
        ],
        {type: 'application/json'}
    )
    const responseAnalytics = navigator.sendBeacon('/analytics', analyticsBody)

    if (!responseAnalytics) {
        throw new Error('Не удалось отправить аналитику')
    }
}

// Задача #5
async function handleLogout() {
    const token = localStorage.getItem('accessToken')

    if (!store.isAuthorized()) {
        throw new Error('Вы не авторизованы')
    }

    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`Ошибка выхода: ${response.status}`)
    }

    localStorage.removeItem('accessToken')
}

// Код ниже редактировать не нужно
async function handleSearch() {
    await handleSearchTasks()
    view.updateAppContent()
}

async function handleAuthorization() {
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
