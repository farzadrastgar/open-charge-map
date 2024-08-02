**How to run :**

1. Clone the Repository

   Open your terminal or command prompt and execute the following command:

git clone https://github.com/farzadrastgar/open-charge-map.git

2. Rename .env.example to .env and fill it

   Navigate into the cloned repository directory:

cd open-charge-map

mv .env.example .env

3. Start Docker Containers

   Ensure Docker Desktop is running. Then, in the project directory, run:

docker-compose up

4. Access the Results

   You can view the results in mongodb through cli, compass or other relevant tools

Feel free to reach out to me at farzadrastgar@gmail.com if you encounter any issues while following these instructions. I'm here to help!

**How to run unit tests :**

1. Navigate to worker folder

cd worker

2. Create an image from Dockerfile and tag it

sudo docker build -t my-worker .

3. Run the image

sudo docker run --rm my-worker npm run test

**How to run e2e tests :**

1. Rename .env.test.example to .env.test and fill it

   Navigate into the cloned repository directory:

cd open-charge-map

mv .env.test.example .env.test

2. Run docker compose file for tests:

sudo docker compose -f docker-compose.e2e.yml up --build
