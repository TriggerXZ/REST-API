import { z } from 'zod'
/*
Este archivo define el esquema de los datos de una película
y exporta dos funciones para validar objetos contra ese esquema.

La función validateMovie se utiliza para validar un objeto completo
contra el esquema, y devuelve un resultado seguro.

La función validatePartialMovie se utiliza para validar un objeto
parcial (donde algunas propiedades del esquema son opcionales),
y también devuelve un resultado seguro.
*/
const movieSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().positive(),
  poster: z.string().url(),
  genre: z.array(z.enum([
    'Action',
    'Drama',
    'Comedy',
    'Horror',
    'Romance',
    'Animation',
    'Sci-Fi',
    'Adventure',
    'Biography',
    'Crime',
    'Mystery',
    'Thriller',
    'Fantasy'
  ]))
    .nonempty('Genre is required'),
  rate: z.number().min(0).max(10)
})

export function validateMovie (object) {
  return movieSchema.safeParse(object)
}

export function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}
