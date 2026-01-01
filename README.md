# StepSafe AI

This is a Next.js application built with Firebase and Genkit that acts as a personal climate-health co-pilot. It provides personalized guidance to mitigate the impacts of climate on health and well-being.

## Getting Started: Local Development Setup

Follow these instructions to set up and run the project on your local machine. This allows you to run the app using your own separate Firebase backend, keeping all secrets and data safe.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A personal [Firebase](https://firebase.google.com/) account

### Installation Steps

**1. Clone the Repository**

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/HARICHANDANACS/1Stepsafe.Ai
```

**2. Navigate into the Project**

```bash
cd 1Stepsafe.Ai
```

**3. Install Dependencies**

Install all the necessary npm packages for the project.

```bash
npm install
```

**4. Set Up Your Environment Variables (.env file)**

The project requires Firebase credentials to connect to the backend. These keys are stored in a local `.env` file that is never committed to GitHub.

-   **Create your local `.env` file** by making a copy of the example file:

    ```bash
    # For Windows (Command Prompt)
    copy .env.example .env

    # For macOS/Linux
    cp .env.example .env
    ```

-   **Fill in your keys:**
    -   Log in to your own [Firebase Console](https://console.firebase.google.com/).
    -   Create a new Firebase project.
    -   In your new project, create a new **Web App**.
    -   Firebase will provide you with a `firebaseConfig` object. Copy the values from that object into your newly created `.env` file. It should look like this, but with your own keys:

    ```
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    ```

**5. Run the Development Server**

Now you can start the application.

```bash
npm run dev
```

The application should now be running locally on your machine, typically at `http://localhost:9002`.
