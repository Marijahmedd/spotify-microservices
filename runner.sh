echo "Running redis in docker..."
docker compose up -d
echo "redis up"
cd spotify-front
npm run dev > ../frontend.log 2>&1 &
echo "frontend running"
cd ../services
echo "inside services"
cd admin-service 
npm run dev > ../../admin.log 2>&1 &
echo "admin service is running"
cd ../song-service 
npm run dev > ../../song-service.log 2>&1 &
echo "song service is running"
cd ../user-service
npm run dev > user-service.log 2>&1 &
echo "user-service is running"

