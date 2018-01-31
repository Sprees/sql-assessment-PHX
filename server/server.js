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
  // Reset DB for postman testing
  db.dropVehicles()
  .then(() => console.log('Vehicles table dropped'))
  .catch(err => console.error('Drop error', err))
  .then(() => {
    db.dropUsers()
    .then(response => console.log('Users table dropped'))
    .catch(err => console.error('Drop error', err))
  })
  setTimeout(() => {
    db.createUsersTable()
    .then(() => console.log('Users table created'))
    .catch(err => console.error('Users table init error', err))
    .then(() => {
      db.addUsers()
      .then(users => console.log(users))
      .catch(err => console.error(err))
      .then(() => {
        db.createVehiclesTable()
        .then(() => console.log('Vehicles table created'))
        .catch(err => console.error('Vehicles table init error', err))
        .then(() => {
          db.addVehicles()
          .then(vehicles => console.log(vehicles))
          .catch(err => console.error(err))
        })
      })
    })
  },500)
},1500)

app.get('/api/users', (req, res) => {
  // Display all users
  app.get('db').getAllUsers()
  .then(users => res.status(200).json(users))
  .catch(err => console.error(err))
})
app.get('/api/vehicles', (req, res) => {
  // Display all vehicles
  app.get('db').getAllVehicles()
  .then(vehicles => res.status(200).json(vehicles))
  .catch(err => console.error(err))
})
app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  // Create a user
  app.get('db').createUser([ name, email ])
  .then(newUser => {
    console.log(newUser)
    res.status(200).json(newUser)
  })
  .catch(err => console.error(err))
})
app.post('/api/vehicles', (req, res) => {
  const { make, model, year, owner_id } = req.body
  // Create a vehicle
  app.get('db').createVehicle([ make, model, year, owner_id ])
  .then(newVehicle => {
    console.log(newVehicle)
    res.status(200).json(newVehicle)
  })
  .catch(err => console.error(err))
})
app.get('/api/user/:userId/vehiclecount', (req, res) => {
  const { userId } = req.params
  // Count amount of vehicles owned by user ID
  app.get('db').countVehiclesOwnedByUser([ userId ])
  .then(count => {
    console.log(count)
    res.status(200).json(count)
  })
  .catch(err => console.error(err))
})
app.get('/api/user/:userId/vehicle', (req, res) => {
  // Find vehicles by user ID
  const { userId } = req.params
  app.get('db').displayVehiclesOwnedByUser([ userId ])
  .then(vehicles => {
    console.log(vehicles)
    res.status(200).json(vehicles)
  })
  .catch(err => console.error(err))
})
app.get('/api/vehicle', (req, res) => {
  const { userEmail, userFirstStart } = req.query
  console.log(req.query)
  userEmail ? (
    // find all vehicles registered to a specific Email
    app.get('db').displayVehiclesbyEmail([ userEmail ])
    .then(vehicles => {
      console.log('running email search', vehicles)
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
  ) : userFirstStart ? (
    // find all vehicles that match letters of any name STEP. 8
    app.get('db').displayVehiclesByNameQry([ 
      userFirstStart.toUpperCase().concat('%') 
    ])
    .then(vehicles => {
      console.log('running qry search', vehicles)
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
  const { vehicleId, userId } = req.params
  // Assign new user to a specified vehicle RETURNING *
  app.get('db').sellVehicle([ vehicleId, userId ])
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err))
})
app.delete('/api/user/:userId/vehicle/:vehicleId', (req, res) => {
  const { userId, vehicleId } = req.params
  // Repossess a vehicle, leaving it's owner_id field as null RETURNING *
  app.get('db').repossessVehicle([ vehicleId, userId ])
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err)) 
})
app.delete('/api/vehicle/:vehicleId', (req, res) => {
  const { vehicleId } = req.params
  // Remove vehicle completely RETURNING *
  app.get('db').removeVehicle([ vehicleId ])
  .then(vehicle => {
    console.log(vehicle[0])
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err))
})

app.listen(PORT, () => console.log('Listing on Port: ' + PORT))
