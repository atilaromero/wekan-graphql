const express = require('express')
const graphqlHTTP = require('express-graphql')

const {root, schema} = require('./root')

const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))
app.listen(4000,() => {
    console.log('listening on port 4000')
})
