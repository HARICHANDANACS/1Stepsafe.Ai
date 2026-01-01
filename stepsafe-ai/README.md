# StepSafe AI

This is a Next.js application built with Firebase and Genkit that acts as a personal climate-health co-pilot. It provides personalized guidance to mitigate the impacts of climate on health and well-being.

## Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Firebase](https://firebase.google.com/) account

### 1. Clone the Repository

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/HARICHANDANACS/1Stepsafe.Ai.git
cd 1Stepsafe.Ai
```

### 2. Install Dependencies

Install all the necessary npm packages.

```bash
npm install
```

### 3. Set Up Environment Variables

This project requires Firebase credentials to connect to the backend. The `.env` file is ignored by Git for security, so you will need to create your own.

- Create a copy of the example environment file:

  ```bash
  # For Windows (Command Prompt)
  copy .env.example .env

  # For macOS/Linux
  cp .env.example .env
  ```

- **Log in to Firebase** and create a new Firebase project.
- In your new Firebase project, create a new **Web App**.
- Firebase will provide you with a `firebaseConfig` object. Copy the values from that object into your newly created `.env` file.

Your `.env` file should look something like this, but with your own keys:

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
```

### 4. Run the Development Server

Now you can start the application.

```bash
npm run dev
```

The application should now be running locally, typically at `http://localhost:9002`.
