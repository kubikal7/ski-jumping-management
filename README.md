# Ski Jumping Management

Aplikacja do zarządzania kadrą w skokach narciarskich

---

## Wymagania

- Docker Desktop (Windows/macOS) lub Docker Engine (Linux)
- Docker Compose

---

## Instalacja Dockera

### Windows / macOS
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Uruchomienie Docker Desktop i upewnienie się, że działa

### Linux
1. Instalacja Docker Engine według instrukcji dla swojej dystrybucji: [Docker Engine](https://docs.docker.com/engine/install/)
2. Instalacja Docker Compose: [Docker Compose](https://docs.docker.com/compose/install/)
3. Upewnienie się, że Docker działa:  

```bash
docker --version
docker compose version
```

## Klonowanie projektu

```bash
git clone https://github.com/kubikal7/ski-jumping-management.git
cd ski-jumping-management
```

## Uruchomienie projektu

```bash
docker compose up --build
```

## Dostęp do aplikacji

Po uruchomieniu kontenerów, aplikacja frontendowa jest dostępna w przeglądarce pod adresem:

- **Frontend (aplikacja webowa): [http://localhost:80](http://localhost:80)** – należy przejść na ten adres, aby korzystać z systemu (login i hasło poniżej)
- Backend API: [http://localhost:8080](http://localhost:8080)  
- Baza danych PostgreSQL: `localhost:5432`, baza: `ski_jumping_management_db`, użytkownik: `postgres`, hasło: `admin`

### Logowanie do systemu

Można zalogować się na konto administratora:

- **Login:** `admin`  
- **Hasło:** `Admin1234!`

## Dostęp do bazy danych

Po uruchomieniu projektu mozna połączyć się z bazą danych

```bash
docker exec -it ski-jumping-management-database psql -U postgres -d ski_jumping_management_db
```