const express = require('express')
const graphqlHTTP = require('express-graphql')

const {typeDefs, get_resolvers} = require('./schema')
const {makeExecutableSchema} = require('graphql-tools')

const REST_URL = process.env.REST_URL

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: get_resolvers(REST_URL),
})

const app = express()
app.use('/', graphqlHTTP({
  schema: schema,
  rootValue: null,
  graphiql: true,
}))
app.listen(4000,() => {
    console.log('listening on port 4000')
})
