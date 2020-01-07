redis-server --daemonize yes
mysql -u root -p TheWorldIsBig2251 mad_minute < database.sql
node server.js $1
