# proyecto_TMDB
<div style="text-align: justify;">
A continuación se provee documentación sobre cada ENDPOINT implementado. Se especificará un body de ejemplo para cada uno. La API desarrollada escucha solicitudes por el puerto 8081.
</div>

## Registrar usuario

<div style="text-align: justify;">
ENDPOINT tipo POST utilizado para registrar un nuevo usuario en el sistema. Los datos solicitados son un correo electrónico, su nombre, apellido y contraseña. El ENDPOINT será consumido por la URL '/registrar'.

Un posible body de la llamada HTTP del cliente es el siguiente.
</div>

```json
{
    "email": "prueba@gmail.com",
    "firstName": "H",
    "lastName": "M",
    "password": "holamundo"
}
```

<div style="text-align: justify;">
Si el correo no fue previamente registrado, se encriptará la contraseña y guardarán los datos en formato JSON dentro del archivo users.txt. En caso contrario, se retornará un error al cliente diciendo que ya existe este usuario.

Luego de validado el nuevo usuario, se le asignará una apiKey estática que será guardada junto a sus datos en el archivo.
</div>

## Autenticar usuario

<div style="text-align: justify;">
ENDPOINT tipo POST utilizado para obtener el apiKey de un usuario registrado. El ENDPOINT será consumido por la URL '/autenticar'.

Un body ejemplo para la llamada HTTP del cliente se proporciona a continuación. Un usuario será autenticado si este se registró previamente y si la contrsaeña coincide.
</div>

```json
{
    "email": "prueba@gmail.com",
    "password": "holamundo"
}
```

<div style="text-align: justify;">
De cumplirse los requisitos, se devolverá un JSON al cliente con el atributo 'token' con la apiKey correspondiente.

Todos los ENDPOINTS que requieran autorización deben recibir el header 'token' cuyo valor será la apiKey del usuario autenticado.
</div>

## Obtener películas

<div style="text-align: justify;">
ENDPOINT tipo GET utilizado para realizar una búsqueda de películas a la API de TMDB (The Movie DataBase). El ENDPOINT será consumido por la URL '/buscar'.

Un posible body de la llamada HTTP del cliente es el siguiente. En este se proporciona el email del usuario y la keyword de búsqueda, siendo el título de la película.
</div>

```json
{
    "email": "prueba@gmail.com",
    "keyword": "Jack Reacher"
}
```

<div style="text-align: justify;">
En caso de no querer buscar por keyword, puede especificarse el keyword vacio y se devolverá la lista de películas 'discover' de la API de TMDB.
</div>

```json
{
    "email": "prueba@gmail.com",
    "keyword": ""
}
```

<div style="text-align: justify;">
La aplicación cliente recibirá una lista de JSON ordenada según el atributo suggestionScore aleatorio entre 0 y 99. Los resultados son los obtenidos de la primera página de resultados.

Este ENDPOINT requiere autenticación previa, por lo que el header 'token' con la apiKey del usuario debe ser enviado en el request.
</div>

## Agregar película a favoritos

<div style="text-align: justify;">
ENDPOINT tipo POST utilizado para agregar una película obtenida de la búsqueda a la lista de favoritos del usuario. El ENDPOINT será consumido por la URL '/agregarFavorito'.

Un posible body de la llamada HTTP del cliente es el siguiente. En este se especifican el email del usuario y el id de la película a guardar en sus favoritos.
</div>

```json
{
    "email": "prueba@gmail.com",
    "id": 75780
}
```

<div style="text-align: justify;">
Se realizará una consulta a la API de TMDB buscando específicamente la película solicitada. Una vez obtenida, se le agrega al JSON obtenido el usuario que la solicitó y un nuevo atributo 'addedAt' que denota la fecha en la que fue ingresada al sistema. Los favoritos se guardan en el archivo favoritos.txt en formato JSON.

Este ENDPOINT requiere autenticación previa, por lo que el header 'token' con la apiKey del usuario debe ser enviado en el request.
</div>

## Obtener películas favoritas

<div style="text-align: justify;">
ENDPOINT tipo GET utilizado para obtener del archivo favoritos.txt la lista de películas favoritas de un usuario. El ENDPOINT será consumido por la URL '/favoritos'.

Un posible body de la llamada HTTP del cliente es el siguiente. Solamente el email es necesario en esta consulta.
</div>

```json
{
    "email": "prueba@gmail.com"
}
```

<div style="text-align: justify;">
Se realizará la búsqueda comparando los usuarios de cada entrada, construyendo una lista de todos los JSON que pertenezcan al usuario solicitante. Se devuelve a la aplicación cliente un JSON donde el atributo 'resultado' es la lista de películas ordenadas por el valor suggestionForTodayScore aleatorio entre 0 y 99.

Este ENDPOINT requiere autenticación previa, por lo que el header 'token' con la apiKey del usuario debe ser enviado en el request.
</div>


## Pruebas

<div style="text-align: justify;">
Para ahorrarse tiempo, puede utilizar el siguiente JSON de base para probar y verificar el funcionamiento de todos los ENDPOINTS, ya que solo los atributos necesarios para cada uno serán utilizados
</div>

```json
{
    "email": "prueba@gmail.com",
    "firstName": "H",
    "lastName": "M",
    "password": "holamundo",
    "keyword": "",
    "id": 75780
}
```