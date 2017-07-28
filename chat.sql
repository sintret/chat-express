/*
SQLyog Ultimate v11.33 (64 bit)
MySQL - 10.1.22-MariaDB : Database - chat
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`chat` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `chat`;

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `roleId` tinyint(1) DEFAULT '3',
  `createdAt` datetime NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Data for the table `user` */

insert  into `user`(`id`,`username`,`password`,`fullname`,`email`,`photo`,`roleId`,`createdAt`,`updatedAt`) values (1,'admin','0786d584','Andy Laser','sintret@gmail.com','a.jpg',1,'2017-07-08 22:42:08','2017-07-28 16:34:13'),(2,'test1','0786d584','Test Satu','test@gmail.com','b.jpg',3,'2017-07-08 22:42:08','2017-07-15 20:18:39'),(3,'test2','0786d584','Test Dua','test2@gmail.com','c.jpg',3,'2017-07-08 22:42:08','2017-07-15 20:18:48'),(4,'test3','0786d584','Test Tiga','test3@gmail.com','d.jpg',3,'2017-07-08 22:42:08','2017-07-15 20:18:49'),(5,'test4','0786d584','Test Empat','test4@gmail.com','e.jpg',3,'2017-07-08 22:42:08','2017-07-15 20:18:50');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
