# Score Calculator

## Overview

This application allows users to register, log in, and manage their card inventory. Users can also create teams from their inventory and use a gacha system to pull new cards.

## Requirements

- Node.js
- PouchDB
- Express.js

## Installation

1. Clone the repository:
   git clone <repository-url>

    Navigate to the project directory:

cd <project-directory>

2. Install dependencies:

    npm install

3. Populate the Cards

    Run this command to populate all the cards in the database:

    node .\Populate-pouchdb.js

4. Running the Server

    Start the server:

npm start

5. Open your browser and navigate to:
    http://localhost:3000

SPECIFICS:
API Endpoints
User Registration

    Endpoint: /api/register
    Method: POST
    Request Body:

    json

    {
      "username": "exampleUsername",
      "password": "examplePassword"
    }

    Response:
        201 Created on success
        400 Bad Request if username already exists

User Login

    Endpoint: /api/login
    Method: POST
    Request Body:

    json

    {
      "username": "exampleUsername",
      "password": "examplePassword"
    }

    Response:
        200 OK on success
        400 Bad Request if username or password is incorrect

Get User Data

    Endpoint: /api/user/:username
    Method: GET
    Response:

    json

    {
      "username": "exampleUsername",
      "password": "hashedPassword",
      "inventory": []
    }

Update User Data

    Endpoint: /api/user/:username
    Method: PUT
    Request Body:

    json

    {
      "username": "exampleUsername",
      "password": "hashedPassword",
      "inventory": []
    }

    Response:
        200 OK on success

Get Cards Data

    Endpoint: /api/cards
    Method: GET
    Response:

    json

    {
      "cards": []
    }