
`mvn clean package`

Aplkiacja do przechowywania informacji
zapisywanie informacji
udostępnianie innym
przeglądanie
przeszukiwanie

model: note
- title (3-20)
- content (5-500)
- date_added
- category

model: category
- name (3-20 lowercase)

model: user
- firstName (3-20 first uppercase)
- lastName (3-50 first uppercase)
- login (3-20 lowercase)
- password (5+)
- age (18+)

Roles:
admin: manage users

limited user: registered, open shared notes,  cant create notes

full user: create notes, share notes, open notes



guest: only see start page and log in page