import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { CategorySchema } from './src/categories/schemas/category.schema';
import { AuthorSchema } from './src/quotes/schemas/author.schema';
import { QuoteSchema } from './src/quotes/schemas/quote.schema';

// Cargamos las variables de entorno para sacar la URL de Mongo
dotenv.config();

// 🔥 DATA MAESTRA: 50 Frases por categoría estructuradas y 100% en ESPAÑOL
const SEED_DATA = [
  {
    category: { name: 'Rock', slug: 'rock', requiresPremium: false },
    authors: [
      {
        name: 'Charly García',
        quotes: [
          'La vanguardia es así.',
          'Say no more.',
          'Los dinosaurios van a desaparecer.',
          'El amor te hace estúpido.',
          'La mediocridad para algunos es normal.',
        ],
      },
      {
        name: 'Gustavo Cerati',
        quotes: [
          'Poder decir adiós es crecer.',
          'Siempre es hoy.',
          'Mereces lo que sueñas.',
          'Despiértame cuando pase el temblor.',
          'Usa el amor como un puente.',
        ],
      },
      {
        name: 'Indio Solari',
        quotes: [
          'El lujo es vulgaridad.',
          'Violencia es mentir.',
          'Vivir solo cuesta vida.',
          'Nuestro amo juega al esclavo.',
          'Fuego, mucho fuego.',
        ],
      },
      {
        name: 'Luis Alberto Spinetta',
        quotes: [
          'Mañana es mejor.',
          'No me dejes que me caiga.',
          'Tengo que aprender a volar.',
          'Todo dura un instante para toda la vida.',
          'Aunque me fuercen yo nunca voy a decir.',
        ],
      },
      {
        name: 'Andrés Calamaro',
        quotes: [
          'Flaca, no me claves tus puñales.',
          'No se puede vivir del amor.',
          'Voy a escribir un guion para mi propia vida.',
          'Te quiero igual.',
          'Hace calor, hace calor.',
        ],
      },
      {
        name: 'Pappo',
        quotes: [
          'El rock es una forma de vida.',
          'Nadie se atreva a tocar a mi vieja.',
          'Juntos a la par.',
          'Que sea rock.',
          'Buscando un amor.',
        ],
      },
      {
        name: 'Freddie Mercury',
        quotes: [
          'No seré una estrella de rock. Seré una leyenda.',
          'El show debe continuar.',
          'Quiero ser libre.',
          'Somos los campeones, mis amigos.',
          'Soy un romántico, pero construyo una barrera a mi alrededor.',
        ],
      },
      {
        name: 'John Lennon',
        quotes: [
          'La vida es eso que te pasa mientras estás ocupado haciendo otros planes.',
          'Imagina a toda la gente viviendo la vida en paz.',
          'Todo lo que necesitas es amor.',
          'La realidad deja mucho a la imaginación.',
          'Un sueño que sueñas solo, es solo un sueño.',
        ],
      },
      {
        name: 'Kurt Cobain',
        quotes: [
          'Ven tal como eres, como eras.',
          'Es mejor arder que apagarse lentamente.',
          'Prefiero ser odiado por lo que soy, que amado por lo que no soy.',
          'Nadie muere virgen, la vida nos jode a todos.',
          'Que seas paranoico no significa que no te estén persiguiendo.',
        ],
      },
      {
        name: 'Mick Jagger',
        quotes: [
          'No siempre puedes conseguir lo que quieres.',
          'Sé que es solo rock and roll, pero me gusta.',
          'Ni los caballos salvajes podrían arrastrarme lejos de ti.',
          'Píntalo de negro.',
          'El tiempo está de mi lado.',
        ],
      },
    ],
  },
  {
    category: { name: 'Cine', slug: 'cine', requiresPremium: false },
    authors: [
      {
        name: 'Darth Vader',
        quotes: [
          'Yo soy tu padre.',
          'Encuentro tu falta de fe perturbadora.',
          'La fuerza es intensa en este.',
          'No conoces el poder del lado oscuro.',
          'Nada de desintegraciones.',
        ],
      },
      {
        name: 'Vito Corleone',
        quotes: [
          'Le haré una oferta que no podrá rechazar.',
          'Un hombre que no pasa tiempo con su familia nunca puede ser un hombre de verdad.',
          'Miren cómo masacraron a mi muchacho.',
          'Las mujeres y los niños pueden ser descuidados, pero los hombres no.',
          'Nunca quise esto para ti, Michael.',
        ],
      },
      {
        name: 'Terminator',
        quotes: [
          'Volveré.',
          'Hasta la vista, baby.',
          'Ven conmigo si quieres vivir.',
          'Necesito tu ropa, tus botas y tu motocicleta.',
          'Está en su naturaleza destruirse a sí mismos.',
        ],
      },
      {
        name: 'Forrest Gump',
        quotes: [
          'Mi mamá siempre decía que la vida es como una caja de chocolates.',
          'Tonto es el que hace tonterías.',
          '¡Corre, Forrest, corre!',
          'No soy un hombre inteligente, pero sé lo que es el amor.',
          'Y eso es todo lo que tengo que decir sobre eso.',
        ],
      },
      {
        name: 'Tyler Durden',
        quotes: [
          'La primera regla del Club de la Pelea es: nadie habla sobre el Club de la Pelea.',
          'Las cosas que posees terminan poseyéndote.',
          'Solo cuando perdemos todo, somos libres para hacer cualquier cosa.',
          'Somos una generación de hombres criados por mujeres.',
          'Esta es tu vida y se acaba un minuto a la vez.',
        ],
      },
      {
        name: 'Travis Bickle',
        quotes: [
          '¿Me estás hablando a mí?',
          'Algún día llegará una verdadera lluvia que limpiará toda esta escoria de las calles.',
          'Soy el hombre solitario de Dios.',
          'Tengo algunas malas ideas en mi cabeza.',
          'Aquí hay un hombre que ya no soportaría más.',
        ],
      },
      {
        name: 'Indiana Jones',
        quotes: [
          'No son los años, cariño. Es el kilometraje.',
          'Serpientes. ¿Por qué tenían que ser serpientes?',
          '¡Eso pertenece a un museo!',
          'La "X" nunca, jamás, marca el lugar.',
          'Confía en mí.',
        ],
      },
      {
        name: 'Rocky Balboa',
        quotes: [
          'No se trata de qué tan fuerte golpeas, sino de cuánto puedes resistir.',
          'Todo campeón fue una vez un contendiente que se negó a rendirse.',
          'Si yo puedo cambiar, y tú puedes cambiar, ¡todo el mundo puede cambiar!',
          'Nadie le debe nada a nadie.',
          'Sigue avanzando.',
        ],
      },
      {
        name: 'Dr. Emmett Brown',
        quotes: [
          '¡Santo cielo!',
          '¿Caminos? A donde vamos, no necesitamos caminos.',
          '¡1.21 Gigavatios!',
          'Tu futuro es lo que tú hagas de él.',
          'Si mis cálculos son correctos...',
        ],
      },
      {
        name: 'Hannibal Lecter',
        quotes: [
          'Un encuestador intentó ponerme a prueba. Me comí su hígado con habas y un buen Chianti.',
          'Hola, Clarice.',
          'Quid pro quo.',
          '¿Han dejado de chillar los corderos?',
          'Empezamos codiciando lo que vemos cada día.',
        ],
      },
    ],
  },
  {
    category: {
      name: 'Leyendas del Fútbol',
      slug: 'futbol',
      requiresPremium: true,
    },
    authors: [
      {
        name: 'Marcelo Gallardo',
        quotes: [
          'Que la gente crea, porque tiene con qué creer.',
          'Cierren los ojos, e imagínense si la perdíamos.',
          'Nada más que esto, no hay nada más.',
          'El que no cree, que no venga.',
          'Napoleón no soy, soy Marcelo.',
        ],
      },
      {
        name: 'Ángel Labruna',
        quotes: [
          'No me importa si ganamos o perdemos, me importa River.',
          'Yo a Boca no lo odio, lo compadezco.',
          'La banda roja es un sentimiento.',
          'Si dirijo a Boca, me voy al descenso.',
          'River es noticia siempre.',
        ],
      },
      {
        name: 'Ramón Díaz',
        quotes: [
          'Je, y... es para la gente de Boca que lo mira por TV.',
          'Yo no me fui al descenso.',
          'Los bosteros están nerviosos.',
          '¿Vieron qué lindo es jugar en el Monumental?',
          'A River lo llevo en el corazón.',
        ],
      },
      {
        name: 'Enzo Francescoli',
        quotes: [
          'La camiseta de River te exige ganar.',
          'Jugar en el Monumental lleno no tiene comparación.',
          'Siempre traté de jugar al fútbol con alegría.',
          'El fútbol es el deporte más hermoso.',
          'River es mi casa.',
        ],
      },
      {
        name: 'Diego Maradona',
        quotes: [
          'La pelota no se mancha.',
          'Me cortaron las piernas.',
          'Seguís siendo el rey de la chanchería.',
          'Lástima a nadie.',
          'El gol a los ingleses lo hizo la mano de Dios.',
        ],
      },
      {
        name: 'Lionel Messi',
        quotes: [
          'Andá pa allá, bobo.',
          'Ya está, se terminó.',
          'Este equipo no los va a dejar tirados.',
          'Prefiero ganar títulos con el equipo antes que premios individuales.',
          'Fue el partido más sufrido que me tocó jugar.',
        ],
      },
      {
        name: 'Emiliano "Dibu" Martínez',
        quotes: [
          'Mirá que te como, hermano.',
          'Le hice upa.',
          'No me temblaron las piernas.',
          'Es un sueño cumplido.',
          'Yo sé que me gustan los penales.',
        ],
      },
      {
        name: 'Juan Román Riquelme',
        quotes: [
          "Estoy feli'.",
          'La pelota me la dio mi mamá.',
          'En la Bombonera la cancha se mueve.',
          'El hincha de Boca está loco.',
          'Seremos menos malos que los demás.',
        ],
      },
      {
        name: 'Carlos Bilardo',
        quotes: [
          'Al enemigo, ni agua.',
          'Pisalo, pisalo.',
          'El fútbol es ganar y nada más.',
          'Los de colorado son los nuestros.',
          'Muchachos, no se la den a los de amarillo.',
        ],
      },
      {
        name: 'Pep Guardiola',
        quotes: [
          'El fútbol es un juego de engaños.',
          'No hay nada más arriesgado que no arriesgar.',
          'El secreto es tener el balón.',
          'Messi es el mejor de la historia.',
          'Yo perdono que no acierten, pero no perdono que no se esfuercen.',
        ],
      },
    ],
  },
  {
    category: {
      name: 'Series de Tv',
      slug: 'series-de-tv',
      requiresPremium: true,
    },
    authors: [
      {
        name: 'Walter White',
        quotes: [
          'Yo soy el que llama a la puerta.',
          'Di mi nombre.',
          'Estoy en el negocio de los imperios.',
          'Anda con cuidado.',
          'Terminamos cuando yo digo que terminamos.',
        ],
      },
      {
        name: 'Michael Scott',
        quotes: [
          'Eso dijo ella.',
          'Yo soy Beyoncé, siempre.',
          'No soy supersticioso, pero soy un poco "sticioso".',
          '¿Prefiero que me teman o que me amen? Fácil. Ambas.',
          'Osos, remolachas, Battlestar Galactica.',
        ],
      },
      {
        name: 'Dr. Gregory House',
        quotes: [
          'Todo el mundo miente.',
          'Nunca es lupus.',
          'Si puedes fingir sinceridad, puedes fingir cualquier cosa.',
          'Lo normal está sobrevalorado.',
          'Los pacientes son idiotas.',
        ],
      },
      {
        name: 'Sherlock Holmes',
        quotes: [
          'El juego ha comenzado.',
          'No soy un psicópata, soy un sociópata altamente funcional.',
          'La inteligencia es el nuevo concepto de sexy.',
          'Anderson, no hables en voz alta. Bajas el coeficiente intelectual de toda la calle.',
          'El sentimentalismo es un defecto químico que se encuentra en el bando perdedor.',
        ],
      },
      {
        name: 'Daenerys Targaryen',
        quotes: [
          'Dracarys.',
          'No voy a detener la rueda, voy a romper la rueda.',
          'Tomaré lo que es mío con fuego y sangre.',
          'Un dragón no es un esclavo.',
          'Soy la madre de dragones.',
        ],
      },
      {
        name: 'Tony Soprano',
        quotes: [
          'Aquellos que quieren respeto, dan respeto.',
          'Una mala decisión es mejor que la indecisión.',
          'Eres tan bueno como tu último sobre.',
          'Incluso un reloj roto tiene razón dos veces al día.',
          'No existe la mafia.',
        ],
      },
      {
        name: 'Saul Goodman',
        quotes: [
          '¡Todo está bien, viejo!',
          'Los abogados somos como el seguro médico.',
          'No soy un abogado criminalista, soy un abogado criminal.',
          'La perfección es el enemigo de lo perfectamente adecuado.',
          'Vayamos al grano.',
        ],
      },
      {
        name: 'Dexter Morgan',
        quotes: [
          'Esta es la noche.',
          'Me encanta Halloween. Es la única época del año en que todos usan máscara, no solo yo.',
          'La sangre nunca miente.',
          'Los monstruos no consiguen vivir felices para siempre.',
          'Soy un monstruo muy ordenado.',
        ],
      },
      {
        name: 'Homero Simpson',
        quotes: [
          "¡D'oh!",
          'A la grande le puse Cuca.',
          'Marge, no voy a mentirte.',
          'Hable más fuerte que tengo una toalla.',
          'Cama arriba, cama abajo.',
        ],
      },
      {
        name: 'Tyrion Lannister',
        quotes: [
          'Bebo y sé cosas.',
          'Nunca olvides lo que eres.',
          'Un Lannister siempre paga sus deudas.',
          'La muerte es muy definitiva, mientras que la vida está llena de posibilidades.',
          'No es fácil estar borracho todo el tiempo.',
        ],
      },
    ],
  },
];

async function runSeed() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/quiendijoque';

  console.log('🔌 Conectando a la base de datos...');
  const connection = await mongoose.connect(mongoUri);
  console.log('✅ Conectado.');

  const Category = mongoose.model('Category', CategorySchema);
  const Author = mongoose.model('Author', AuthorSchema);
  const Quote = mongoose.model('Quote', QuoteSchema);

  console.log('🧹 Limpiando colecciones anteriores...');
  await Category.deleteMany({});
  await Author.deleteMany({});
  await Quote.deleteMany({});

  console.log(
    '🌱 Sembrando Categorías, Autores y 200 Frases 100% en español...',
  );

  // 🔥 Lógica de doble bucle: Recorremos la Data Maestra e insertamos todo automáticamente
  for (const catData of SEED_DATA) {
    const cat = await Category.create(catData.category);

    for (const authorData of catData.authors) {
      const author = await Author.create({ name: authorData.name });

      const quotesToInsert = authorData.quotes.map((text) => ({
        text,
        authorId: author._id,
        categoryId: cat._id,
      }));

      await Quote.insertMany(quotesToInsert);
    }
  }

  console.log('✨ ¡Seed de 200 frases en español completado con éxito!');
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Error corriendo el seed:', err);
  process.exit(1);
});
