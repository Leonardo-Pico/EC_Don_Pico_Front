import cors from "cors";

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://ec-don-pico-front.vercel.app"
    ],
    credentials: true
}));