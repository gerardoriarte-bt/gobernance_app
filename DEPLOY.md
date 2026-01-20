
# Deploy Governance Builder to AWS EC2

This guide outlines the steps to deploy the application to an AWS EC2 instance (t3.micro).

## Prerequsites
- An AWS Account
- A running EC2 instance (t3.micro) with Amazon Linux 2 or Ubuntu.
- SSH Access to the instance.

## Step 1: Install Docker on EC2
Connect to your instance and run:

```bash
# Update packages
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER
```
*(Logout and login again for group changes to take effect)*

## Step 2: Transfer Files
Clone the repository directly on the server:

```bash
git clone https://github.com/gerardoriarte-bt/gobernance_app.git
cd gobernance_app
```

## Step 3: Configure Environment
Create the `.env` file with your production environment variables:

```bash
nano .env
```
Paste your Firebase production variables (see `.env.example`).

## Step 4: Build and Run
Run the following commands in the project directory:

```bash
# Build the Docker image
docker build -t governance-builder .

# Run the container mapping port 80
docker run -d -p 80:80 --name app governance-builder
```

## Step 5: Verify Deployment
Open your browser and visit the Public IP of your EC2 instance.
Ensure the Security Group allows Inbound Traffic on Port 80 (HTTP).

## Troubleshooting
- If the container stops immediately, check logs: `docker logs app`
- To stop the app: `docker stop app`
- To remove: `docker rm app`
