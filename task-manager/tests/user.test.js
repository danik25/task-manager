const request = require('supertest');
const app = require('../src/app')
const User= require('../src/models/user')

const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up new user', async () => {
	const response = await request(app).post('/users').send({
		name:'roni2',
		email: 'roni2@gmail.com',
		password:'roni123'
	}).expect(201)

	// assert that the database changed correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	//assertions about the response
	expect(response.body).toMatchObject({
		user:{
			name: 'roni2',
			email: 'roni2@gmail.com'
		},
		token: user.tokens[0].token
	})

	//assertions about the password
	expect(user.password).not.toBe('12345')
}) 

test('should log in existing user', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)

	const user = await User.findById(response.body.user._id)
	expect(response.body.token).toBe(user.tokens[1].token)
	
})

test('should not log in, not existing user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: userOne.password + 1
	}).expect(400)
})

test('should get profile for user', async() => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`) // `` for template
		.send()
		.expect(200)
})

test('should not get profile for unauthonticated user', async() => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401)
})

test('should delete for user', async() => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`) // `` for template
		.send()
		.expect(200)

	const user = await User.findById(userOneId)
	expect(user).toBeNull()
})

test('should not delete profile for unauthonticated user', async() => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401)
})

test('should upload avatar image', async () => {
	await request(app)
	.post('/users/me/avatar')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`) // `` for template
	.attach('avatar', 'tests/fixtures/smily.jpg')
	.expect(200)

	const user = await User.findById(userOneId)
	// toBe uses '===', toEqual uses an algorithm for comparing properties
	expect(user.avatar).toEqual(expect.any(Buffer)) //check if what you are looking at is of that type
})

test('should update user fields', async () => {
	const response = await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name : "roniron"
		}).expect(200)
		const user = await User.findById(userOneId)
	expect(user.name).toBe("roniron")
})

test('should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location : "timrat"
		}).expect(400)
})