## How the Express + MongoDB code works (VectorFit backend)

This document explains how the provided files work together to expose a small CRUD API for `User` objects using Express and Mongoose (MongoDB).

### Files referenced
- `Backend/routes/usersRoutes.js` — Express router that maps HTTP endpoints to controller functions.
- `Backend/models/UserSchema.js` — Mongoose schema and model for `User` documents.
- `Backend/controller/userController.js` — Controller functions (not shown here) that implement the business logic and use the Mongoose model.

### High-level request flow

1. A client makes an HTTP request to an endpoint (for example, `GET /users`).
2. Express matches the route using the router defined in `usersRoutes.js`.
3. The router calls a controller function (e.g. `getUsers`) that performs database operations using the Mongoose `User` model.
4. The controller reads/writes data to MongoDB through Mongoose and returns an HTTP response to the client.

### What `usersRoutes.js` does

`usersRoutes.js` registers routes on an Express `Router`:

```js
import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controller/userController.js';

const router = express.Router();
router.get('/', getUsers);         // GET /users
router.post('/', createUser);      // POST /users
router.put('/:id', updateUser);    // PUT /users/:id
router.delete('/:id', deleteUser); // DELETE /users/:id

export default router;
```

- Each route maps an HTTP method and path to a controller function. The router itself doesn't know about MongoDB — it only delegates to controller functions.

### What `UserSchema.js` defines

```js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: String,
    email: String,
    age: Number
});

export default model('User', userSchema);
```

- `userSchema` declares the shape of user documents stored in MongoDB (three fields: `name`, `email`, `age`).
- `model('User', userSchema)` creates a Mongoose Model named `User`. The model provides methods such as `find`, `findById`, `save`, `findByIdAndUpdate`, and `findByIdAndDelete` to interact with the underlying `users` collection.

### Typical controller -> Mongoose mappings (what the controller likely does)

- getUsers (GET `/users`)
  - Calls `User.find()` (maybe with filters) to retrieve users from MongoDB.
  - Sends the result as JSON with status `200`.

- createUser (POST `/users`)
  - Creates a new `User` instance with `req.body` (e.g. `const user = new User(req.body)`).
  - Calls `user.save()` to persist the document.
  - Responds with status `201` and the created user (or projection of it).

- updateUser (PUT `/users/:id`)
  - Reads `req.params.id` and `req.body`.
  - Calls `User.findByIdAndUpdate(id, req.body, { new: true })` to update and return the updated doc.
  - Responds with `200` (or `404` if not found).

- deleteUser (DELETE `/users/:id`)
  - Calls `User.findByIdAndDelete(id)`.
  - Responds with `204 No Content` on success (or `404` if not found).

Note: exact controller behavior (status codes, request validation) depends on `userController.js`, but the Mongoose methods above are the common patterns.

### Example HTTP requests

- Get all users (using curl):

```bash
curl -X GET http://localhost:3000/users
```

- Create a user:

```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{ \"name\": \"Jane\", \"email\": \"jane@example.com\", \"age\": 28 }"
```

- Update a user:

```bash
curl -X PUT http://localhost:3000/users/<id> -H "Content-Type: application/json" -d "{ \"age\": 29 }"
```

- Delete a user:

```bash
curl -X DELETE http://localhost:3000/users/<id>
```

(If your server is mounted at a path like `/api/users`, include that prefix.)

### Where is the MongoDB connection made?

- The Mongoose connection is typically established once at app startup (for example in `server.js` or `index.js`) using `mongoose.connect(connectionString)`.
- After calling `mongoose.connect(...)`, Mongoose models (like `User`) can be used anywhere in the app to query or modify the database.

Example connection snippet:

```js
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));
```

### Edge cases and suggested improvements

- Input validation: Use a validation library (Joi, express-validator, or Mongoose built-in schema validation) to ensure required fields and types.
- Unique fields / indexes: If emails should be unique, add `email: { type: String, unique: true, required: true }` and handle duplicate key errors.
- Error handling: Controllers should `try/catch` async code, return appropriate HTTP status codes (400/404/500), and avoid leaking internal errors.
- Sanitization: Remove or ignore fields clients shouldn't set (e.g., `_id`, `__v`, server-controlled fields).
- Pagination & filtering: For `getUsers`, consider query params for limit/skip, sort, and search filters.

### Quick mapping summary

- Route -> HTTP method -> likely Mongoose call
- `GET /users` -> `GET` -> `User.find()`
- `POST /users` -> `POST` -> `new User(req.body).save()`
- `PUT /users/:id` -> `PUT` -> `User.findByIdAndUpdate(id, req.body, { new: true })`
- `DELETE /users/:id` -> `DELETE` -> `User.findByIdAndDelete(id)`

### Next steps (optional)

- Inspect `Backend/controller/userController.js` to document exact implementation and status codes.
- Add validation and tests for the controller endpoints.

---
Created to help you understand how Express routes, controller functions, and the Mongoose model interact to form the backend CRUD API.
