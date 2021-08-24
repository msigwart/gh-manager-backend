# Backend Documentation

## Run with local database
1. Start new database instance in Docker container
    ```
    docker run --name gh-manager-db -p 5432:5432 -e POSTGRES_PASSWORD=<db_password> -e POSTGRES_DB=gh-manager -d postgres
    ```
2. Make sure file `src/config/development.js` exists
2. Run backend
    ```
    NODE_ENV=development npm run dev
    ```
   
## Run locally with production database 
1. Run Google Cloud SQL Proxy
    ```
    cloud_sql_proxy -instances=gh-manager:europe-west3:gh-manager-postgres=tcp:5432
    ```
2. Run backend
    ```
    GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json" NODE_ENV=production NODE_CONFIG='{"database":{"host":"localhost"}}' npm run dev
    ```

## Deploy to Google Cloud Run
1. Build project and create Docker image
   ```
   npm run build
   ```
   
2. Push Docker image
   ```
   docker push gcr.io/gh-manager/gh-manager-backend:<version> 
   ```   

3. Deploy revision
    1. Go to Google Cloud Console > Google Cloud Run
    2. Select service `gh-manager-backend`
    3. Click "Edit and deploy new revision"
    4. Select new container image URL
    5. Click "Deploy"
    
> Make sure the environment variables NODE_ENV=production and
> CLOUD_SQL_CONNECTION_NAME=<cloudsql-instance-name> are set properly.
                                                                                                                                                                                                                >
