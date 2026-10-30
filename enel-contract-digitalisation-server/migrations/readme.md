Run the following index on the production server

```sql
CREATE INDEX session_type_last_page_abandon_type_status ON session USING btree 
(type, status, cron_rejection_date, ee_last_page, gaz_last_page, abandon_type, 
((client ->> 'telefon_fix'::TEXT)), 
((client ->> 'telefon_mobil'::TEXT)), 
((client ->> 'email'::TEXT)), 
((client ->> 'cnp'::TEXT))
)
```