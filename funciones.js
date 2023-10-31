// Importación de librerías
const readline = require("readline");
const fs = require("fs");
const crypto = require('crypto');
const https = require('https');


// Función utilizada para obtener el API token del usuario
function obtenerToken(email) {
    return new Promise((resolve, reject) => {
        
        let token = ''; // token inicialmente vacío
        let encontrado = false; // variable para rastrear si se encontró el usuario

        // Defino el lector para leer el archivo línea por línea
        const lector = readline.createInterface({
            input: fs.createReadStream('./users.txt'),
            crlfDelay: Infinity,
        });

        // Función a ejecutar para cada línea del archivo
        lector.on("line", linea => {

            // Transformo la línea de texto del archivo en un JSON
            const user = JSON.parse(linea);

            // Comparo el email de la línea del archivo con el parámetro ingresado
            if (user.email === email) {
                token = user.token; // Defino el token como el token del usuario
                encontrado = true;
                lector.close(); // Detener la lectura una vez que se encuentra el usuario
            }
        });

        // Código a ejecutar cuando el lector se cierra
        lector.on("close", () => {
            if (encontrado) {
                resolve(token); // Si se encontró el usuario, resuelvo la promesa con el token
            } else {
                reject(new Error('El usuario no existe')); // Si no se encontró, rechazo la promesa lanzando un error
            }
        });

        // Si el lector falla por alguna razón, rechazo la promesa y devuelvo el error
        lector.on("error", error => {
            reject(error);
        });
    });
}

// Función para obtener las películas favoritas del usuario seleccionado
function favoritosUsuario(email) {
    return new Promise((resolve, reject) => {
        
        let favoritas = []; // Lista de películas favoritas del usuario
        
        // Defino el lector para leer el archivo linea por linea
        const lector = readline.createInterface({
            input: fs.createReadStream('./favoritos.txt'),
            crlfDelay: Infinity,
        });

        // Función a ejecutar para cada línea del archivo
        lector.on("line", linea => {

            let userFav = JSON.parse(linea); // Transformo la linea de texto del archivo en un JSON
            
            // Entro al condicional si el email pertenece a la entrada del archivo 
            if (userFav.email === email) {
                // Agrego nuevoFav a la lista de favoritos
                favoritas.push(userFav); 
            }
        });

        // Cuando el lector se cierra, resuelvo la promesa devolviendo la lista de películas favoritas del usuario
        lector.on("close", () => {
            resolve(favoritas);
        });

        // En caso de error, rechazo la promesa con el error
        lector.on("error", error => {
            reject(error);
        });
    });
}

// Función utilizada para validar la autenticación del usuario
function validacionToken(email, token) {
    return new Promise((resolve, reject) => {

        let validado = false; // Inicialmente, no se ha autenticado

        // Defino el lector para leer el archivo linea por linea
        const lector = readline.createInterface({
            input: fs.createReadStream('./users.txt'),
            crlfDelay: Infinity,
        });
        
        // Función a ejecutar para cada línea del archivo
        lector.on("line", linea => {

            let user = JSON.parse(linea); // Transformo la linea de texto del archivo en un JSON
            
            // Verifico que el email y el token del usuario coincidan simultaneamente con la linea
            // De ser así, el usuario existe en el sistema
            if (user.email === email && user.token === token) {
                validado = true // El usuario existe en el sistema
                lector.close(); // Detener la lectura una vez que se encuentra el usuario
            }
        });

        // Resuelvo la promesa con el valor de validado
        lector.on("close", () => {
            resolve(validado)
        });

        // En caso de error, rechazo la promesa con el error
        lector.on("error", error => {
            reject(error);
        });
    });
}

// Función para buscar las películas por keyword en TMDB
function tmdbSearch(apiKey, keyword) {
    return new Promise((resolve, reject) => {

        // Codifico la keyword de busqueda a formato de url
        const encodedKeyword = encodeURIComponent(keyword);
  
        // Realizo la consulta https search a la API de TMDB con la keyword especificada
        https.get(`https://api.themoviedb.org/3/search/movie?query=${encodedKeyword}&api_key=${apiKey}`, (tmdbRes) => {

            // Si la consulta no es exitosa, Rechazo la promesa
            if (tmdbRes.statusCode !== 200) {
                reject(new Error(`Error: ${tmdbRes.statusCode}`));
                return;
            }
    
            let data = [];  // Lista donde acumular los chunks de datos
            
            // Acumulación de chunks de datos
            tmdbRes.on('data', (chunk) => {
            data.push(chunk);
            });
    
            tmdbRes.on('end', () => {
                // Resuelvo la promesa con la lista de películas obtenidas
                const responseJSON = JSON.parse(Buffer.concat(data).toString());
                resolve(responseJSON.results);
            });
        }).on('error', (err) => {
            // Si ocurre un error, rechazo la promesa con el error
            reject(err);
        });
    });
  }

// Función para buscar las películas de la sección discover en TMDB
function tmdbDiscover(apiKey) {
    return new Promise((resolve, reject) => {

        // Realizo la consulta https discover a la API de TMDB
        https.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`, (tmdbRes) => {
            
            // Si la consulta no es exitosa, Rechazo la promesa
            if (tmdbRes.statusCode !== 200) {
                reject(new Error(`Error: ${tmdbRes.statusCode}`));
                return;
            }
    
            let data = [];  // Lista donde acumular los chunks de datos
            
            // Acumulación de chunks de datos
            tmdbRes.on('data', (chunk) => {
            data.push(chunk);
            });

            tmdbRes.on('end', () => {
                // Resuelvo la promesa con la lista de películas obtenidas
                const responseJSON = JSON.parse(Buffer.concat(data).toString());
                resolve(responseJSON.results);
            });
        }).on('error', (err) => {
            // Si ocurre un error, rechazo la promesa con el error
            reject(err);
        });
    });
}

// Función para buscar una película por id en TMDB
function tmdbFind(apiKey, movieId) {
    return new Promise((resolve, reject) => {
        
        // Realizo la consulta https find a la API de TMDB con el id de la película buscada
        https.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`, (tmdbRes) => {
            
            // Si la consulta no es exitosa, Rechazo la promesa
            if (tmdbRes.statusCode !== 200) {
                reject(new Error(`Error: ${tmdbRes.statusCode}`));
                return;
            }
    
            let data = [];  // Lista donde acumular los chunks de datos
            
            // Acumulación de chunks de datos
            tmdbRes.on('data', (chunk) => {
            data.push(chunk);
            });

            tmdbRes.on('end', () => {
                // Resuelvo la promesa con la película obtenida
                const responseJSON = JSON.parse(Buffer.concat(data).toString());
                resolve(responseJSON);
            });
        }).on('error', (err) => {
            // Si ocurre un error, rechazo la promesa con el error
            reject(err);
        });
    });
}

// Función para registrar un nuevo usuario
function registrar(email, firstName, lastName, password) {
    return new Promise((resolve, reject) => {
        
        // Hasheo de contraseña con SHA256 y creación de token de autenticación de usuario
        const hashHex = crypto.createHash('sha256').update(password).digest('hex');
        const token = crypto.randomBytes(32).toString('hex');

        // Creación del JSON con información del usuario a guardar en users.txt
        var nuevo = {
            email : email,
            firstName : firstName,
            lastName : lastName,
            password : hashHex,
            token : token
        };
        
        // Defino el lector para leer el archivo linea por linea
        // Utilizado para saber si el usuario ya existe en el sistema
        const lector = readline.createInterface({
            input: fs.createReadStream('./users.txt'),
            crlfDelay: Infinity
        });

        let aux = true; // Supongo que no existe el email en el archivo

        // Función a ejecutar para cada línea del archivo
        lector.on("line", (linea) => {

            // Transformo la linea de texto del archivo en un JSON
            const user = JSON.parse(linea);

            // Comparo el email de la linea del archivo con parámetro ingresado
            // Si el email ingresado está en el archivo, entro al condicional
            if (user.email === email) {
                aux = false;    // El email ya existe
                lector.close(); // Detener la lectura una vez que se encuentra el usuario
            }
        });

        // Código a ejecutar cuando el lector se cierra
        lector.on("close", () => {

            // Reviso si el usuario ya existe en el archivo previo a agregarlo
            // aux = true implica que el usuario no está registrado
            if (aux) {

                // Agrego el nuevo usuario al archivo users.txt
                fs.appendFile('./users.txt', `${JSON.stringify(nuevo)}\n`, { encoding: 'utf8', flag: 'a' }, (error) => {
                    if (error) throw error;
                    console.log('Nueva línea añadida correctamente');
                });
                resolve('Usuario creado')
            } else {
                reject(new Error("Usuario ya registrado"))
            }
        });

        // Si el lector falla por alguna razón, rechazo la promesa y devuelvo el error
        lector.on("error", error => {
            reject(error);
        });
    });
}

// Función utilizada para obtener las películas favoritas de un usuario autenticado
async function obtenerFavoritos(email, token) {

    // Valido que el token corresponda al usuario
    const token_valido = await validacionToken(email, token);
    
    // De corresponderse, devuelvo las películas favoritas del usuario
    // De lo contrario, retorno error
    if (token_valido) {

        // En favoritas guardo la lista de películas favoritas del usuario
        var favoritas = await favoritosUsuario(email);
        
        // Modifico los elementos de favoritas agregando el campo suggestionForTodayScore a cada elemento
        // suggestionForTodayScore es un número real aleatorio entre 0 y 99 
        // Finalmente, ordeno la lista por suggestionForTodayScore de forma decreciente y retorno
        return favoritas.map( fav => {
            return { ...fav, suggestionForTodayScore: Math.random()*99 };
        })
        .sort((a, b) => {
            return b.suggestionForTodayScore - a.suggestionForTodayScore;
        });
        
    } else {
        // Error de token incorrecto
        return new Error("Validación incorrecta")
    }
}

// Función que busca las películas buscadas por keyword por un usuario autenticado
async function obtenerBusqueda(email, token, apiKey, keyword) {

    // Valido que el token corresponda al usuario
    const token_valido = await validacionToken(email, token);

    // De corresponderse, devuelvo las películas favoritas del usuario
    // De lo contrario, retorno error
    if (token_valido) {  

        // Si el keyword es vacio, busco los discover. Sino, busco por keyword
        if (keyword === '') {
            
            // Realizo la solicitud de los discover
            var resultado = await tmdbDiscover(apiKey);

            // Modifico los elementos de resultado agregando el campo suggestionScore a cada elemento
            // suggestionScore es un número real aleatorio entre 0 y 99 
            // Finalmente, ordeno la lista por suggestionScore de forma decreciente y retorno
            return resultado.map(pelicula => {
                return { ...pelicula, suggestionScore: Math.random()*99 };
            }).sort((a, b) => {
                return b.suggestionScore - a.suggestionScore;
            });

        } else {
            
            // Realizo la solicitud de la búsqueda por keyword
            var resultado = await tmdbSearch(apiKey, keyword);

            // Modifico los elementos de resultado agregando el campo suggestionScore a cada elemento
            // suggestionScore es un número real aleatorio entre 0 y 99 
            // Finalmente, ordeno la lista por suggestionScore de forma decreciente y retorno
            return resultado.map(pelicula => {
                return { ...pelicula, suggestionScore: Math.random()*99 };
            }).sort((a, b) => {
                return b.suggestionScore - a.suggestionScore;
            });
        };
    } else {
        // Error de token incorrecto
        return new Error("Validación incorrecta")
    };
}

// Función que agrega a favoritos una película seleccionada por un usuario autenticado
async function agregarFavorito(email, token, apiKey, movieId) {

    // Valido que el token corresponda al usuario
    const token_valido = await validacionToken(email, token);

    // De corresponderse, devuelvo las películas favoritas del usuario
    // De lo contrario, retorno error
    if (token_valido) {  

        // Realizo la solicitud de la búsqueda por id
        const resultado = await tmdbFind(apiKey, movieId);
        resultado.email = email;        // Agrego el email del usuario
        resultado.addedAt = new Date(); // Agrego el campo addedAt con la fecha actual
        
        // Defino el lector para leer el archivo linea por linea
        // Utilizado para saber si el usuario ya existe en el sistema
        const lector = readline.createInterface({
            input: fs.createReadStream('./favoritos.txt'),
            crlfDelay: Infinity
        });

        let aux = true; // Supongo que la película no está en favoritos

        // Función a ejecutar para cada línea del archivo
        lector.on("line", (linea) => {
            
            // Transformo la linea de texto del archivo en un JSON
            const favorito = JSON.parse(linea);

            // Entro al condicional si la película ya está ingresada como favorita para ese usuario
            if (resultado.id === favorito.id && resultado.email === favorito.email) {
                aux = false;    // La película ya está en favoritos
                lector.close(); // Cierro el lector porque ya está ingresada a favoritos de ese usuario
            }
        });

        // Código a ejecutar cuando el lector se cierra
        lector.on("close", () => {

            // Si la película no está en la lista de favoritas del usuario, entro al condicional
            if (aux) {
                
                // Agrego al archivo favoritos.txt el JSON de la película seleccionada
                fs.appendFile('./favoritos.txt', `${JSON.stringify(resultado)}\n`, { encoding: 'utf8', flag: 'a' }, (error) => {
                    if (error) throw error;
                    console.log('Nueva línea añadida correctamente');
                });
            }
        });
    } else {
        // Error de token incorrecto
        return new Error("Validación incorrecta")
    };
}

// Declaración de las funciones públicas
module.exports = {
    registrar,
    obtenerFavoritos,
    obtenerToken,
    obtenerBusqueda,
    agregarFavorito,
};