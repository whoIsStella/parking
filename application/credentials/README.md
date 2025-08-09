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

## Part 2: Accessing the PostgreSQL Database from EC2

A dedicated application user (`special_usr`) has been created for secure access.

### Database Details

- **RDS Endpoint:** `database-1.cdkeii4im82t.us-west-1.rds.amazonaws.com`
- **Port:** `5432`
- **Application Database Name:** `fuck_amazon`
- **Application Database User:** `special_usr`
- **Application Database User Password:** `i_fucking_hate_amzn`

### Steps (from the EC2 Instance)

1. **Make sure you are SSH'd into the EC2 instance** (as per Part 1).
2. **Use the `psql` command to connect:**

    `psql -h database-1.cdkeii4im82t.us-west-1.rds.amazonaws.com -p 5432 -U special_usr -d fuck_amazon`

3. **Enter the password when prompted:**
    Ex.
    Password for user special_usr:

    Type `i_fucking_hate_amzn` and press Enter. Characters will not appear.
4. **Verification:** Upon successful connection, the prompt will change to `fuck_amazon=>`. You can run a simple query to test:

    `SELECT * FROM marketplace_user LIMIT 5;`

    To exit the `psql` prompt, type `\q` and press Enter or use control-D.

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

        `http://52.52.40.129:3000/`

    - The About page (or homepage) should load.

    This command will typically start the server on `http://localhost:3000` *on the EC2 instance*. You will see output indicating the server has started. The process will continue to run in your SSH session.

4. **Access the Website from Your Local Browser:**
    - Open your web browser on your **local machine**.
    - In the address bar, type the **Public IP Address/DNS of your EC2 instance**, followed by the Next.js port (default 3000):

        ```
        http://52.52.40.129:3000/
        ```

    - The about page should now load in your browser.

5. - Find the running Next.js process:

        `ps aux | grep next`

    - Locate the correct **process ID (PID)** (look for the line with `npm run start` or `next start`).

    - Stop the running server by replacing `<processID>` with the actual PID:

        `kill -9 <processID>`

6. **Notes**

    - To stop the server in the future, repeat the above process (`ps aux | grep next`, then `kill -9`).

---

**Credentials Folder:** 🎯 Target locked!. This folder is the vault that holds the keys to the
kingdom—**do not** rename it, or you might open a portal to chaos! The CTO has a sixth sense for these things,
and we’d hate to see what happens if this folder goes rogue. Stay tuned for more secrets when we hit Milestone 1! 🔐

---
