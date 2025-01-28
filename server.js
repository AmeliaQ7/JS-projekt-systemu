const express = require('express'); // Importuj Express
const mysql = require('mysql2');   // Importuj mysql2
const path = require('path');
const app = express();             // Zainicjuj aplikację Express

app.use(express.json());

// Konfiguracja połączenia z bazą danych
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'sigma_hotel'
});

// Obsługa błędów połączenia z bazą
db.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych:', err);
        return;
    }
    console.log('Połączono z bazą danych MySQL');
});

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API do pobierania ofert
// Endpoint API do pobierania ofert
app.get('/api/offers', (req, res) => {
    const { city, dataZameldowania, dataWymeldowania, goscie } = req.query;

    // Walidacja parametrów
    if (!city || !dataZameldowania || !dataWymeldowania || !goscie) {
        return res.status(400).json({ error: 'Brak wymaganych parametrów' });
    }

    // Zamiana dat na format MySQL
    const checkinDate = new Date(dataZameldowania);
    const checkoutDate = new Date(dataWymeldowania);

    // Zapytanie SQL - Sprawdzenie, czy istnieje już rezerwacja w podanym okresie
    const query = `
        SELECT offer_id, name, image_url, address, longitude, latitude, room_description, price_per_night, max_customers, city
        FROM offers o
        WHERE o.city = ? 
          AND o.max_customers >= ?
          AND NOT EXISTS (
            SELECT 1
            FROM reservations r
            WHERE r.offer_id = o.offer_id
              AND (
                (r.checkin <= ? AND r.checkout >= ?)
                OR (r.checkin <= ? AND r.checkout >= ?)
              )
          )
    `;

    // Wykonanie zapytania, sprawdzając dostępność pokoju
    db.query(query, [city, goscie, checkoutDate, checkoutDate, checkinDate, checkinDate], (err, results) => {
        if (err) {
            console.error('Błąd zapytania SQL:', err);
            return res.status(500).json({ error: 'Błąd bazy danych' });
        }

        // Jeśli brak ofert, zwróć odpowiedni komunikat
        if (results.length === 0) {
            return res.status(200).json({ message: 'Brak dostępnych ofert w tym terminie' });
        }

        // Zwrócenie dostępnych ofert
        res.json(results);
    });
});


// Endpoint do zapisu rezerwacji
app.post('/save-reservation', (req, res) => {
    const {
        firstName,
        lastName,
        email,
        country,
        phone,
        offerId,
        checkin,
        checkout,
        goscie,
        numberOfNights,
        totalPrice
    } = req.body;

    if (!firstName || !lastName || !email || !country || !phone || !offerId ||  !checkin || !checkout || !goscie || !numberOfNights || !totalPrice) {
        return res.status(400).json({ error: 'Brak wymaganych danych!' });
    }

    const query = `
        INSERT INTO reservations (offer_id, number_of_people, number_of_nights, total_price, checkin, checkout, first_name, last_name, email, country, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ;
    const values = [offerId, goscie, numberOfNights, totalPrice, checkin, checkout, firstName, lastName, email, country, phone];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Błąd podczas zapisu do bazy:', err);
            return res.status(500).send('Wystąpił błąd podczas zapisu danych.');
        }
        res.status(200).send('Rezerwacja została zapisana pomyślnie!');
    });
});
    
// Uruchomienie serwera
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});

db.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Nie udało się połączyć z bazą danych:', err);
    } else {
        console.log('Połączenie z bazą danych działa poprawnie:', results);
    }
});  
