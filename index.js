import express from "express";
import { createClient } from "@libsql/client";
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
const port = parseInt(process.env.PORT) || 3000;
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!authToken || !url) {
  throw new Error("TURSO_AUTH_TOKEN and TURSO_DATABASE_URL must be set");
}


const turso = createClient({
  url,
  authToken,
});


const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(express.json());
app.use(cors(corsOptions));


app.get('/', async(req, res) => {
  const ans2 = await turso.execute(`SELECT * FROM contacts`);
    console.log(ans2);
    res.json({ ans2 })
})


app.get("/users", async(req, res) => {
    const ans = await turso.execute(`SELECT * FROM contacts`);
    console.log(ans);
    res.json( ans.rows )
});


app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await turso.execute(`SELECT * FROM contacts WHERE contact_id = ?`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ mensaje: "Error interno al obtener el usuario" });
  }
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

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone } = req.body; 

  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  try {
    const result = await turso.execute(
      `UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE contact_id = ?`,
      [first_name, last_name, email, phone, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({
      mensaje: "Usuario actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({
      mensaje: "Error interno al actualizar el usuario",
    });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
      const result = await turso.execute("DELETE FROM contacts WHERE contact_id = ?", [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({
              mensaje: "Usuario no encontrado"
          });
      }
      res.json({
          mensaje: "Usuario eliminado"
      });
  } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({
          mensaje: "Error interno al eliminar el usuario"
      });
  }
});


// //todo: obtener un usuario por id

// // todo: Actualizar un usuario por id

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

