# API Documentation

## User API

### `createUser(userData)`
Create a new user account.

**Parameters:**
- `userData.email` (string, required): User email address
- `userData.password` (string, required): User password (min 12 chars, must contain uppercase, lowercase, and number)
- `userData.name` (string, required): User display name

**Returns:** User object with id, email, name, displayName, status, createdAt

**Throws:** Error if email is invalid or password is weak

### `getUserById(id)`
Retrieve user by ID.

**Parameters:**
- `id` (number): User ID

**Returns:** User object or null if not found

### `updateUser(id, updates)`
Update user information.

**Parameters:**
- `id` (number): User ID
- `updates` (object): Fields to update

**Returns:** Updated user object or null if not found

### `deleteUser(id)`
Delete user by ID.

**Parameters:**
- `id` (number): User ID

**Returns:** Boolean indicating success

### `listUsers(filters)`
List all users with optional filtering.

**Parameters:**
- `filters.status` (string, optional): Filter by status

**Returns:** Array of user objects

## Post API

### `createPost(postData)`
Create a new blog post.

**Parameters:**
- `postData.title` (string, required): Post title (min 3 chars)
- `postData.content` (string, required): Post content
- `postData.authorId` (number, required): Author user ID

**Returns:** Post object with id, title, content, authorId, published, createdAt

**Throws:** Error if title is too short

### `getPostById(id)`
Retrieve post by ID.

**Parameters:**
- `id` (number): Post ID

**Returns:** Post object or null if not found

### `publishPost(id)`
Publish a post.

**Parameters:**
- `id` (number): Post ID

**Returns:** Updated post object or null if not found

### `listPosts(filters)`
List posts with optional filtering.

**Parameters:**
- `filters.authorId` (number, optional): Filter by author
- `filters.published` (boolean, optional): Filter by published status

**Returns:** Array of post objects

## Authentication API

### `hashPasswordV2(password)`
Hash password using SHA-256 (v2 algorithm).

**Parameters:**
- `password` (string): Plain text password

**Returns:** Hashed password string

### `createSession(userId)`
Create authentication session.

**Parameters:**
- `userId` (number): User ID

**Returns:** Session token string

### `validateSession(token)`
Validate session token.

**Parameters:**
- `token` (string): Session token

**Returns:** Session object or null if invalid/expired

### `logout(token)`
Invalidate session.

**Parameters:**
- `token` (string): Session token

**Returns:** Boolean indicating success
