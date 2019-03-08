#!/bin/bash


REM(){
    echo $*
}

docker inspect -f '{{.State.Running}}' cen > /dev/null && docker stop cen && docker rm cen


source  $(dirname $0)/run.cmd | tee /tmp/cen.run

ID=$(docker inspect -f '{{.Id}}' cen)

echo docker exec -it $ID /bin/bash
