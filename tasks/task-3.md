# Добавить запрос на получение списка задач

## Описание
1. Добавить запрос на получение списка задач с использованием сохраненных параметров поиска (используя `fetch`)
2. Из ответа нужно взять только список задач и сохранить в localStorage используя ключ `tasks`
3. API доступно только с `accessToken` (см. как добавить `Authorization` заголовок)

## Если все правильно сделано
1. При клике на кнопку "Искать" – отрисуется список задач
2. При обновлении страницы - отрисуется тот же список задач

### Запрос
> GET http://localhost:5000/tasks HTTP/1.1
>
> Authorization: Bearer {{accessToken}}

> GET http://localhost:5000/tasks?title=some HTTP/1.1
>
> Authorization: Bearer {{accessToken}}

> GET http://localhost:5000/tasks?status=uncompleted HTTP/1.1
>
> Authorization: Bearer {{accessToken}}

> GET http://localhost:5000/tasks?title=some&status=completed HTTP/1.1
> 
> Authorization: Bearer {{accessToken}}

#### Query Параметры:
> `status`?: "completed" | "uncompleted"
>
> `title`?: string

### Ответ
>`HTTP/1.1 200 OK`
> 
> `{"items":[{"id":1,"title":"Do something nice","completed":false,"userId":152}],"total":1}`
