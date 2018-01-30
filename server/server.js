require('dotenv').config()
const express = require('express')
const massive = require('massive')
const bodyParser = require('body-parser')
const app = express()
const PORT = 3000

app.use(bodyParser.json())

massive(process.env.CONNECTION_STRING)
.then(db => app.set('db', db))
.catch(err => console.error(err))

app.get('/api/test', (req, res) => {
  res.status(200).json('Hello')
  // works
})

setTimeout(() => {
  const db = app.get('db')
  db.dropVehicles()
  .then(response => console.log('Vehicles table dropped'))
  .catch(err => console.error('Drop error', err))
  .then(() => {
    db.dropUsers()
    .then(response => console.log('Users table dropped'))
    .catch(err => console.error('Drop error', err))
  })
  setTimeout(() => {
    db.createUsersTable()
    .then(response => console.log('Users table created', response))
    .catch(err => console.error('Users table init error', err))
    .then(() => {
      db.createVehiclesTable()
      .then(response => console.log('Vehicles table created', response))
      .catch(err => console.error('Vehicles table init error', err))
    })
  },500)
},1500)

app.get('/api/users', (req, res) => {
  app.get('db').getAllUsers()
  .then(users => res.status(200).json(users))
  .catch(err => console.error(err))
})
app.get('/api/vehicles', (req, res) => {
  app.get('db').getAllVehicles()
  .then(vehicles => res.status.json(vehicles))
  .catch(err => console.error(err))
})
app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  app.get('db').createUser([ name, email ])
  .then(newUser => {
    console.log(newUser[0])
    res.status(200).json(newUser[0])
  })
  .catch(err => console.error(err))
})
app.post('/api/vehicles', (req, res) => {
  const { make, model, year, owner_id } = req.body
  app.get('db').createVehicle([ make, model, year, owner_id ])
  .then(newVehicle => {
    console.log(newVehicle[0])
    res.status(200).json(newVehicle[0])
  })
  .catch(err => console.error(err))
})
app.get('/api/user/:userId/vehiclecount', (req, res) => {
  // Count amount of vehicles owned by user ID
  app.get('db').countVehiclesOwnedByUser()
  .then(count => {
    console.log(count)
    res.status(200).json(count[0])
  })
  .catch(err => console.error(err))
})
app.get('/api/user/:userId/vehicle', (req, res) => {
  // Find vehicles by user ID
  app.get('db').displayVehiclesOwnedByUser()
  .then(vehicles => {
    console.log(vehicles)
    res.status(200).json(vehicles)
  })
  .catch(err => console.error(err))
})
app.get('/api/vehicle', (req, res) => {
  const { userEmail, userFirstStart } = req.query
  userEmail ? (
    // find all vehicles registered to a specific Email
    app.get('db').displayVehiclesbyEmail()
    .then(vehicles => {
      console.log(vehicles)
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
  ) : userFirstStart ? (
    // find all vehicles that match letters of any name STEP. 8
    app.get('db').displayVehiclesByNameQry()
    .then(vehicles => {
      console.log(vehicles)
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
  ) : (
    res.status(500).json({ message: 'Wrong query' })
  )
})
app.get('/api/newervehiclesbyyear', (req, res) => {
  // Find all vehicles NEWER than 2000 AND sorted newest to oldest
  app.get('db').displayVehiclesNewer2000()
  .then(vehicles => {
    console.log(vehicles)
    res.status(200).json(vehicles)
  })
  .catch(err => console.error(err))
})
app.put('/api/vehicle/:vehicleId/user/:userId', (req, res) => {
  // Assign new user to a specified vehicle RETURNING *
  app.get('db').sellVehicle()
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle[0])
  })
  .catch(err => console.error(err))
})
app.delete('/api/user/:userId/vehicle/:vehicleId', (req, res) => {
  // Repossess a vehicle, leaving it's owner_id field as null RETURNING *
  app.get('db').repossessVehicle()
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle[0])
  })
  .catch(err => console.error(err)) 
})
app.delete('/api/vehicle/:vehicleId', (req, res) => {
  // Remove vehicle completely RETURNING *
  app.get('db').removeVehicle()
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle[0])
  })
  .catch(err => console.error(err))
})

app.listen(PORT, () => console.log('Listing on Port: ' + PORT))
