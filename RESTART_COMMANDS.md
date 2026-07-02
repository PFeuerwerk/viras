# VIRAS restart commands

Run these commands from WSL, not from plain Windows PowerShell.

## 1. Go to the project

```bash
cd /home/rene/viras
```

## 2. Install dependencies

```bash
cd backend
npm ci
npm run prisma:generate

cd ../frontend
npm ci
```

## 3. Restore the database

The backend uses this connection string from `backend/.env`:

```text
postgresql://viras_user:****@localhost:5432/viras_db?schema=public
```

Create the databases if they do not exist:

```bash
PGPASSWORD=vati createdb -h localhost -U viras_user viras_db
PGPASSWORD=vati createdb -h localhost -U viras_user viras_shadow
```

Restore the backup:

```bash
PGPASSWORD=vati pg_restore -h localhost -U viras_user -d viras_db --clean --if-exists /home/rene/viras/db_bckp-15-05-2026.dump
```

Check restored tables:

```bash
PGPASSWORD=vati psql -h localhost -U viras_user -d viras_db -c "\dt public.*"
```

## 4. Verify builds

```bash
cd /home/rene/viras/backend
npm run build

cd /home/rene/viras/frontend
npm run build
```

## 5. Start development servers

Open two WSL terminals.

Terminal 1:

```bash
cd /home/rene/viras/backend
npm run start:dev
```

Terminal 2:

```bash
cd /home/rene/viras/frontend
npm run start -- --host 0.0.0.0
```

Then open:

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/api/docs

