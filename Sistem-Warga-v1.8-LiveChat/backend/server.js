const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const api = require("./routes/api");

const app = express();
app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use("/api", api);
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Sistem Warga berjalan di http://localhost:${port}`));