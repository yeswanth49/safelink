import sqlite3


conn = sqlite3.connect('profiles.db')

c = conn.cursor()

c.execute('select * from profiles')

print(c.fetchall())