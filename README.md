# 💡 Project UTS Internet of Things (IoT)

## 👩‍💻 Tentang Saya
**Nama:** Nadiya Febi Herliani  
**NRP:** 152023045  

---

## Deskripsi Proyek
Database ini digunakan untuk menyimpan hasil pembacaan sensor IoT, seperti **suhu**, **kelembapan**, dan **intensitas cahaya (lux)**.  
Semua data disimpan dalam tabel bernama `data_sensor` yang akan merekam informasi sensor beserta waktu pencatatannya.

---

## 🗄️ Struktur Database (SQL)

```sql
CREATE DATABASE IF NOT EXISTS `iotdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `iotdb`;

-- Dumping structure for table iotdb.data_sensor
CREATE TABLE IF NOT EXISTS `data_sensor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `suhu` float DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `lux` int DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
