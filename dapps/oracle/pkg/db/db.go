package db

type DB struct {
	value string
}

func New() *DB {
	return &DB{value: ""}
}

func (db *DB) Set(value string) {
	db.value = value
}

func (db *DB) Get() string {
	return db.value
}
