import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import { validateMovie } from './schema/movies.js'
import { validatePartialMovie } from './schema/movies.js'
import movies from './movies.json' assert { type: 'json' }

const app = express()
app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPT_ORIGIN = [
      'http://localhost:1234',
      'http://localhost:3000',
      'http://localhost:4200',
      'http://localhost:8080',
    ];

    callback(null, ACCEPT_ORIGIN.includes(origin) || !origin);
  },
}));

app.disable('x-powered-by')


/* Esta ruta devuelve una lista de películas. Se puede filtrar por género.
 * Se puede hacer una solicitud GET a la ruta '/movies?genre=<genre>', donde <genre> es el género de la película.
 * Ejemplo: http://localhost:1234/movies?genre=drama devuelve todas las películas de genre drama.
 */
app.get('/movies', (req, res) => {
    /*
    const origin = req.header('Origin')
    if (ACCEPT_ORIGIN.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin) // Permite peticiones desde cualquier lugar
    }
    */

  const { genre } = req.query
  const moviesByGenre = genre
    ? movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    : movies
  res.json(moviesByGenre)
})

/* Esta ruta devuelve una película por su id. Se puede hacer una solicitud GET a la ruta '/movies/<id>', donde <id> es el id de la película.
 * Ejemplo: http://localhost:1234/movies/2 devuelve la película con id 2.
 */
app.get('/movies/:id', (req, res) => {
  const id = req.params.id
  const movieById = movies.find(movie => movie.id === id)
  if (!movieById) return res.status(404).json({ error: 'Película no encontrada' })
  res.json(movieById)
})

/* Esta ruta crea una nueva película a partir de los datos enviados en el body de la solicitud.
 * Se puede hacer una solicitud POST a la ruta '/movies'. La película debe cumplir con el schema de movies.js.
 */
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error){
    return res.status(400).json({ error: JSON.parse(result.error.message )})
  } 

  const newMovie = { id: crypto.randomUUID(), ...result.data }

  movies.push(newMovie)
  res.status(201).json(newMovie)

})

// Esta ruta actualiza una película por su id. Se puede hacer una solicitud PATCH a la ruta '/movies/<id>', donde <id> es el id de la película.
// Los datos enviados en el body de la solicitud deben cumplir con el schema de partialMovie.js.
// Los datos enviados en el body de la solicitud se van a combinar con los datos actuales de la película.
// Ejemplo: http://localhost:1234/movies/2 PATCH { 'director': 'Joaquim Dos Santos' } actualizará la película con id 2 y cambiara su director.
app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex < 0) return res.status(404).json({ error: 'Película no encontrada' })

    const updatedMovie = { ...movies[movieIndex], ...result.data }
    movies[movieIndex] = updatedMovie
    return res.json(updatedMovie)
    
})
app.delete('/movies/:id', (req, res) => {
  /*
    const origin = req.header('Origin')
    if (ACCEPT_ORIGIN.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin) // Permite peticiones desde cualquier lugar
    }
  */  
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex < 0) return res.status(404).json({ error: 'Película no encontrada' })

    movies.splice(movieIndex, 1)
    return res.json({ success: true })
})

/*
app.options('/movies/:id', (req, res) => {
  const origin = req.header('Origin')
  if (ACCEPT_ORIGIN.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin) // Permite peticiones desde cualquier lugar
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.end()
})
*/

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`)
})

