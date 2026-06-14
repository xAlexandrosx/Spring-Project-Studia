Szczegółowe funkcjonalności, full user (19p):

● dodanie/edycja/usunięcie przez siebie zebranych informacji - 5p.
Klasa NoteController metody crud z adn @PreAuthorize

● Walidacja formularza - 1p.
UserRegistrationRequestDto
UserLoginRequestDto
CreateCategoryRequestDto
CreateNoteRequestDto
katalog /validation/user

● Edycja na danych bieżących - 1p.
Klasa NoteController metody crud z adn @PreAuthorize

● Dodanie nowej kategorii - 1p.
Klasa CategoryController metody crud z adn @PreAuthorize

● Wyświetlenie udostępnionych przez innych informacji - 2p.
Klasa NoteController metody crud z adn @PreAuthorize

● udostępnienie : ze wskazaniem na konkretnego użytkownika lub w linku - 1p.
Klasa NoteController metoda getNoteById może być użyta przez
niezalogowanego użytkownika. System sprawdza tylko czy
notatka ma status publiczna.

● Wyświetlanie “swoich” informacji: sortowanie w obu kierunkach (data, kategoria, alfabetycznie) - 2p.
● Filtrowanie według daty (od aktualnej) i kategorii (od najbardziej popularnej) - 2p.
Klasa NoteController metody crud z adn @PreAuthorize - wyświetlanie
my-notes.html - sortowanie (na frontendzie)

● Zapamiętanie kierunków i kryteriów sortowania - 1p.
brak

● Logowanie - 1p.
AuthenticationController

● Zapis do bazy danych dopiero przy wylogowaniu/wygaśnięciu sesji - 2p.
baza jest aktualizowana na bierząco

StoreEverything 50p.
Szczegółowe funkcjonalności niezalogowany (4p):
● Rejestracja - 1p.
● Walidacja formularza - 1p.
● Strona powitalna - 1p.
● Wyświetlenie informacji z udostępnionego linku - 1p.

Szczegółowe funkcjonalności, admin (2p):
● Wyśw. listy użytkowników - 1p.
● Zarządzanie rolami - 1p.

StoreEverything 50p.
Elementy techniczne (25p.):
● Kontrolery - 2p.
● Baza danych (co najmniej 2 tabele z relacją) - 5p.
● Widoki: formularze z walidacją (3 różne elementy), 5 różnych
znaczników Thymeleafa - 3p.+2p.
● Sesja - 2p.
● Ciasteczka - 1p.
● Usługa REST (do weryfikacji nazwy kategorii w słowniku) - 3p.
category repository
● Klient REST - 2p.
● Spring Security - 5p. (z bazą danych), 3p. (w pamięci)