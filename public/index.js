import * as store from './storage.js'
import * as view from './view.js'


// Задача #1
async function handleLogin() {
    console.log('click login')

    const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify(
            {"username": "keril", "password": "s3cur3_password"}
        ),
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (response.status === 200) {
        console.log("Login success!")
        const responseJson = await response.json()

        localStorage.setItem("accessToken", responseJson["accessToken"])
    } else {
        console.error("Login fail:", response.status)
    }
}

// Задача #2
async function handleInputChange({target: {value}}) {
    console.log(`new searchTitle: "${value}"`)
    localStorage.setItem("searchTitle", value)
}

// Задача #2
async function handleSelectChange({target: {value}}) {
    console.log(`new filterStatus: "${value}"`)
    localStorage.setItem("filterStatus", value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    console.log('click search')

    const accessToken = localStorage.getItem("accessToken")
    const title = localStorage.getItem("searchTitle")
    const status = localStorage.getItem("filterStatus")

    const params = new URLSearchParams()
    if (title) {
        params.append("title", title)
    }
    if (status) {
        params.append("status", status)
    }

    const response = await fetch(`/tasks?${params}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
    })


    if (response.status === 200) {
        const tasks = (await response.json()).items
        console.log("Tasks fetched:", tasks)

        localStorage.setItem("tasks", JSON.stringify(tasks))
    } else {
        console.log("Tasks fetch failed:", response.status)
    }

    const analyticsData =
        {
            "action": "search",
            "searchTitle": title,
            "filterStatus": status
        }
    navigator.sendBeacon("/analytics", JSON.stringify(analyticsData))
}

// Задача #5
async function handleLogout() {
    console.log('logout')
    const accessToken = localStorage.getItem("accessToken")

    const response = await fetch(`/logout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
    })

    if (response.status === 200) {
        console.log("Logout success!")
        localStorage.removeItem("accessToken")
        // localStorage.clear() // - optional
    }
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
        console.error(e)
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
