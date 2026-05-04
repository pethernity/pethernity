# Deploy Pethernity su Google Cloud Run

Due servizi Cloud Run separati, entrambi con auto-deploy "Continuously deploy from a repository" (Cloud Build sotto, niente CI/CD scritto a mano):

| Servizio | Sorgente              | Build context     | Dockerfile          |
| -------- | --------------------- | ----------------- | ------------------- |
| BE       | repo GitHub, branch `main` | `pethernity_be/` | `pethernity_be/Dockerfile` |
| FE       | repo GitHub, branch `main` | `pethernity_fe/` | `pethernity_fe/Dockerfile` |

Stato che il backend si appoggia a:
- **Cloud SQL Postgres** (managed) — connessione tramite Unix socket `/cloudsql/<conn-name>`
- **Secret Manager** per ogni valore sensibile
- **Stripe** (webhook → URL Cloud Run del BE)
- **Firebase Auth** (autorizza il dominio del FE)

---

## 0) Prerequisiti (una sola volta)

```bash
gcloud config set project <PROJECT_ID>
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

Scegli una region (esempio: `europe-west1`) e usala per tutto.

---

## 1) Cloud SQL Postgres

```bash
gcloud sql instances create pethernity-db \
  --database-version=POSTGRES_16 \
  --region=europe-west1 \
  --tier=db-f1-micro \
  --storage-size=10GB

gcloud sql databases create pet_cemetery --instance=pethernity-db
gcloud sql users create pethernity --instance=pethernity-db --password='<scegli-una-password-forte>'
```

Annota la "instance connection name" (formato `PROJECT:REGION:INSTANCE`):
```bash
gcloud sql instances describe pethernity-db --format='value(connectionName)'
```

`DATABASE_URL` per Cloud Run sarà:
```
postgresql://pethernity:<PASSWORD>@localhost/pet_cemetery?host=/cloudsql/<CONN_NAME>&schema=public
```

Caratteri speciali nella password vanno URL-encoded.

---

## 2) Secret Manager

Crea un secret per ogni valore sensibile. Esempi:

```bash
# DATABASE_URL completo (con la password URL-encoded)
echo -n 'postgresql://pethernity:PASS@localhost/pet_cemetery?host=/cloudsql/PROJECT:REGION:pethernity-db&schema=public' \
  | gcloud secrets create DATABASE_URL --data-file=-

# JWT_SECRET — almeno 32 char random
openssl rand -base64 32 | gcloud secrets create JWT_SECRET --data-file=-

# Firebase Admin (esporta il JSON service account dal Firebase Console > Service Accounts)
# poi estrai i tre campi:
gcloud secrets create FIREBASE_PROJECT_ID --data-file=- <<< 'pixelmeadow-9cf1a'
gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=- <<< 'firebase-adminsdk-xxx@pixelmeadow-9cf1a.iam.gserviceaccount.com'
# La private key contiene newline reali: passala con --data-file (NON come stringa inline)
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=./firebase-private-key.txt

# Stripe
gcloud secrets create STRIPE_SECRET_KEY --data-file=- <<< 'sk_live_...'
gcloud secrets create STRIPE_PRICE_ID --data-file=- <<< 'price_...'
# Lo STRIPE_WEBHOOK_SECRET lo conosci solo DOPO aver creato l'endpoint webhook in Stripe (step 6)
```

---

## 3) Backend Cloud Run

Console GCP → **Cloud Run** → **Create service** → "Continuously deploy from a repository".

1. **Source repository**: autorizza GitHub e seleziona `pethernity` (repo monorepo)
2. **Branch**: `^main$`
3. **Build type**: Dockerfile
4. **Source location**: `/pethernity_be/Dockerfile`
5. **Service name**: `pethernity-be`
6. **Region**: `europe-west1`
7. **Authentication**: "Allow unauthenticated invocations"
8. **Container port**: `8080`
9. **Variables & Secrets** (tab):
   - **Environment variables (plain)**:
     - `NODE_ENV=production`
     - `COOKIE_NAME=petcem_auth`
     - `FRONTEND_ORIGIN=https://placeholder.run.app` ← lo sistemi DOPO aver deployato il FE
   - **Secrets (referenced as env vars)**:
     - `DATABASE_URL` → secret `DATABASE_URL` (latest)
     - `JWT_SECRET` → secret `JWT_SECRET`
     - `FIREBASE_PROJECT_ID` → secret `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL` → secret `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY` → secret `FIREBASE_PRIVATE_KEY`
     - `STRIPE_SECRET_KEY` → secret `STRIPE_SECRET_KEY`
     - `STRIPE_PRICE_ID` → secret `STRIPE_PRICE_ID`
     - `STRIPE_WEBHOOK_SECRET` → secret `STRIPE_WEBHOOK_SECRET` (lo crei vuoto ora, lo aggiorni allo step 6)
10. **Connections** (tab):
    - **Cloud SQL connections**: aggiungi `pethernity-db`
11. **Container** (tab):
    - **CPU allocation**: "CPU is only allocated during request processing" va bene; se attivi SSE (`/headstones/stream`) per molti client, scegli "CPU always allocated"
    - **Min instances**: `0` (o `1` se vuoi evitare cold start sull'SSE)
    - **Max instances**: `4` per partire
    - **Request timeout**: `3600` (per SSE long-lived)

Concedi al **service account di Cloud Run** (default `<NUM>-compute@developer.gserviceaccount.com`) i ruoli:
- `roles/secretmanager.secretAccessor`
- `roles/cloudsql.client`

```bash
SA=$(gcloud iam service-accounts list --filter='email:*-compute@*' --format='value(email)' | head -1)
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role=roles/cloudsql.client
```

Premi **Create**: il primo build parte da Cloud Build, e da quel momento ogni `git push` su `main` triggera build + deploy automatico.

URL risultante: `https://pethernity-be-XXXXX.europe-west1.run.app`

---

## 4) Frontend Cloud Run

Le `VITE_*` sono inlinete nel bundle al **build time**, quindi vanno passate come "Build environment variables" (= `--build-arg` Docker), non come runtime env.

Console GCP → **Cloud Run** → **Create service** → "Continuously deploy from a repository".

1. **Source repository**: stesso repo
2. **Branch**: `^main$`
3. **Build type**: Dockerfile
4. **Source location**: `/pethernity_fe/Dockerfile`
5. **Service name**: `pethernity-fe`
6. **Region**: `europe-west1`
7. **Authentication**: "Allow unauthenticated invocations"
8. **Container port**: `8080`
9. Nel pannello **Show advanced settings** → **Build environment variables** (sono i `--build-arg`):
   - `VITE_API_URL=https://pethernity-be-XXXXX.europe-west1.run.app` ← URL del BE creato allo step 3
   - `VITE_FIREBASE_API_KEY=AIzaSy...`
   - `VITE_FIREBASE_AUTH_DOMAIN=pixelmeadow-9cf1a.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID=pixelmeadow-9cf1a`
   - `VITE_FIREBASE_APP_ID=1:447283321975:web:...`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID=447283321975`
10. **Min instances**: `0`, **Max instances**: `4`

Premi **Create**. URL risultante: `https://pethernity-fe-XXXXX.europe-west1.run.app`

> **Importante**: cambiare `VITE_API_URL` richiede un **rebuild**, non basta un redeploy. Modifica la variabile e fai trigger di una nuova build (o un commit).

---

## 5) Aggiornare `FRONTEND_ORIGIN` sul BE

Torna al servizio `pethernity-be` → "Edit & deploy new revision":
- Aggiorna l'env `FRONTEND_ORIGIN` al vero URL del FE Cloud Run (es. `https://pethernity-fe-XXXXX.europe-west1.run.app`)
- Salva → nuova revision deployata in 30s

Questa è la `origin` consentita dal CORS (`@fastify/cors`), e finisce nei `success_url`/`cancel_url` di Stripe.

---

## 6) Stripe webhook

Stripe Dashboard → **Developers > Webhooks** → **Add endpoint**:
- URL: `https://pethernity-be-XXXXX.europe-west1.run.app/webhooks/stripe`
- Eventi: `checkout.session.completed` (sufficiente)

Stripe ti mostra la **Signing secret** (`whsec_...`). Aggiornala in Secret Manager:
```bash
echo -n 'whsec_...' | gcloud secrets versions add STRIPE_WEBHOOK_SECRET --data-file=-
```

Poi nel BE Cloud Run → "Edit & deploy new revision" → tab Variables & Secrets → assicurati che `STRIPE_WEBHOOK_SECRET` referenzi `latest` → Save (deploy nuova revision).

Test:
```bash
stripe trigger checkout.session.completed
```
Verifica nei log Cloud Run del BE che il webhook è verificato e crea l'Headstone.

---

## 7) Firebase Auth: domini autorizzati

Firebase Console → Authentication → Settings → **Authorized domains** → aggiungi:
- `pethernity-fe-XXXXX.europe-west1.run.app`
- l'eventuale dominio custom (es. `pethernity.com`)

Senza questo, `signInWithPopup(googleProvider)` viene bloccato nel browser.

---

## 8) (Opzionale, raccomandato) Prisma migrations vere

L'`entrypoint.sh` attuale fa fallback su `prisma db push` se non trova migrazioni: utile per il primo deploy ma sconsigliato in produzione perché può causare data loss su modifiche non additive.

Per passare a migrazioni versionate:

```bash
cd pethernity_be
# (richiede una connessione locale al DB di sviluppo)
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "feat(be): initial migration"
git push
```

Il prossimo deploy Cloud Run vedrà `prisma/migrations/` e applicherà `prisma migrate deploy` invece di `db push`.

---

## 9) Custom domain (opzionale)

Cloud Run → servizio → **Custom Domains** → mappa `api.pethernity.com` → `pethernity-be` e `pethernity.com` → `pethernity-fe`. GCP gestisce il certificato. Ricorda dopo:
- aggiornare `FRONTEND_ORIGIN` del BE
- ricreare il bundle FE con `VITE_API_URL=https://api.pethernity.com`
- aggiornare Stripe webhook URL e domini Firebase Auth

---

## Bootstrap order (TL;DR)

1. Cloud SQL + secrets
2. Deploy BE → ottieni URL
3. Deploy FE con `VITE_API_URL` = URL BE → ottieni URL
4. Aggiorna BE: `FRONTEND_ORIGIN` = URL FE → redeploy
5. Crea webhook Stripe → aggiorna `STRIPE_WEBHOOK_SECRET` → redeploy BE
6. Firebase Auth: aggiungi il dominio FE
7. (Opzionale) custom domain

---

## Troubleshooting veloce

- **Build fallita su `prisma generate`**: il Dockerfile installa `openssl`; se cambi base image controlla che il binario engine di Prisma trovi le sue dipendenze.
- **`PrismaClientInitializationError: P1001`**: la connessione al DB fallisce. Controlla `DATABASE_URL` (host = `/cloudsql/<conn>`), e che la "Cloud SQL connection" sia aggiunta nel servizio.
- **CORS bloccato dal browser**: `FRONTEND_ORIGIN` sul BE non corrisponde all'URL effettivo del FE.
- **Webhook Stripe risponde 400 "Invalid signature"**: `STRIPE_WEBHOOK_SECRET` su Cloud Run non corrisponde a quello dell'endpoint Stripe attuale.
- **SSE si chiude dopo 60s**: alza il request timeout del servizio Cloud Run BE a `3600`.
- **`signInWithPopup` fallisce con `auth/unauthorized-domain`**: aggiungi il dominio del FE in Firebase Auth.
