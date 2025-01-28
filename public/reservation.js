$(function () {
    const urlParams = new URLSearchParams(window.location.search);

    // Pobranie danych z URL
    const offerId = urlParams.get('offerId');
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const dorosli = parseInt(urlParams.get('dorosli')) || 0;
    const dzieci = parseInt(urlParams.get('dzieci')) || 0;
    const totalPrice = urlParams.get('totalPrice');
    const numberOfNights = urlParams.get('numberOfNights');

    const goscie = dorosli + dzieci;

    // Wyświetlenie danych na stronie
    $('#offerId').text(offerId || 'Brak danych');
    $('#checkin').text(checkin || 'Brak danych');
    $('#checkout').text(checkout || 'Brak danych');
    $('#goscie').text(goscie);
    $('#totalPrice').text(totalPrice || 'Brak danych');
    $('#numberOfNights').text(numberOfNights || 'Brak danych');

    // Przekazanie danych do ukrytych pól formularza
    $('#offerIdHidden').val(offerId);
    $('#checkinHidden').val(checkin);
    $('#checkoutHidden').val(checkout);
    $('#goscieHidden').val(goscie);
    $('#totalPriceHidden').val(totalPrice);
    $('#numberOfNightsHidden').val(numberOfNights);

    // Obsługa wysłania formularza
    $(document).ready(function () {
        $('#reservation-form').off('submit').on('submit', function (e) {
            e.preventDefault(); // Zapobiega domyślnemu wysyłaniu formularza

            // Pobieranie danych z formularza
            const firstName = $('#firstName').val();
            const lastName = $('#lastName').val();
            const email = $('#email').val();
            const country = $('#country').val();
            const phone = $('#phone').val();

            // Pobieranie ukrytych pól
            const offerId = $('#offerIdHidden').val();
            const checkin = $('#checkinHidden').val();
            const checkout = $('#checkoutHidden').val();
            const goscie = $('#goscieHidden').val();
            const numberOfNights = $('#numberOfNightsHidden').val();
            const totalPrice = $('#totalPriceHidden').val();

            // Walidacja danych
            if (!firstName || !lastName || !email || !country || !phone || !offerId || !checkin || !checkout || !goscie || !numberOfNights || !totalPrice) {
                alert('Wszystkie pola są wymagane!');
                return;
            }

            // Walidacja imienia i nazwiska (tylko litery)
            const nameRegex = /^[A-Za-z]+$/;
            if (!nameRegex.test(firstName)) {
                alert('Imię może zawierać tylko litery.');
                return;
            }
            if (!nameRegex.test(lastName)) {
                alert('Nazwisko może zawierać tylko litery.');
                return;
            }

            // Walidacja adresu email
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(email)) {
                alert('Podaj poprawny adres email.');
                return;
            }

            // Walidacja numeru telefonu (przykład dla polskiego numeru telefonu)
            const phoneRegex = /^[0-9]{9}$/; // Polskie numery składają się z 9 cyfr
            if (!phoneRegex.test(phone)) {
                alert('Numer telefonu powinien zawierać 9 cyfr.');
                return;
            }

            // Wysłanie danych do backendu (AJAX)
            $.ajax({
                url: 'http://localhost:3000/save-reservation', // Endpoint backendu
                method: 'POST', // Metoda HTTP
                contentType: 'application/json', // Format danych
                data: JSON.stringify({
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
                }),
                success: function (response) {
                    alert('Rezerwacja zakończona sukcesem!'); // Powiadomienie o sukcesie
                    console.log('Serwer odpowiedział:', response);
                },
                error: function (xhr, status, error) {
                    console.error('Błąd podczas rezerwacji:', error); // Wyświetlenie błędu
                    alert('Wystąpił problem z rezerwacją. Spróbuj ponownie później.');
                }
            });
        });
    });
});
