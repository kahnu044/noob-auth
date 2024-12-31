# Noob Auth Server

This is a Node.js-based authentication server designed to support multiple authentication flows, including manual login with email and password and OAuth2 login with Google. It can handle client-specific authentication, allowing different client apps to use the same authentication service.

## Features

- Manual login and signup with email and password.
- Google OAuth2 login.
- Support for client-specific authentication via `clientUrl`.
- Optional authentication for global access without associating with a specific client app.
- Secure JWT-based authentication.
- Cookie-based client information handling.
- MongoDB integration for user data management.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kahnu044/noob-auth
   cd noob-auth
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=3000
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_REDIRECT_URI=<your-google-redirect-uri>
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

### Root Endpoint

#### `GET /`
- Displays the login page.
- Accepts an optional `clientUrl` query parameter.
- If `clientUrl` is provided, it is stored in cookies for further processing.

#### Manual Login

- Body Parameters:
  - `email` (string, required): User's email.
  - `password` (string, required): User's password.
- Behavior:
  - If `clientUrl` is in cookies, authentication is scoped to the client app.
  - If `clientUrl` is absent, performs global authentication.

### Google OAuth

#### `GET /auth/google`
- Redirects the user to Google for OAuth authentication.

#### `GET /auth/google/callback`
- Handles the Google OAuth callback.
- If `clientUrl` is present, associates the user with the client app.
- If `clientUrl` is absent, logs in the user globally.



For any questions or issues, feel free to open an issue in the repository or contact me.



