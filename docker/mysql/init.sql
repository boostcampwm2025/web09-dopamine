-- Shadow Database for Prisma Migrate
CREATE DATABASE IF NOT EXISTS `murphy_shadow_db`;
GRANT ALL PRIVILEGES ON `murphy_shadow_db`.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
