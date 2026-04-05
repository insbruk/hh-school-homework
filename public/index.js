import * as store from './storage.js'
import * as view from './view.js';

function getAccessToken() {
    return localStorage.getItem('accessToken') || ''
}

function getSearchParams() {
    return {
        searchTitle: localStorage.getItem('searchTitle') || '',
        filterStatus: localStorage.getItem('filterStatus') || '',
    }
}

function getAuthorizedHeaders(extraHeaders = {}) {
    return {
        ...extraHeaders,
        Authorization: `Bearer ${getAccessToken()}`,
    }
}

async function parseResponse(response) {
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return response.json()
    }

    return null
}

// Задача #1
async function handleLogin () {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'ivan',
            password: '123',
        }),
    })

    const data = await parseResponse(response)
    localStorage.setItem('accessToken', String(data.accessToken))
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    store.setSearchTitle(value)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    store.setFilterStatus(value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    if (!store.isAuthorized()) {
        store.setTasks(JSON.stringify([]))
        return
    }

    const { searchTitle, filterStatus } = getSearchParams()
    const searchParams = new URLSearchParams()

    if (searchTitle) {
        searchParams.set('title', searchTitle)
    }

    if (filterStatus) {
        searchParams.set('status', filterStatus)
    }

    navigator.sendBeacon(
        '/analytics',
        JSON.stringify({
            action: 'search',
            searchTitle,
            filterStatus,
        }),
    )

    const query = searchParams.toString()
    const response = await fetch(`/tasks${query ? `?${query}` : ''}`, {
        headers: getAuthorizedHeaders(),
    })

    const data = await parseResponse(response)
    store.setTasks(JSON.stringify(data.items))
}

// Задача #5
async function handleLogout () {
    const response = await fetch('/logout', {
        method: 'POST',
        headers: getAuthorizedHeaders(),
    })

    await parseResponse(response)
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
