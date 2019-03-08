REM 
REM   Run file for CEN 
REM 

docker run --detach --publish 3000:3000 --name  cen  censerver

docker ps

open http://127.0.0.1:3000/