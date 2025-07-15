const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");  // <-- додай це

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/kartky/scan", express.static(path.join(__dirname, "uploads")));

const dataFilePath = path.join(__dirname, "kartky.json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Створити картку з унікальним _id
app.post("/api/kartky", (req, res) => {
  const newCard = req.body;
  newCard._id = uuidv4(); // <-- додай унікальний ідентифікатор

  const cards = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, "utf-8"))
    : [];
  cards.push(newCard);
  fs.writeFileSync(dataFilePath, JSON.stringify(cards, null, 2));
  res.status(201).json(newCard); // <-- повертаємо створену картку з _id
});

// Отримати всі картки
app.get("/api/kartky", (req, res) => {
  const cards = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, "utf-8"))
    : [];
  res.json(cards);
});

// Завантажити сканкопію (прикріпити до картки)
app.post("/api/kartky/:id/scan", upload.single("scan"), (req, res) => {
  const cardId = req.params.id;
  const cards = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, "utf-8"))
    : [];

  const cardIndex = cards.findIndex(c => c._id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: "Картку не знайдено" });
  }

  cards[cardIndex].scanFile = req.file.filename;

  fs.writeFileSync(dataFilePath, JSON.stringify(cards, null, 2));
  res.json(cards[cardIndex]);
});

// Віддаємо сканкопії статично
app.use("/api/kartky/scan", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => console.log(`✅ Server started at http://localhost:${PORT}`));
