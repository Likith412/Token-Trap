# Token Trap

Token Trap is a full-stack application that helps you find exposed secrets in GitHub organizations and user accounts. It provides a secure, easy-to-use dashboard to run scans, view detailed results, and keep your codebase safe from leaks.

## Demo

https://github.com/user-attachments/assets/c69a4b4b-ae69-4076-8bc7-2a34eebf1333


## Features

### Core Security Features

- **Secret Detection:** Scan GitHub organizations and users for API keys, tokens, and sensitive credentials.
- **Detailed Reports:** Access comprehensive reports with summaries and per-user findings.
- **Organization-wide Security:** Monitor and manage security across all your organization's repositories.
- **Real-time Scan Progress:** Monitor scan status with live updates and progress indicators.

### User Management & Authentication

- **Secure JWT Authentication:** Protected API endpoints with JWT-based authentication.
- **User Session Management:** Persistent login sessions with secure token storage.
- **Authorization Controls:** Users can only access and manage their own scans.

### Scan Management

- **Start New Scans:** Initiate scans for any GitHub organization or user.
- **Cancel Running Scans:** Stop ongoing scans with immediate cancellation.
- **Delete Completed Scans:** Remove scan history and results from the database.
- **Scan Status Tracking:** Real-time status updates (running, completed, failed, cancelled).

### Advanced Search & Filtering

- **Status-based Filtering:** Filter scans by status (running, completed, failed, cancelled).
- **Organization Search:** Search scans by organization name with partial matching.
- **Pagination Support:** Navigate through large scan lists with configurable page sizes.
- **Clear Filters:** Reset search criteria with one-click clear functionality.

### Email Notifications

- **Success Notifications:** Receive detailed email reports when scans complete successfully.
- **Failure Alerts:** Get notified when scans fail with error details.
- **Cancellation Confirmations:** Email notifications for cancelled scans.
- **Professional Email Templates:** Beautiful HTML email templates with scan summaries.

### Detailed Results & Analytics

- **Vulnerability Counts:** Track total threats detected per scan.
- **Result Categorization:** Separate organization and user-level results.
- **Detector Type Analysis:** Identify different types of secrets found.
- **Severity Classification:** Categorize vulnerabilities by severity levels.
- **Copy-to-Clipboard:** Easy copying of detected secrets for analysis.

### User Interface Features

- **Modern Responsive Design:** Fully responsive interface that works on all devices.
- **Mobile-Optimized:** Touch-friendly interface with mobile-specific optimizations.
- **Dark Theme:** Eye-friendly dark theme with consistent color scheme.
- **Loading States:** Smooth loading animations and progress indicators.
- **Error Handling:** User-friendly error messages and retry mechanisms.
- **Toast Notifications:** Real-time feedback for user actions.

### Technical Features

- **Process Management:** Background scan processes with proper cleanup.
- **File Management:** Automatic cleanup of temporary scan files.
- **GitHub API Integration:** Validate organization names before scanning.
- **Cross-Platform Support:** Works on Windows, macOS, and Linux.

## Tech Stack

- **Frontend:** React.js, CSS, Vite
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** JWT Auth, bcrypt
- **Scanning:** GitHub API's
- **Email:** Nodemailer with Gmail SMTP
- **UI/UX:** React Icons, React Spinners, React Toastify

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)
- [GitHub CLI](https://cli.github.com/) (`gh`) installed

### Clone the Repository

```sh
git clone https://github.com/likith412/token-trap.git
cd token-trap
```

### Backend Setup

1. **Install dependencies:**

   ```sh
   cd backend
   npm install
   ```

2. **Environment variables:**

   Create a `.env` file in `backend/`:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GITHUB_TOKEN=your_github_token
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   ```

3. **Output Directory:**

   The backend stores scan results temporarily in `backend/outputs/` (ignored by git).

4. **Start the backend server:**

   ```sh
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**

   ```sh
   cd frontend
   npm install
   ```

2. **Start the frontend dev server:**

   ```sh
   npm run dev
   ```

3. **Access the app:**

   Open [http://localhost:8000](http://localhost:8000) in your browser.

## Usage

### Getting Started

1. **Login:** Create an account or log in with existing credentials.
2. **Start a Scan:** Navigate to "Start Scan" and enter a GitHub organization name.
3. **Monitor Progress:** Watch real-time scan progress with status updates.
4. **View Results:** Access detailed reports with vulnerability breakdowns.

### Managing Scans

- **Filter & Search:** Use the filters on the Scans page to find specific scans.
- **Cancel Scans:** Stop running scans that are taking too long.
- **Delete Scans:** Remove completed scans to free up space.
- **View Details:** Click on any scan to see comprehensive results.

### Understanding Results

- **Organization Results:** Secrets found in organization-level repositories.
- **User Results:** Secrets found in individual user repositories.
- **Severity Levels:** High, Medium, and Low risk classifications.
- **Detector Types:** Different types of secrets (API keys, tokens, etc.)

## Folder Structure

```
backend/
  controllers/          # API route handlers
  models/              # MongoDB schemas
  routes/              # API route definitions
  scripts/             # Scan execution scripts
  utils/               # Helper functions (email, scan helpers)
  outputs/             # outputs (gitignored)
frontend/
  src/
    components/        # React components
    context/          # React context providers
  public/             # Static assets
```

## Private Scripts

This project uses a custom script called `/backend/scripts/run-scan.sh` for internal automation.  
It is **not included in this repository** for privacy/security reasons.

If you need access, please contact the maintainer.

## License

This project is licensed under the MIT License.

\*\*Developed by [Likith Metikala](https://github.com/likith412), [Kullai Metikala](https://github.com/kullaisec)
