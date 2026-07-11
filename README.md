# Tailor Software

## Backend Setup

1. Create a `.env` file and configure the required environment variables.

2. Navigate to the backend directory.

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

---

## Create Dummy Admin

Open your MySQL terminal and run the following query:

```sql
INSERT INTO users (name, mobile_no, password_hash, role)
VALUES (
    'abc',
    '123',
    '$2a$10$VcHxb.Isoe8J6U15fvJFvOhgF.pGwF2yOR9QZenxJXKNgFaHvp2Ti',
    'admin'
);
```

Use the following credentials to log in:

- **Mobile Number:** `123`
- **Password:** `123`

---

## Frontend Setup

1. Navigate to the frontend directory.

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```
