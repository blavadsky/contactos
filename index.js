import express from "express";
import { createClient } from "@libsql/client";
import cors from 'cors';

const app = express();
const port = parseInt(process.env.PORT) || 4200;

const TURSO_DATABASE_URL="libsql://dbweb-blavadsky.turso.io";
const TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI5Zjc3NTFhNi1jYTZmLTQ2MzItYTgxYS1hZTc0NGNiNmVjYTEiLCJpYXQiOjE3MjkzMDUxNjV9.VotboVZbauNsLgHLyk7OswVjYoVvrgxuUIM2BL6jsVMT7f72AaM7sUlqm6YXbS0-yThNrf6IWwiv_5LMIZovCg"


if (!TURSO_AUTH_TOKEN || !TURSO_DATABASE_URL) {
  throw new Error("TURSO_AUTH_TOKEN and TURSO_DATABASE_URL must be set");
}


const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});


const corsOptions = {
  origin: 'http://localhost:4200/',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(express.json());
app.use(cors(corsOptions));



//const { TURSO_AUTH_TOKEN ="libsql://dbweb-blavadsky.turso.io", TURSO_DATABASE_URL ="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI5Zjc3NTFhNi1jYTZmLTQ2MzItYTgxYS1hZTc0NGNiNmVjYTEiLCJpYXQiOjE3MjkzMDUxNjV9.VotboVZbauNsLgHLyk7OswVjYoVvrgxuUIM2BL6jsVMT7f72AaM7sUlqm6YXbS0-yThNrf6IWwiv_5LMIZovCg" } = process.env;


app.get('/', async(req, res) => {
  const ans2 = await turso.execute(`SELECT * FROM contacts`);
    console.log(ans2);
    res.json({ ans2 })
})


app.get("/users", async(req, res) => {
    //"Select * from users"
    const ans = await turso.execute(`SELECT * FROM contacts`);
    console.log(ans);
    res.json( ans.rows )
});



app.post("/users", async(req, res) => {
  const {first_name, last_name, email, phone} = req.body;

  try {
    const ans = await turso.execute({
      sql: `INSERT INTO contacts ( first_name, last_name, email, phone) VALUES (?, ?, ?, ?)`,
      args: [first_name, last_name, email, phone]
    });
    res.json({
        mensaje: "Usuario creado",
        usuario: ans
    });
    console.log("usuario creado con exito" + ans)
  } catch (error) {
    console.log(error);
    res.status(404).json({
      mensaje: "Error al crear el usuario"
    });
  }
})

app.delete("/users/:id", (req, res) => {
    console.log(req.params.id); 

    // db = db.filter((user) => user.id != req.params.id);

    res.json({
        mensaje: "Usuario eliminado"
    });
});

// //todo: obtener un usuario por id

// // todo: Actualizar un usuario por id

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

