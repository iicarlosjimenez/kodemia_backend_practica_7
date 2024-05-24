const express = require('express')
const fs = require('node:fs');
const server = express()
const port = 8080
const fileName = "koders.json"

// Initializable
initFile()
function initFile() {
   const fileExists = fs.existsSync(fileName)

   if (!fileExists)
      updateFile([])
}

server.use(express.json())

server.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})

// Index
server.get('/', (request, response) => {
   response.json({ status: true })
})
// Index koders
server.get('/koders', (request, response) => {
   const koders = getKoders()
   response.json(koders)
})
// Create koders
server.post('/koders', (request, response) => {
   const koders = getKoders()
   const body = request.body
   const rules = {
      'name': ['required', 'string'],
      'generation': ['required', 'number'],
      'gender': ['required', 'string'],
      'age': ['required', 'number'],
      'isActive': ['required', 'boolean']
   }

   const validate = validator(rules, body)
   if (validate.validated) {
      const { 
         id = idIncrement(koders), 
         name, 
         generation, 
         gender, 
         age, 
         isActive 
      } = body
      const koder = {
         id: id,
         name: name,
         generation: generation,
         gender: gender,
         age: age,
         isActive: isActive,
      }
      koders.push(koder)

      updateFile(koders)

      response.json(koders)
      return;
   }

   response.status(400)
   response.json(validate.messages)
})
// Update koder
server.put('/koders/:name', (request, response) => {
   const { name } = request.params

   const koders = getKoders()
   const koderFind = koders.find(item => item.name == name)
   if (!!!koderFind) {
      response.status(400)
      response.json({ status: 'error', message: 'element not find' })
      return;
   }

   const body = request.body
   const rules = {
      'name': ['required', 'string'],
      'generation': ['required', 'number'],
      'gender': ['required', 'string'],
      'age': ['required', 'number'],
      'isActive': ['required', 'boolean']
   }
   const validate = validator(rules, body)
   if (validate.validated) {
      const {
         name,
         generation,
         gender,
         age,
         isActive 
      } = body

      koders.forEach(item => {
         if (item.id == koderFind.id) {
            item.name = name
            item.generation = generation
            item.gender = gender
            item.age = age
            item.isActive = isActive
         }
      });
      updateFile(koders)

      response.json(koders)
      return;
   }

   response.status(400)
   response.json(validate.messages)
})

// Delete koder
server.delete('/koders/:name', (request, response) => {
   const { name } = request.params

   let koders = getKoders()
   const koderFind = koders.find(item => item.name == name)
   if (!!!koderFind) {
      response.status(400)
      response.json({ status: 'error', message: 'element not find' })
      return;
   }
   koders = koders.filter(item => item.id != koderFind.id);
   updateFile(koders)

   response.json(koders)
})

// Get ID Increment
function idIncrement(data) {
   let id = 1
   // Get Last Item
   let lastElement = data.slice(-1)[0]
   if (lastElement?.hasOwnProperty("id"))
      id = lastElement.id + 1

   return id
}

// Get Content File
function getKoders() {
   const content = JSON.parse(fs.readFileSync(fileName, 'utf-8'))
   return content;
}
// Write File
function updateFile(koders) {
   fs.writeFileSync(fileName, JSON.stringify(koders))
}

// Validation
function validator(rules, data) {
   let validated = true
   let messages = []

   Object.entries(rules).forEach(([key, value]) => {
      value.forEach(rule => {
         switch (rule) {
            case 'required':
               if (!data.hasOwnProperty(key)) {
                  validated = false
                  messages.push(`The field ${key} is required`)
               } else {
                  if (!data[key]) {
                     validated = false
                     messages.push(`The field ${key} is required`)
                  }
               }
               break;
            case 'number':
               if (isNaN(data[key])) {
                  validated = false
                  messages.push(`The field ${key} is not a number`)
               }
               break;
            case 'string':
               if (typeof data[key] !== 'string') {
                  validated = false
                  messages.push(`The field ${key} is not a string`)
               }
               break;
            case 'boolean':
               if (typeof data[key] !== 'boolean') {
                  validated = false
                  messages.push(`The field ${key} is not a boolean`)
               }
               break;
            default:
               break;
         }
      });
   });

   return {
      validated: validated,
      messages: messages
   }
}
