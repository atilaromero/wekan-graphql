const {graphql} = require('graphql')
const {makeExecutableSchema} = require('graphql-tools')
const {typeDefs, get_resolvers} = require('./schema')
require('node-fetch')
const fetchMock =  require('fetch-mock')

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: get_resolvers('http://wekan.triagem1')
})

test('authorization', async() => {
    fetchMock
    .post('http://wekan.triagem1/users/login',{id:"id1", token:"token1"})
    const query = '{authorize(user:"myuser", password:"secret") {user token}}'
    const response = await graphql(schema, query, null)
    expect(response).toEqual({
        data:{
            authorize: {
                user: "id1",
                token: "token1",
            }
        }
    })
})


test('boards', async() => {
    fetchMock
    .post('http://wekan.triagem1/users/login',{id:"id1", token:"token1"}, {overwriteRoutes: false})
    .get('http://wekan.triagem1/api/users/id1/boards', [
        { _id: 'zjPGRSXnC5Tf8Yy33', title: 'Exames' },
        { _id: 'cwbHoELXihmsai9Qt', title: 'IPL' },
        { _id: 'Z5SDG8CTZ7SBsaX4t', title: 'Materiais' },
        { _id: 'XtXmwvBmqfRy7soaB', title: 'Registros' },
        { _id: 'eFhJWC94tiGib3aAt', title: 'Templates' }
    ])
    const query = '{authorize(user:"id1", password:"token1") {user token}}'
    const response = await graphql(schema, query, null)
    const user = response.data.authorize.user
    const token = response.data.authorize.token
    const query2 = `{boards {_id title}}`
    const resp2 = await graphql(schema, query2, null, {user, token})
    expect(resp2).toEqual({
        data:{
            boards: [
                { _id: 'zjPGRSXnC5Tf8Yy33', title: 'Exames' },
                { _id: 'cwbHoELXihmsai9Qt', title: 'IPL' },
                { _id: 'Z5SDG8CTZ7SBsaX4t', title: 'Materiais' },
                { _id: 'XtXmwvBmqfRy7soaB', title: 'Registros' },
                { _id: 'eFhJWC94tiGib3aAt', title: 'Templates' }
            ]
        }
    })

})

test('lists', async() => {
    fetchMock
    .post('http://wekan.triagem1/users/login',{id:"id1", token:"token1"}, {overwriteRoutes: false})
    .get('http://wekan.triagem1/api/boards/XtXmwvBmqfRy7soaB/lists', [
        { _id: 'aqWsEibZXcAZoGQjm', title: 'PI' },
        { _id: 'LacKRS8NQRrHt655C', title: 'Fila' },
])
    const query = '{authorize(user:"id1", password:"adsf") {user token}}'
    const response = await graphql(schema, query, null)
    const user = response.data.authorize.user
    const token = response.data.authorize.token
    const query2 = `{board(_id:"XtXmwvBmqfRy7soaB") { lists {_id title}}}`
    const resp2 = await graphql(schema, query2, null, {user, token})
    expect(resp2).toEqual({
        data:{
            board:{
                lists: [
                    { _id: 'aqWsEibZXcAZoGQjm', title: 'PI' },
                    { _id: 'LacKRS8NQRrHt655C', title: 'Fila' },
                ]
            }
        }
    })

})

test('cards', async() => {
    fetchMock
    .post('http://wekan.triagem1/users/login',{id:"id1", token:"token1"}, {overwriteRoutes: false})
    .get('http://wekan.triagem1/api/boards/XtXmwvBmqfRy7soaB/lists/LacKRS8NQRrHt655C/cards', [
        { _id: 'LPPn4zWoEjNHfkWdX', title: 'R171195' },
    ])
    const query = '{authorize(user:"id1", password:"asdf") {user token}}'
    const response = await graphql(schema, query, null)
    const user = response.data.authorize.user
    const token = response.data.authorize.token
    const query2 = `{board(_id: "XtXmwvBmqfRy7soaB") { list(_id: "LacKRS8NQRrHt655C") { cards{_id title}}}}`
    const resp2 = await graphql(schema, query2, null, {user, token})
    expect(resp2).toEqual({
        data:{
            board:{
                list:{
                    cards: [
                        { _id: 'LPPn4zWoEjNHfkWdX', title: 'R171195' },
                    ]
                }
            }
        }
    })

})