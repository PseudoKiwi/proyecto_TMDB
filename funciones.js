const readline = require("readline");
const fs = require("fs");
const crypto = require('crypto');
const http = require('http');

function registrar(email, firstName, lastName, password) {

    const hashHex = crypto.createHash('sha256').update(password).digest('hex');
    const token = crypto.randomBytes(32).toString('hex');

    var nuevo = {
        email : email,
        firstName : firstName,
        lasName : lastName,
        password : hashHex,
        token : token
    }
    
    const lector = readline.createInterface({
        input: fs.createReadStream('./users.txt'),
        crlfDelay: Infinity
    });

    let aux = true; // Suponemos que no existe el email en el archivo

    lector.on("line", (line) => {
        const user = JSON.parse(line);
        if (user.email === email) {
            aux = false; // El email ya existe
        }
    });

    lector.on("close", () => {
        if (aux) {
            fs.appendFile('./users.txt', `${JSON.stringify(nuevo)}\n`, { encoding: 'utf8', flag: 'a' }, (error) => {
                if (error) throw error;
                console.log('Nueva línea añadida correctamente');
            });
        }
    });
}

function auth(email) {
    return new Promise((resolve, reject) => {
        let token = '';

        const lector = readline.createInterface({
            input: fs.createReadStream('./users.txt'),
            crlfDelay: Infinity,
        });

        lector.on("line", linea => {
            const user = JSON.parse(linea);
            if (email === user.email) {
                token = user.token;
            }
        });

        lector.on("close", () => {
        if (token) {
            resolve(token);
        } else {
            reject("Autenticación fallida");
        }
        });

        lector.on("error", error => {
        reject(error);
        });
    });
}

async function autenticar(email) {
    try {
        const token = await auth(email);
        return token
    } catch (error) {
        console.error("Error:", error);
    }
}

function favs(email) {
    return new Promise((resolve, reject) => {
        let favoritas = [];
        
        const lector = readline.createInterface({
            input: fs.createReadStream('./favoritos.txt'),
            crlfDelay: Infinity,
        });

        lector.on("line", linea => {
            let userFav = JSON.parse(linea);
            let r = Math.random()*99;
            if (userFav.email === email) {
                let nuevoFav = { ...userFav, suggestionForTodayScore: r };
                favoritas.push(nuevoFav);
            }
        });

        lector.on("close", () => {
            resolve(favoritas);
        });

        lector.on("error", error => {
            reject(error);
        });
    });
}

function validacionToken(email, token) {
    return new Promise((resolve, reject) => {
        let validado = false; // Inicialmente, no se ha autenticado

        const lector = readline.createInterface({
            input: fs.createReadStream('./users.txt'),
            crlfDelay: Infinity,
        });

        lector.on("line", linea => {
            let user = JSON.parse(linea);
            if (email === user.email && token === user.token) {
                validado = true
            }
        });

        lector.on("close", () => {
            if (validado) {
                resolve(validado)
            } else {
                reject(new Error('Error al obtener favoritos'));
            }
        });

        lector.on("error", error => {
            reject(error); // Rechaza la promesa si se produce un error
        });
    });
}

async function obtenerFavoritos(email, token) {
    const token_valido = await validacionToken(email, token);
    if (token_valido) {
        var favoritos = await favs(email);
        const ret = favoritos.sort((a, b) => {
            return b.suggestionForTodayScore - a.suggestionForTodayScore;
        });
        return ret;
    }
}

function tmdbSearch(apiKey, searchTerm) {
    return new Promise((resolve, reject) => {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
  
      http.get(`http://api.themoviedb.org/3/search/movie?query=${encodedSearchTerm}&api_key=${apiKey}`, (tmdbRes) => {
        if (tmdbRes.statusCode !== 200) {
          reject(new Error(`Error: ${tmdbRes.statusCode}`));
          return;
        }
  
        let data = [];
  
        tmdbRes.on('data', (chunk) => {
          data.push(chunk);
        });
  
        tmdbRes.on('end', () => {
          const responseJSON = JSON.parse(Buffer.concat(data).toString());
          resolve(responseJSON);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

function tmdbDiscover(apiKey) {
    return new Promise((resolve, reject) => {
        http.get(`http://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`, (tmdbRes) => {
        if (tmdbRes.statusCode !== 200) {
            reject(new Error(`Error: ${tmdbRes.statusCode}`));
            return;
        }

        let data = [];

        tmdbRes.on('data', (chunk) => {
            data.push(chunk);
        });

        tmdbRes.on('end', () => {
            const responseJSON = JSON.parse(Buffer.concat(data).toString());
            resolve(responseJSON);
        });
        }).on('error', (err) => {
        reject(err);
        });
    });
}

function tmdbFind(apiKey, movieId) {
    return new Promise((resolve, reject) => {
        console.log(movieId)
        http.get(`http://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`, (tmdbRes) => {
        if (tmdbRes.statusCode !== 200) {
            reject(new Error(`Error: ${tmdbRes.statusCode}`));
            return;
        }

        let data = [];

        tmdbRes.on('data', (chunk) => {
            data.push(chunk);
        });

        tmdbRes.on('end', () => {
            const responseJSON = JSON.parse(Buffer.concat(data).toString());
            resolve(responseJSON);
        });
        }).on('error', (err) => {
        reject(err);
        });
    });
}

async function getSearch(email, token, apiKey, searchTerm) {
    const token_valido = await validacionToken(email, token);
    if (token_valido) {  
        if (searchTerm == '') {
            var resultado = await tmdbDiscover(apiKey);
            return resultado['results'].map(pelicula => {
                return {suggestionScore : Math.random()*99, titulo : pelicula.title,
                    estreno : pelicula.release_date, id : pelicula.id}
            }).sort((a, b) => {
                return b.suggestionScore - a.suggestionScore;
            });
        } else {
            var resultado = await tmdbSearch(apiKey, searchTerm);
            return resultado['results'].map(pelicula => {
                return {suggestionScore : Math.random()*99, titulo : pelicula.title,
                    estreno : pelicula.release_date, id : pelicula.id}
            }).sort((a, b) => {
                return b.suggestionScore - a.suggestionScore;
            });
        };
    };
}

async function addFav(email, token, apiKey, movieId) {
    const token_valido = await validacionToken(email, token);
    if (token_valido) {
        const resultado = await tmdbFind(apiKey, movieId);
        resultado.email = email;
        resultado.addedAt = new Date();
        
        const rd = readline.createInterface({
            input: fs.createReadStream('./favoritos.txt'),
            crlfDelay: Infinity
        });

        let aux = true; // Suponemos que la película no está en favoritos

        rd.on("line", (line) => {
            const favorito = JSON.parse(line);
            if (resultado.id === favorito.id && resultado.email === favorito.email) {
                aux = false; // La película ya está en favoritos
            }
        });

        rd.on("close", () => {
            if (aux) {
                fs.appendFile('./favoritos.txt', `${JSON.stringify(resultado)}\n`, { encoding: 'utf8', flag: 'a' }, (error) => {
                    if (error) throw error;
                    console.log('Nueva línea añadida correctamente');
                });
            }
        });
    }
}

module.exports = {
    registrar,
    obtenerFavoritos,
    autenticar,
    getSearch,
    addFav
};