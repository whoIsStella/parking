# Application Credentials README

## Prerequisites

- **SSH Client:**  
  - **Linux/macOS:** Built-in `ssh` command in your terminal.
  - **Windows:** Git Bash (recommended), Windows Subsystem for Linux (WSL), or PowerShell with OpenSSH.

---

1. **Check for existing backend processes (optional):**

    `ps aux | grep python`

    `ps aux | grep daphne`

    `ps aux | grep manage`

    `ps aux | grep redis`

   - If you see any stuck or duplicate processes, you can stop them using:

    `kill -9 <processID>`

2. **Navigate to the backend directory:**

    `cd ~/has_docker/application/backend`

3. **Stop and remove any existing containers, volumes, and orphans:**

    `sudo docker compose down --volumes --remove-orphans`

4. **Rebuild the containers without using cache:**

    `sudo docker compose build --no-cache`

5. **Start the backend services:**

    `sudo docker compose up -d`

   - This command will start the backend server, PostgreSQL database, and Redis in detached mode.
   - You can check running containers with:

    `sudo docker ps -a`

---

## Part 3: Running and Accessing the Next.js Site

The Next.js application code is located on the EC2 instance.

### From the EC2 Instance and Local Browser

1. **Make sure you are SSH'd into the EC2 instance.**

2. **Navigate to the Next.js project directory:**

    `cd ~/has_docker/application/frontend/about`

3. **Install/Verify Dependencies(optional):** While they should be installed, it's good practice to ensure they are up-to-date:

    `npm install`

4. **Run the Next.js server:**

   ## Running the Next.js Application on Your EC2 Instance (Production)

1. **Create a Production Build**  
    While inside your application folder, run:

    `npm run build`

2. **Start the App in the Background (Production Mode)**  
    Use `nohup` to run the server in the background and log output:

    `nohup npm run start > output.log 2>&1 &`

    - This will start the server in production mode and redirect all output to `output.log`.

    - You can safely close your SSH session; the app will keep running.

3. **Check If the Website Is Running**

    - In your **local browser**, visit:

4. - Find the running Next.js process:

        `ps aux | grep next`

    - Locate the correct **process ID (PID)** (look for the line with `npm run start` or `next start`).

    - Stop the running server by replacing `<processID>` with the actual PID:

        `kill -9 <processID>`

5. **Notes**

    - To stop the server in the future, repeat the above process (`ps aux | grep next`, then `kill -9`).

---