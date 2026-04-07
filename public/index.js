import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin () {
    try {
        const respone = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'ivan',
                password: '123'
            })
        })

        if (!respone.ok) throw new Error('Login failed!')

        const data = await respone.json()
        localStorage.setItem('accessToken', String(data.accessToken))
    } catch (e) {
        throw new Error(e.message)
    }
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
    const accessToken = localStorage.getItem('accessToken')
    const title = localStorage.getItem('searchTitle') || ''
    const status = localStorage.getItem('filterStatus') || ''

    if (!accessToken) {
        store.setTasks(JSON.stringify([]))
        return
    }

    const params = new URLSearchParams({
        title,
        status
    })

    try {
        const respone = await fetch(`/tasks?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        if (!respone.ok) throw new Error('Search failed!')

        const data = await respone.json()
        store.setTasks(JSON.stringify(data.items))

        await fetch('/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                status,
                total: data.total
            })
        })
    } catch (e) {
        throw new Error(e.message)
    }
    
}

// Задача #5
async function handleLogout () {
    const accessToken = localStorage.getItem('accessToken')

    const respone = await fetch('/logout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!respone.ok) throw new Error('Logout failed!')

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
