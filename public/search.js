$(function () {
    const urlParams = new URLSearchParams(window.location.search);

    // Pobranie danych z URL
    const city = urlParams.get('miasto');
    const dataZameldowania = urlParams.get('checkin');
    const dataWymeldowania = urlParams.get('checkout');
    const dorosli = parseInt(urlParams.get('dorosli')) || 0;
    const dzieci = parseInt(urlParams.get('dzieci')) || 0;
    const goscie = dorosli + dzieci;

    if (dzieci === 0) {
        $('#dzieci').parent().hide();
    }

    // Zamiana dat na obiekty Date
    const checkinDate = new Date(dataZameldowania);
    const checkoutDate = new Date(dataWymeldowania);

    // Sprawdzenie, czy daty są poprawne
    if (isNaN(checkinDate) || isNaN(checkoutDate)) {
        console.error("Błąd w formacie daty.");
        return;
    }

    // Obliczenie różnicy w dniach
    const timeDifference = checkoutDate - checkinDate; // różnica w milisekundach
    const numberOfNights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // konwersja na dni, zaokrąglanie w górę

    // Wyświetlanie wartości w HTML
    $('#miasto').text(city || 'Brak danych');
    $('#checkin').text(dataZameldowania || 'Brak danych');
    $('#checkout').text(dataWymeldowania || 'Brak danych');
    $('#dorosli').text(dorosli || 'Brak danych');
    $('#dzieci').text(dzieci || 'Brak danych');
    $('#goscie').text(goscie);
    $('#numberOfNights').text(numberOfNights);

    // Wysłanie zapytania do serwera
    $.ajax({
        url: 'http://localhost:3000/api/offers',
        method: 'GET',
        data: {
            city: city,
            dataZameldowania: dataZameldowania,
            dataWymeldowania: dataWymeldowania,
            goscie: goscie,
        },
        dataType: 'json',
        success: function (data) {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = ''; // Czyszczenie wyników

            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>Brak dostępnych ofert</p>';
                return;
            }

            // Wyświetlanie wyników
            data.forEach((offer, index) => {
                const totalPrice = offer.price_per_night * numberOfNights; // Obliczenie ceny za wszystkie noce

                const offerElement = document.createElement('div');
                offerElement.classList.add('offer');
                offerElement.innerHTML = `
                    <h3>${offer.name}</h3>
                    <img src="${offer.image_url}" alt="${offer.name}" />
                    <p>Adres: ${offer.address}</p>
                    <p>Opis pokoju: ${offer.room_description}</p>
                    <p>Cena za noc: ${offer.price_per_night} zł</p>
                    <p>Cena za ${numberOfNights} nocy: ${totalPrice} zł</p>
                    <p>Maksymalna liczba osób: ${offer.max_customers}</p>
                    <p>Miasto: ${offer.city}</p>
                    <div class="map-container">
                        <div id="map-${index}" class="map"></div>
                    </div>
                    <button onclick="handleReservation('${offer.offer_id}', ${totalPrice}, ${numberOfNights})">Rezerwuj</button>
                `;
                resultsContainer.appendChild(offerElement);

                // Inicjalizacja mapy dla każdej oferty
                const map = L.map(`map-${index}`).setView([offer.latitude, offer.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);

                // Dodanie markera
                L.marker([offer.latitude, offer.longitude])
                    .addTo(map)
                    .bindPopup(`<b>${offer.name}</b><br>${offer.address}`)
                    .openPopup();
            });
        },
        error: function (xhr, status, error) {
            console.error("Błąd połączenia z API:", error);
            alert("Wystąpił problem z połączeniem z serwerem.");
        }
    });
});

// Funkcja obsługująca rezerwację
function handleReservation(offerId, totalPrice, numberOfNights) {
    const urlParams = new URLSearchParams(window.location.search);
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const dorosli = parseInt(urlParams.get('dorosli')) || 0;
    const dzieci = parseInt(urlParams.get('dzieci')) || 0;

     
    // Zbudowanie URL docelowej strony
    const targetUrl = `reservation.html?offerId=${offerId}&checkin=${checkin}&checkout=${checkout}&dorosli=${dorosli}&dzieci=${dzieci}&totalPrice=${totalPrice}&numberOfNights=${numberOfNights}`;

    console.log("Przekierowanie na URL:", targetUrl); // Pomocnicze logowanie

    // Przejście na stronę z danymi w URL
    window.location.href = targetUrl;
}


