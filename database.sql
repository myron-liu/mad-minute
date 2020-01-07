SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE DATABASE IF NOT EXISTS `mad_minute`;

CREATE SCHEMA IF NOT EXISTS `mad_minute` DEFAULT CHARACTER SET latin1 ;
USE `mad_minute` ;

-- -------------------------------------------------
-- Table `mad_minute`. `users` ----------------
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS `mad_minute`.`users` (
  `user_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(50) NOT NULL,
  `user_password` VARCHAR(50) NOT NULL,
   PRIMARY KEY (`user_id`),
   UNIQUE INDEX `user_name` (`user_name` ASC)
);

INSERT IGNORE INTO users(user_name, user_password) VALUES('anon', '');
INSERT IGNORE INTO users(user_name, user_password) VALUES('myron', 'superusermyron');
-- -------------------------------------------------
-- Table `mad_minute`. `user_logs` ----
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS `mad_minute`.`user_logs` (
  `timestamp_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `user_password` VARCHAR(50) NOT NULL,  
  `success` BOOLEAN NOT NULL,
  `action` VARCHAR(50) NOT NUll,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`timestamp_id`)
);


-- -------------------------------------------------
-- Table `mad_minute`. `user_scores` ----
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS `mad_minute`.`user_scores` (
  `timestamp_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `game_number` INT(11) NOT NULL,
  `anon` BOOLEAN NOT NULL,
  `score` INT(11) NOT NULL,
  `num_problems` INT(11) NOT NULL,
  `game_mode` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`timestamp_id`)
);

-- --------------------------------------------------
-- Table `mad_minute`.`user_statistics` ---
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `mad_minute`.`user_statistics` (
  `timestamp_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `game_number` INT(11) NOT NUll,
  `anon` INT(11) NOT NULL,
  `problem` VARCHAR(50) NOT NULL,
  `solution` VARCHAR(50) NOT NULL,
  `answer` VARCHAR(50) NOT NULL,
  `time` FLOAT(4) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`timestamp_id`)
); 

