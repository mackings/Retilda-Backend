const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const route = require("./routes/routes");

app.use(express.json());
app.use("/",route);

app.get("/", (req,res)=>{
    res.send("Hello Vercel");
});


app.listen(process.env.PORT || 3000, async () => {
    console.log("RUNNING_LOCALS >>>", process.env.PORT || 3000);
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ignoreUndefined: true,
        });
        console.log("DB CONNECTED >>>>");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
});
