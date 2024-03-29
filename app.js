const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'todoApplication.db')

let database = null

const initializaDBAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`error ${e.massege}`)
    process.exit(1)
  }
}
initializaDBAndServer()
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//api 1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

//api 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const gettodosQuery = `
  SELECT *
  FROM todo
  WHERE id=${todoId};
  `
  const data = await database.get(gettodosQuery)
  response.send(data)
})

// api 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const posttodoQuery = `
  INSERT INTO
  todo (todo, priority, status)
  VALUES
  (
    '${todo}',
    '${priority}',
    '${status}'
  );
  `
  await database.run(posttodoQuery)
  response.send('Todo Successfully Added')
})
//api 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updatecolumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updatecolumn = 'Status'
      break
    case requestBody.priority != undefined:
      updatecolumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updatecolumn = 'Todo'
      break
  }
  const previousTodoQuery = `
  SELECT *
  FROM todo
  WHERE
  id=${todoId};
  `
  const previousTodo = await database.get(previousTodoQuery)

  const {todo, status, priority} = request.body

  switch (true) {
    case todo !== undefined:
      status = previousTodo.status
      priority = previousTodo.priority
      break
    case status !== undefined:
      todo = previousTodo.todo
      priority = previousTodo.priority
      break
    case priority !== undefined:
      todo = previousTodo.todo
      status = previousTodo.status
      break
  }

  const updatetodoQuery = `
    UPDATE
    todo
    SET
    todo='${todo}',
    priority='${priority}',
    status='${status}'
    WHERE 
    id=${todoId};
    `
  await database.run(updatetodoQuery)
  response.send(updatecolumn + ' Updated')
})

//api 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletetodoQuery = `
  DELETE FROM
  todo
  WHERE id = ${todoId};
  `
  await database.run(deletetodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
