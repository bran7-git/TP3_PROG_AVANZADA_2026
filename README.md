## Informe de Persistencia de Datos (Media Carilla)

### Comportamiento observado:
1. **Creación de datos:** Se creó una nueva tarea ejecutando una petición `POST /tasks`[cite: 1, 6].
2. **Reinicio de la API (`docker compose restart`):** La tarea creada se mantuvo intacta y continúo figurando en la respuesta de `GET /tasks`[cite: 1, 3, 6].
3. **Eliminación del volumen (`docker compose down -v`):** Al eliminar el volumen y volver a levantar el entorno con `docker compose up --build`, los datos creados por el usuario se perdieron y reaparecieron únicamente las tareas iniciales provistas por `db/init.sql`[cite: 1, 5].

### Justificación técnica:
Los contenedores de Docker son efímeros por diseño. La información creada no se almacena dentro de la capa leíble/escribible del contenedor de la API (`api`), sino dentro del contenedor PostgreSQL (`db`), el cual mapea su directorio de datos hacia un **volumen nombrado de Docker** (`todo_pgdata`)[cite: 1, 3, 4].

* Al reiniciar o recrear los contenedores con `docker compose restart` o `docker compose down`, el servicio de base de datos se vuelve a conectar al mismo volumen, preservando los registros[cite: 1, 3, 4].
* Al ejecutar `docker compose down -v`, el flag `-v` ordena explícitamente remover los volúmenes persistentes. Al borrarse el volumen `todo_pgdata`, PostgreSQL vuelve a iniciar en un estado limpio y ejecuta el script `db/init.sql` por primera vez para cargar los datos iniciales[cite: 1, 5].

