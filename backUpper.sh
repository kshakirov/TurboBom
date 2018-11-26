#!/bin/bash
date_string=`date +%Y%m%d`
backupPath="$HOME/backup"
collections=(parts bom_edges interchange_headers interchange_edges alt_interchange_headers alt_interchange_edges)

echo $backupPath


for i in ${collections[@]}; do

arangoimp --server.endpoint tcp://127.0.0.1:8529 --server.username root --server.database "BomStaging" --server.password servantes  --file "$backupPath/$date_string/$i.json" --type json --collection "$i" --overwrite true
done
