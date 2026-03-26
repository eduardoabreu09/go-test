package tests

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type BeginnerMock struct {
	Tx  pgx.Tx
	Err error
}

func (m BeginnerMock) Begin(ctx context.Context) (pgx.Tx, error) {
	return m.Tx, m.Err
}

type TxMock struct{}

func (m *TxMock) Begin(ctx context.Context) (pgx.Tx, error) {
	return m, nil
}

func (m *TxMock) Commit(ctx context.Context) error {
	return nil
}

func (m *TxMock) Rollback(ctx context.Context) error {
	return nil
}

func (m *TxMock) CopyFrom(ctx context.Context, tableName pgx.Identifier, columnNames []string, rowSrc pgx.CopyFromSource) (int64, error) {
	return 0, nil
}

func (m *TxMock) SendBatch(ctx context.Context, b *pgx.Batch) pgx.BatchResults {
	return nil
}

func (m *TxMock) LargeObjects() pgx.LargeObjects {
	return pgx.LargeObjects{}
}

func (m *TxMock) Prepare(ctx context.Context, name, sql string) (*pgconn.StatementDescription, error) {
	return nil, nil
}

func (m *TxMock) Exec(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, nil
}

func (m *TxMock) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	return nil, nil
}

func (m *TxMock) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return nil
}

func (m *TxMock) Conn() *pgx.Conn {
	return nil
}
