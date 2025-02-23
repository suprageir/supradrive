-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: 23. Feb, 2025 15:26 PM
-- Tjener-versjon: 10.6.18-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.20

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
-- Tabellstruktur for tabell `filesimages`
--

DROP TABLE IF EXISTS `filesimages`;
CREATE TABLE `filesimages` (
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
-- Tabellstruktur for tabell `foldersimages`
--

DROP TABLE IF EXISTS `foldersimages`;
CREATE TABLE `foldersimages` (
  `folderid` int(11) NOT NULL,
  `foldersubid` int(11) DEFAULT NULL,
  `folderuserid` int(11) DEFAULT NULL,
  `foldername` varchar(250) DEFAULT NULL,
  `foldernamedisk` varchar(250) DEFAULT NULL,
  `folderwiped` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imageslocations`
--

DROP TABLE IF EXISTS `imageslocations`;
CREATE TABLE `imageslocations` (
  `ilid` int(11) NOT NULL,
  `iluserid` int(11) DEFAULT NULL,
  `ilimageid` int(11) DEFAULT NULL,
  `iltlid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagestags`
--

DROP TABLE IF EXISTS `imagestags`;
CREATE TABLE `imagestags` (
  `itid` int(11) NOT NULL,
  `userid` int(11) DEFAULT NULL,
  `imageid` int(11) DEFAULT NULL,
  `tagid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `imagesusers`
--

DROP TABLE IF EXISTS `imagesusers`;
CREATE TABLE `imagesusers` (
  `iuid` int(11) NOT NULL,
  `iuserid` int(11) DEFAULT NULL,
  `tagimageid` int(11) DEFAULT NULL,
  `taguserid` int(11) DEFAULT NULL
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
-- Tabellstruktur for tabell `tagsimages`
--

DROP TABLE IF EXISTS `tagsimages`;
CREATE TABLE `tagsimages` (
  `tiid` int(11) NOT NULL,
  `tiuserid` int(11) DEFAULT NULL,
  `tiname` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `tagslocations`
--

DROP TABLE IF EXISTS `tagslocations`;
CREATE TABLE `tagslocations` (
  `tlid` int(11) NOT NULL,
  `tluserid` int(11) DEFAULT NULL,
  `tlname` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `tagsusers`
--

DROP TABLE IF EXISTS `tagsusers`;
CREATE TABLE `tagsusers` (
  `tuid` int(11) NOT NULL,
  `tuuserid` int(11) DEFAULT NULL,
  `tuname` varchar(250) DEFAULT NULL
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
-- Indexes for table `filesimages`
--
ALTER TABLE `filesimages`
  ADD PRIMARY KEY (`imageid`),
  ADD KEY `imagewiped` (`imagewiped`),
  ADD KEY `imagefolderid` (`imagefolderid`),
  ADD KEY `imageuserid` (`imageuserid`),
  ADD KEY `imagesha1` (`imagesha1`);

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
-- Indexes for table `foldersimages`
--
ALTER TABLE `foldersimages`
  ADD PRIMARY KEY (`folderid`),
  ADD KEY `folderwiped` (`folderwiped`),
  ADD KEY `foldersubid` (`foldersubid`),
  ADD KEY `folderuserid` (`folderuserid`);

--
-- Indexes for table `imageslocations`
--
ALTER TABLE `imageslocations`
  ADD PRIMARY KEY (`ilid`),
  ADD KEY `iluserid` (`iluserid`),
  ADD KEY `ilimageid` (`ilimageid`),
  ADD KEY `iltlid` (`iltlid`);

--
-- Indexes for table `imagestags`
--
ALTER TABLE `imagestags`
  ADD PRIMARY KEY (`itid`),
  ADD KEY `userid` (`userid`),
  ADD KEY `imageid` (`imageid`),
  ADD KEY `tagid` (`tagid`);

--
-- Indexes for table `imagesusers`
--
ALTER TABLE `imagesusers`
  ADD PRIMARY KEY (`iuid`),
  ADD KEY `iuserid` (`iuserid`),
  ADD KEY `tagimageid` (`tagimageid`),
  ADD KEY `taguserid` (`taguserid`);

--
-- Indexes for table `systemfolders`
--
ALTER TABLE `systemfolders`
  ADD PRIMARY KEY (`sysfolderid`);

--
-- Indexes for table `tagsimages`
--
ALTER TABLE `tagsimages`
  ADD PRIMARY KEY (`tiid`),
  ADD KEY `tiuserid` (`tiuserid`),
  ADD KEY `tiname` (`tiname`);

--
-- Indexes for table `tagslocations`
--
ALTER TABLE `tagslocations`
  ADD PRIMARY KEY (`tlid`),
  ADD KEY `tluserid` (`tluserid`),
  ADD KEY `tlname` (`tlname`);

--
-- Indexes for table `tagsusers`
--
ALTER TABLE `tagsusers`
  ADD PRIMARY KEY (`tuid`),
  ADD KEY `tuuserid` (`tuuserid`),
  ADD KEY `tuname` (`tuname`);

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
-- AUTO_INCREMENT for table `filesencrypted`
--
ALTER TABLE `filesencrypted`
  MODIFY `fileid` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `filesimages`
--
ALTER TABLE `filesimages`
  MODIFY `imageid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `foldersencrypted`
--
ALTER TABLE `foldersencrypted`
  MODIFY `folderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `foldersimages`
--
ALTER TABLE `foldersimages`
  MODIFY `folderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imageslocations`
--
ALTER TABLE `imageslocations`
  MODIFY `ilid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagestags`
--
ALTER TABLE `imagestags`
  MODIFY `itid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagesusers`
--
ALTER TABLE `imagesusers`
  MODIFY `iuid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemfolders`
--
ALTER TABLE `systemfolders`
  MODIFY `sysfolderid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tagsimages`
--
ALTER TABLE `tagsimages`
  MODIFY `tiid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tagslocations`
--
ALTER TABLE `tagslocations`
  MODIFY `tlid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tagsusers`
--
ALTER TABLE `tagsusers`
  MODIFY `tuid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userid` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;