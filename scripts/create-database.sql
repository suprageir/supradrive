-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: 25. Feb, 2025 19:36 PM
-- Tjener-versjon: 10.6.18-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.20

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supradrive`
--
CREATE DATABASE IF NOT EXISTS `supradrive` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `supradrive`;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `codeimagehashtag`
--

DROP TABLE IF EXISTS `codeimagehashtag`;
CREATE TABLE `codeimagehashtag` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `hashtag` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `codeimagelocation`
--

DROP TABLE IF EXISTS `codeimagelocation`;
CREATE TABLE `codeimagelocation` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `codeimageuser`
--

DROP TABLE IF EXISTS `codeimageuser`;
CREATE TABLE `codeimageuser` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `filesencrypted`
--

DROP TABLE IF EXISTS `filesencrypted`;
CREATE TABLE `filesencrypted` (
  `fileid` bigint(20) NOT NULL,
  `fileidref` bigint(11) DEFAULT NULL,
  `filets` int(11) DEFAULT NULL,
  `folderid` int(11) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `filename` varchar(250) DEFAULT NULL,
  `filenamesalt` varchar(250) DEFAULT NULL,
  `filenameiv` varchar(250) DEFAULT NULL,
  `filenamedisk` varchar(250) DEFAULT NULL,
  `filesha1` varchar(250) DEFAULT NULL,
  `salt` varchar(250) DEFAULT NULL,
  `iv` varchar(250) DEFAULT NULL,
  `wiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `foldersencrypted`
--

DROP TABLE IF EXISTS `foldersencrypted`;
CREATE TABLE `foldersencrypted` (
  `folderid` int(11) NOT NULL,
  `foldersysid` int(11) DEFAULT NULL,
  `foldersubid` int(11) DEFAULT NULL,
  `folderuserid` int(11) DEFAULT NULL,
  `foldername` varchar(250) DEFAULT NULL,
  `foldersalt` varchar(250) DEFAULT NULL,
  `folderiv` varchar(250) DEFAULT NULL,
  `folderwiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagefile`
--

DROP TABLE IF EXISTS `imagefile`;
CREATE TABLE `imagefile` (
  `imageid` int(11) NOT NULL,
  `imagets` timestamp NOT NULL DEFAULT current_timestamp(),
  `imagefolderid` int(11) DEFAULT NULL,
  `imageuserid` int(11) DEFAULT NULL,
  `imagesha1` varchar(250) DEFAULT NULL,
  `imagefilename` varchar(250) DEFAULT NULL,
  `imagefilenamedisk` varchar(250) DEFAULT NULL,
  `imageformat` varchar(250) DEFAULT NULL,
  `imagedatetime` datetime DEFAULT NULL,
  `imagefiledatetime` datetime DEFAULT NULL,
  `imageheight` int(11) DEFAULT NULL,
  `imagewidth` int(11) DEFAULT NULL,
  `imagemetaiso` varchar(250) DEFAULT NULL,
  `imagemetamake` varchar(250) DEFAULT NULL,
  `imagemetamodel` varchar(250) DEFAULT NULL,
  `imagemetasoftware` varchar(250) DEFAULT NULL,
  `imagemetadatetime` varchar(250) DEFAULT NULL,
  `imagemetafnumber` varchar(250) DEFAULT NULL,
  `imagemetadatetimeoriginal` varchar(250) DEFAULT NULL,
  `imagemetajson` text DEFAULT NULL,
  `imagewiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagefolder`
--

DROP TABLE IF EXISTS `imagefolder`;
CREATE TABLE `imagefolder` (
  `folderid` int(11) NOT NULL,
  `foldersubid` int(11) DEFAULT NULL,
  `folderuserid` int(11) DEFAULT NULL,
  `foldername` varchar(250) DEFAULT NULL,
  `foldernamedisk` varchar(250) DEFAULT NULL,
  `folderwiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagehashtag`
--

DROP TABLE IF EXISTS `imagehashtag`;
CREATE TABLE `imagehashtag` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `imageid` int(11) DEFAULT NULL,
  `hashtagid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagelocation`
--

DROP TABLE IF EXISTS `imagelocation`;
CREATE TABLE `imagelocation` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `imageid` int(11) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imageuser`
--

DROP TABLE IF EXISTS `imageuser`;
CREATE TABLE `imageuser` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `imageid` int(11) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `systemfolders`
--

DROP TABLE IF EXISTS `systemfolders`;
CREATE TABLE `systemfolders` (
  `sysfolderid` int(11) NOT NULL,
  `sysfolderdescription` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userid` int(11) NOT NULL,
  `username` varchar(250) DEFAULT NULL,
  `password` varchar(250) DEFAULT NULL,
  `email` varchar(250) DEFAULT NULL,
  `wiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `codeimagehashtag`
--
ALTER TABLE `codeimagehashtag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`,`hashtag`);

--
-- Indexes for table `codeimagelocation`
--
ALTER TABLE `codeimagelocation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`,`location`);

--
-- Indexes for table `codeimageuser`
--
ALTER TABLE `codeimageuser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`,`user`);

--
-- Indexes for table `filesencrypted`
--
ALTER TABLE `filesencrypted`
  ADD PRIMARY KEY (`fileid`),
  ADD KEY `fileidref` (`fileidref`),
  ADD KEY `folderid` (`folderid`),
  ADD KEY `userid` (`userid`),
  ADD KEY `wiped` (`wiped`),
  ADD KEY `filesha1` (`filesha1`);

--
-- Indexes for table `foldersencrypted`
--
ALTER TABLE `foldersencrypted`
  ADD PRIMARY KEY (`folderid`),
  ADD KEY `foldersysid` (`foldersysid`),
  ADD KEY `foldersubid` (`foldersubid`),
  ADD KEY `folderuserid` (`folderuserid`),
  ADD KEY `folderwiped` (`folderwiped`);

--
-- Indexes for table `imagefile`
--
ALTER TABLE `imagefile`
  ADD PRIMARY KEY (`imageid`),
  ADD UNIQUE KEY `imagesha1_2` (`imagesha1`),
  ADD KEY `imagewiped` (`imagewiped`),
  ADD KEY `imagefolderid` (`imagefolderid`),
  ADD KEY `imageuserid` (`imageuserid`),
  ADD KEY `imagesha1` (`imagesha1`);

--
-- Indexes for table `imagefolder`
--
ALTER TABLE `imagefolder`
  ADD PRIMARY KEY (`folderid`),
  ADD KEY `folderwiped` (`folderwiped`),
  ADD KEY `foldersubid` (`foldersubid`),
  ADD KEY `folderuserid` (`folderuserid`);

--
-- Indexes for table `imagehashtag`
--
ALTER TABLE `imagehashtag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `imageid` (`imageid`,`hashtagid`),
  ADD KEY `uid` (`uid`),
  ADD KEY `imagehashtagid` (`hashtagid`);

--
-- Indexes for table `imagelocation`
--
ALTER TABLE `imagelocation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `imageid` (`imageid`,`locationid`),
  ADD KEY `uid` (`uid`),
  ADD KEY `imagelocationlocationid` (`locationid`);

--
-- Indexes for table `imageuser`
--
ALTER TABLE `imageuser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `imageid` (`imageid`,`userid`),
  ADD KEY `imageuseruid` (`uid`),
  ADD KEY `imageuseruserid` (`userid`);

--
-- Indexes for table `systemfolders`
--
ALTER TABLE `systemfolders`
  ADD PRIMARY KEY (`sysfolderid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userid`),
  ADD KEY `wiped` (`wiped`),
  ADD KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `codeimagehashtag`
--
ALTER TABLE `codeimagehashtag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `codeimagelocation`
--
ALTER TABLE `codeimagelocation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `codeimageuser`
--
ALTER TABLE `codeimageuser`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `filesencrypted`
--
ALTER TABLE `filesencrypted`
  MODIFY `fileid` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `foldersencrypted`
--
ALTER TABLE `foldersencrypted`
  MODIFY `folderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagefile`
--
ALTER TABLE `imagefile`
  MODIFY `imageid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagefolder`
--
ALTER TABLE `imagefolder`
  MODIFY `folderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagehashtag`
--
ALTER TABLE `imagehashtag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagelocation`
--
ALTER TABLE `imagelocation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imageuser`
--
ALTER TABLE `imageuser`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemfolders`
--
ALTER TABLE `systemfolders`
  MODIFY `sysfolderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userid` int(11) NOT NULL AUTO_INCREMENT;

--
-- Begrensninger for dumpede tabeller
--

--
-- Begrensninger for tabell `codeimagehashtag`
--
ALTER TABLE `codeimagehashtag`
  ADD CONSTRAINT `codeimagehashtaguid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `codeimagelocation`
--
ALTER TABLE `codeimagelocation`
  ADD CONSTRAINT `codeimagelocationuid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `codeimageuser`
--
ALTER TABLE `codeimageuser`
  ADD CONSTRAINT `codeimageuseruid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `imagefile`
--
ALTER TABLE `imagefile`
  ADD CONSTRAINT `imagefolder` FOREIGN KEY (`imagefolderid`) REFERENCES `imagefolder` (`folderid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imageuid` FOREIGN KEY (`imageuserid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `imagefolder`
--
ALTER TABLE `imagefolder`
  ADD CONSTRAINT `imagefolderuid` FOREIGN KEY (`folderuserid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `imagehashtag`
--
ALTER TABLE `imagehashtag`
  ADD CONSTRAINT `imagehashimageid` FOREIGN KEY (`imageid`) REFERENCES `imagefile` (`imageid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imagehashtagid` FOREIGN KEY (`hashtagid`) REFERENCES `codeimagehashtag` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imagehashtaguid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `imagelocation`
--
ALTER TABLE `imagelocation`
  ADD CONSTRAINT `imagelocationimageid` FOREIGN KEY (`imageid`) REFERENCES `imagefile` (`imageid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imagelocationlocationid` FOREIGN KEY (`locationid`) REFERENCES `codeimagelocation` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imagelocationuid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Begrensninger for tabell `imageuser`
--
ALTER TABLE `imageuser`
  ADD CONSTRAINT `imageuserimageid` FOREIGN KEY (`imageid`) REFERENCES `imagefile` (`imageid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imageuseruid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `imageuseruserid` FOREIGN KEY (`userid`) REFERENCES `codeimageuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;