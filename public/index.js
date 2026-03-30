import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin() {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'Kirill', password: '12345' }),
        })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem("accessToken", data.accessToken)
        } else {
            throw new Error('Ошибка при входе')
        }
    } catch (error) {
        alert('Не удалось войти. Попробуйте еще раз!')
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

function sendAnalyticsData(searchTitle, filterStatus) {
    const image = new Image()
    const params = new URLSearchParams();
    if (filterStatus) params.set("filterStatus", filterStatus);
    if (searchTitle) params.set("searchTitle", searchTitle);
    console.log(params.toString())
    image.src = `/analytics?${params.toString()}`
}

// Задача #3 и #4
async function handleSearchTasks() {

    if (!store.isAuthorized()) {
        return
    }
    const getTasks = new XMLHttpRequest()
    try {
        const searchTitle = localStorage.getItem("searchTitle")
        const filterStatus = localStorage.getItem("filterStatus")
        const token = localStorage.getItem("accessToken")
        const params = new URLSearchParams();
        if (searchTitle) params.set("searchTitle", searchTitle);
        if (filterStatus) params.set("filterStatus", filterStatus);
        if (searchTitle || filterStatus) {
            getTasks.open("GET", `/tasks?${params.toString()}`)
        } else {
            getTasks.open("GET", '/tasks')
        }
        sendAnalyticsData(searchTitle, filterStatus)
        getTasks.setRequestHeader("Content-Type", "application/json")
        getTasks.setRequestHeader("Authorization", `BEARER ${token}`)
        getTasks.onload = function () {
            if (getTasks.status === 200) {
                const data = JSON.parse(getTasks.response).items
                store.setTasks(JSON.stringify(data))
            } else {
                throw new Error('Ошибка загрузке задач')
            }
        }
        getTasks.send()
    } catch (error) {
        alert('Ошибка при загрузке задач')
    }

}

// Задача #5
async function handleLogout() {
    const token = localStorage.getItem("accessToken")
    await fetch('/logout', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `BEARER ${token}`
        },
    }).then(response => {
        if (response.status === 200) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("filterStatus")
            localStorage.removeItem("searchTitle")
            localStorage.removeItem("tasks")
            alert("Logout successful")
        } else {
            throw new Error('Ошибка при выходе')
        }
    }).catch(error => {
        alert('Ошибка при выходе')
    })
    console.log("logout")
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
        console.log(e)
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
