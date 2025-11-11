import express from "express";
import mysql from "mysql2/promise";
import mqtt from "mqtt";
import path from "path";
import { fileURLToPath } from "url";

// Setup direktori __dirname agar bisa digunakan di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware agar JSON bisa dibaca
app.use(express.json());

// 🔹 Serve file HTML dari folder 'public'
app.use(express.static(path.join(__dirname, "public")));

// --- KONEKSI DATABASE ---
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "iotdb"
});
console.log("✅ Terhubung ke database");

// --- KONEKSI KE MQTT BROKER ---
const broker = "mqtt://broker.hivemq.com";
const topicSensor = "esp32/data/sensor";   // topik publish dari ESP32
const topicPompa = "esp32/control/pompa";  // topik kontrol pompa/relay

const client = mqtt.connect(broker);

client.on("connect", () => {
  console.log("✅ Terhubung ke broker MQTT");
  client.subscribe(topicSensor);
});

// --- TERIMA PESAN DARI ESP32 VIA MQTT ---
client.on("message", async (topic, message) => {
  if (topic === topicSensor) {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Data dari ESP32:", data);

      const { suhu, humidity, lux, timestamp } = data;

      await db.query(
        "INSERT INTO data_sensor (suhu, humidity, lux, timestamp) VALUES (?, ?, ?, ?)",
        [suhu, humidity, lux, timestamp]
      );

      console.log("💾 Data disimpan ke database");
    } catch (err) {
      console.error("❌ Error parsing/saving data:", err);
    }
  }
});

// --- API UNTUK MELIHAT DATA SENSOR DALAM FORMAT JSON ---
app.get("/data", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM data_sensor ORDER BY id DESC LIMIT 10");

    if (rows.length === 0) {
      return res.json({ message: "Belum ada data sensor" });
    }

    const suhuMax = Math.max(...rows.map(r => r.suhu));
    const suhuMin = Math.min(...rows.map(r => r.suhu));
    const suhuRata = (
      rows.reduce((acc, r) => acc + r.suhu, 0) / rows.length
    ).toFixed(2);

    res.json({
      suhumax: suhuMax,
      suhumin: suhuMin,
      suhusrata: suhuRata,
      nilai_suhu_max_humid_max: rows
    });
  } catch (err) {
    console.error("❌ Error mengambil data:", err);
    res.status(500).json({ error: "Gagal mengambil data sensor" });
  }
});

// --- API UNTUK MENGIRIM PERINTAH KE RELAY (Pompa) ---
app.get("/pompa/:state", (req, res) => {
  const { state } = req.params;
  if (state === "ON" || state === "OFF") {
    client.publish(topicPompa, state);
    console.log(`💧 Pompa ${state}`);
    res.send(`💧 Pompa ${state}`);
  } else {
    res.status(400).send("Gunakan /pompa/ON atau /pompa/OFF");
  }
});

// --- ROUTE UNTUK MENAMPILKAN HALAMAN DASHBOARD ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- JALANKAN SERVER ---
app.listen(port, () => {
  console.log(`🌐 Server berjalan di http://localhost:${port}`);
});
