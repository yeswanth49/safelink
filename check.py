import psycopg2


conn = psycopg2.connect('postgresql://yeswanth:aE1Nl3DJj47d3LUOvL86Xnyuv3k02PL2@dpg-ctmnetbqf0us738fggr0-a/safelink')

c = conn.cursor()

c.execute('select * from profiles')

print(c.fetchall())

c.close()
conn.close()