# Добавить отправку аналитики по клику на поиск

## Описание
1. По клику на кнопку "Искать" добавить запрос на отправку аналитики `POST /analytics`
2. В теле запроса передать название действия `action`, `searchTitle` и `filterStatus` в формате JSON
3. Используй sendBeacon, так как это гарантирует отправку запроса при закрытии страницы

### Запрос
> POST http://localhost:5000/analytics HTTP/1.1
> 
> `{ "action": "search", "searchTitle": "some", "filterStatus": "completed"}`

### Ответ
> `HTTP/1.1 200 OK`

