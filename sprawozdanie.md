# SPRAWOZDANIE Z PROJEKTU

**Przedmiot:** Programowanie aplikacji WWW w technologii Java  
**Prowadzący:** dr inż. Urszula Kużelewska  
**Kierunek:** Informatyka, Semestr IV, Grupa PS11  
**Uczelnia:** Politechnika Białostocka  
**Imię i Nazwisko:** Aleksander Kozłowski  
**Numer Indeksu:** 114387  
**Data:** 15 czerwca 2026 r.  

### OPIS ARCHITEKTURY SYSTEMU

Niniejsze sprawozdanie przedstawia dokumentację techniczną oraz realizację wymagań projektowych z podziałem na klasy, kontrolery i moduły funkcjonalne aplikacji **Noted**.

### 🛠️ NoteController
Główny kontroler biznesowy odpowiedzialny za zarządzanie zasobami notatek w systemie.
* **Modyfikacja danych (CRUD):** Metody `createNote`, `updateById`, `deleteById`.
* **Wyświetlanie informacji właściciela:** Metoda `findAll` (filtrowanie kontekstowe na podstawie zalogowanego użytkownika).
* **Filtrowanie i wyszukiwanie:** Metoda `findAllByCategories` (obsługa słownika kategorii).
* **Udostępnianie zasobów:** Metoda `shareById` (zarządzanie flagami widoczności notatek publicznych).
* **Moduł Administracyjny (Admin Overrides):** Metody `adminGetAllNotesByUserId`, `adminOverrideNote`, `adminPurgeNote`, `adminSetNoteSharedStatus`.

### 👥 UserController
Komponent odpowiedzialny za zarządzanie encjami użytkowników, profilem oraz mechanizmami kontroli dostępu (RBAC).
* **Rejestracja:** Metoda `register` (tworzenie konta z walidacją reguł biznesowych).
* **Audyt Systemowy:** Metoda `getAllUsers` (dostępna wyłącznie dla roli `ROLE_ADMIN`).
* **Zarządzanie uprawnieniami:** Metody `addUserRole`, `removeUserRole`, `getAllRolesFromUser`.

### 🔐 AuthController
* **Autentykacja:** Metoda `login` obsługująca proces uwierzytelniania, walidację poświadczeń oraz generowanie tokenów sesyjnych.

### 🏷️ CategoryController
Odpowiada za obsługę słownika klasyfikacji (kategorii) przypisywanych do notatek.
* **Inicjalizacja struktur:** Metoda `create`.
* **Zarządzanie kolekcją:** Metody `getAllMyCategories`, `getById`, `updateById`, `deleteById`.

---

### 🛡️ Warstwa Bezpieczeństwa (SecurityConfig)
* **Spring Security Core:** Deklaratywna konfiguracja zabezpieczeń punktów końcowych (endpoints), interceptory filtrów autoryzacyjnych, zarządzanie cyklem życia sesji oraz implementacja bezstanowej weryfikacji tokenów.

### 🗄️ Warstwa Danych i Persystencji
* **Migracja Bazy Danych:** Kontrola schematu relacyjnego zrealizowana przy użyciu narzędzia Liquibase (`src/main/resources/db/changelog/changes/01-initial-schema.yaml`).
* **Modelowanie Domonowe (ORM):** Definicje encji mapowania obiektowo-relacyjnego: `User`, `Category`, `Role`, `Note` (`src/main/java/org/example/model`).

### 🌐 Warstwa Prezentacji (UI)
* **Widoki Serwerowe / Asynchroniczne:** Szablony renderowania widoków w katalogu `src/main/resources/templates` zintegrowane z natywnym interfejsem skryptowym JavaScript (`src/main/resources/static`) realizującym asynchroniczne żądania API (Fetch API), dynamiczną manipulację drzewem DOM oraz walidację po stronie klienta.